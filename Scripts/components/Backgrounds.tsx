// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { Panel } from "../components/Panel";
import { ResourceExplorer } from "../components/ResourceExplorer";
import { TreePanel, TreePanelNode } from "../components/TreePanel";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";

interface BackgroundsProps extends EditorPropsBase {
    id: string;
    onExpanded?: (panel: Panel) => void;
    horizontalLayout?: boolean;
    horizontalLayoutSingle?: boolean;
}
interface BackgroundsRefs {
    panel?: Panel;
    resourceExplorer?: ResourceExplorer;
}

interface IBackgroundsStates {
    isCoverRestricted?: boolean;
}
export class Backgrounds extends React.Component<BackgroundsProps, IBackgroundsStates> {
    objs: BackgroundsRefs = { panel: null };
    constructor() {
        super();
        this.state = { isCoverRestricted: false };
    }

    handleCoverPage() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        this.setState({ isCoverRestricted: isCoverPage && isCoverRestricted });
        if (isCoverPage && isCoverRestricted && this.objs.panel) this.objs.panel.collapse();
    }

    componentDidMount() {
        Subscribers.AddSubscriber("Backgrounds", EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
        this.loadTree();
    }

    componentWillUnmount(): void {
        Subscribers.RemoveSubscriber("Backgrounds", EvenType.CoverPagesLoaded);
    }

    loadTree(callback?: () => void) {
        Fetcher.getJson("/EditorApi/Theme/GetBackgrounds", [
			["width", this.props.applicationScope.projectParameters.CustomData["Width"]],
			["height", this.props.applicationScope.projectParameters.CustomData["Height"]],
            ["partnerId", 0]
        ])
        .then(function (json: any) {
            if (this.objs.resourceExplorer) {
                let treePanel = this.objs.resourceExplorer.objs.treePanel;
                this.objs.resourceExplorer.setSource(this.treeNodeParser([json], treePanel, 0));
            }
            if (callback) {
                callback();
            }
        }.bind(this));
    }
    treeNodeParser(source: any, treePanel: TreePanel, level: number) {
        return source.map((content: any, i: number) =>
            <TreePanelNode ref={(x: TreePanelNode) => treePanel.objs.treePanelNodes.push(x)} key={i}
                treePanel={treePanel} level={level + 1} name={content.Category} tag={content.Id}
                subNodesSource={content.Subcategories} sourceParser={this.treeNodeParser.bind(this)} applicationScope={this.props.applicationScope} />
        );
    }
    handleNodeSelected(node: TreePanelNode) {
        if (node && !node.state.loaded && parseInt(node.props.tag) > 0) {
            Fetcher.getJson("/EditorApi/Image/GetCategory", [["Id", node.props.tag], ["type", null]])
                .then(function (data: Content) {
                    node.setSubNodes(this.treeNodeParser(data.Subcategories, node.props.treePanel, node.props.level + 1));
                    node.setLeavesCount(data.Items.length);
                    if (this.objs.resourceExplorer) this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data.Items, false));
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
            this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data, false));
        }.bind(this));
    }
    handleFileOnClick(source: any) {
        this.props.applicationScope.myCanvasEditor.setBackgroundFrameImage(
            source.ImageId,
            source.Name,
            this.props.applicationScope.projectsUrls.PwsUrl + "/" + source.Url,
            this.props.applicationScope.projectsUrls.PwsUrl + "/" + source.ThumbUrl,
            this.props.applicationScope.projectsUrls.PwsUrl + "/" + source.Url,
            source.Width,
            source.Height,
            '300 kb');
    }

    render() {
        return (
            <Panel id={"pnl" + this.props.id} title="Backgrounds" bridge={true} disabled={this.state.isCoverRestricted} ref={(x: Panel) => this.objs.panel = x} onExpanded={this.props.onExpanded}>
                <ResourceExplorer ref={(x: ResourceExplorer) => this.objs.resourceExplorer = x} applicationScope={this.props.applicationScope}
                    onSelectedNodeChanged={this.handleNodeSelected.bind(this)} canUpload={true} isBackground={true}
                    horizontalLayout={this.props.horizontalLayout} horizontalLayoutSingle={this.props.horizontalLayoutSingle}
                    onSearchReqested={this.handleSearchRequested.bind(this)} onClick={this.handleFileOnClick.bind(this)} />
            </Panel>);
    }
}
