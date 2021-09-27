// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { PanelLeftMenu } from "../components/PanelLeftMenu";
import { ResourceExplorer, ThumbnailSizes } from "../components/ResourceExplorer";
import { TreePanel, TreePanelNode } from "../components/TreePanel";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";

interface ResourceExplorerEmbellishmentsProps extends EditorPropsBase {
    id: string;
    thumbnailsSize: ThumbnailSizes;
    onExpanded?: (panel: PanelLeftMenu) => void;
}
interface ResourceExplorerBackgroundsRefs {
    panel?: PanelLeftMenu;
    resourceExplorer?: ResourceExplorer;
}

interface IResourceExplorerEmbellishmentsStates {
    isCoverRestricted?: boolean;
}
export class ResourceExplorerEmbellishments extends React.Component<ResourceExplorerEmbellishmentsProps, IResourceExplorerEmbellishmentsStates> {
    objs: ResourceExplorerBackgroundsRefs = { panel: null };
    constructor() {
        super();
        this.state = { isCoverRestricted: false };
        Subscribers.AddSubscriber("ResourceExplorerEmbellishments", EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
    }

    handleCoverPage() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        this.setState({ isCoverRestricted: isCoverPage && isCoverRestricted });
        if (isCoverPage && isCoverRestricted) this.objs.panel.collapse();
    }

    componentDidMount() {
        this.loadTree();
    }
    loadTree(callback?: () => void) {
        Fetcher.getJson("/EditorApi/Image/GetAllContent", [["partnerId", 0]])
        .then(function (data: Content) {
            let treePanel: any = this.objs.resourceExplorer.objs.treePanel;
            this.objs.resourceExplorer.setSource(this.treeNodeParser([ data ], treePanel, 0));

            if (callback) {
                callback();
            }
        }.bind(this));
    }
    treeNodeParser(source: Array<Content>, treePanel: TreePanel, level: number) {
        return source.map((content: Content, i: number) =>
            <TreePanelNode ref={(x: TreePanelNode) => treePanel.objs.treePanelNodes.push(x)} key={i}
                treePanel={treePanel} level={level + 1} name={content.Category} tag={content.Id.toString()}
                subNodesSource={content.Subcategories} sourceParser={this.treeNodeParser.bind(this)}
                applicationScope={this.props.applicationScope} />
        );
    }
    handleNodeSelected(node: TreePanelNode) {
        if (node && !node.state.loaded) {
            Fetcher.getJson("/EditorApi/Image/GetCategory", [["Id", node.props.tag], ["type", null]])
            .then(function (data: Content) {
                node.setSubNodes(this.treeNodeParser(data.Subcategories, node.props.treePanel, node.props.level + 1));
                node.setLeavesCount(data.Items.length);
                this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data.Items, true));
            }.bind(this));
        }
    }
    handleSearchRequested(searchText: string, categoryId: number) {
        Fetcher.getJson("/EditorApi/Image/GetImages", [
                ["categoryId", categoryId],
                ["searchString", searchText],
                ["type", '']
            ])
        .then(function (data: Array<ImageInfo>) {
            this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data, false));;
        }.bind(this));
    }
    render() {
        return (
            <PanelLeftMenu id={"pnl" + this.props.id} title="Embellishments" disabled={this.state.isCoverRestricted} ref={(x: PanelLeftMenu) => this.objs.panel = x} onExpanded={this.props.onExpanded}>
                <ResourceExplorer ref={(x: ResourceExplorer) => this.objs.resourceExplorer = x} applicationScope={this.props.applicationScope}
                    onSelectedNodeChanged={this.handleNodeSelected.bind(this)}
                    onSearchReqested={this.handleSearchRequested.bind(this)} thumbnailsSize={this.props.thumbnailsSize} />
            </PanelLeftMenu>);
    }
}
