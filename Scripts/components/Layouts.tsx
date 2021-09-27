import * as React from "react";
import { Panel } from "../components/Panel";
import { ResourceExplorer, ThumbnailSizes } from "../components/ResourceExplorer";
import { TreePanel, TreePanelNode } from "../components/TreePanel";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";

interface LayoutsProps extends EditorPropsBase {
    id: string;
    onExpanded?: (panel: Panel) => void;
    horizontalLayout?: boolean;
    horizontalLayoutSingle?: boolean;
}
interface LayoutsRefs {
    panel?: Panel;
    resourceExplorer?: ResourceExplorer;
}

interface ILayoutsStates {
    isCoverPage?: boolean;
}
export class Layouts extends React.Component<LayoutsProps, ILayoutsStates> {
    objs: LayoutsRefs = { panel: null };
    constructor() {
        super();
        this.state = { isCoverPage: false };
    }

    handleCoverPage() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        this.setState({ isCoverPage: isCoverPage });
        if (isCoverPage && this.objs.panel) this.objs.panel.collapse();
    }

    componentDidMount() {
        Subscribers.AddSubscriber(`Layouts${this.props.horizontalLayout ? "H" : ""}`, EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
        this.loadTree(() => this.loadLayoutsByProject(this.props.applicationScope.projectParameters.ProjectId));
    }

    componentWillUnmount(): void {
        Subscribers.RemoveSubscriber(`Layouts${this.props.horizontalLayout ? "H" : ""}`, EvenType.CoverPagesLoaded);
    }

    loadTree(callback?: () => void) {
        Fetcher.getJson("/EditorApi/Layout/GetAllContent")
            .then(function (data: FolderLayout) {
                let treePanel: TreePanel = this.objs.resourceExplorer.objs.treePanel;
                this.objs.resourceExplorer.setSource(this.treeNodeParser([data], treePanel, 0));
                if (callback) {
                    callback();
                }
            }.bind(this));
    }
    loadLayoutsByProject(projectId: number) {
        Fetcher.getJson("/EditorApi/Layout/GetThemeIdByProjectId", [["projectId", projectId]])
            .then(function (themeId: number) {
                this.objs.resourceExplorer.objs.treePanel.setNodeByTheme(themeId);
            }.bind(this));
    }
    treeNodeParser(source: Array<FolderLayout>, treePanel: TreePanel, level: number) {
        return source.map((folderLayout: FolderLayout, i: number) =>
            <TreePanelNode ref={(x: TreePanelNode) => treePanel.objs.treePanelNodes.push(x)} key={i} parentId={folderLayout.ParentId}
                treePanel={treePanel} level={level + 1} name={folderLayout.Name} tag={folderLayout.Id.toString()} idTheme={folderLayout.IdTheme}
                subNodesSource={folderLayout.SubFolders} sourceParser={this.treeNodeParser.bind(this)}
                applicationScope={this.props.applicationScope} />
        );
    }
    handleNodeSelected(node: TreePanelNode) {
        if (node && !node.state.loaded) {
            if (node.props.idTheme !== 0) {
                Fetcher.getJson("/EditorApi/Layout/GetLayouts", [["themeId", node.props.idTheme], ["productId", this.props.applicationScope.projectParameters.ProductId]])
                    .then(function (data: FolderLayout) {
                        node.setLeavesCount(data.Items.length);
                        if (this.objs.resourceExplorer) this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data.Items, true));
                    }.bind(this));
            }
        }
    }
    handleClick(source: ImageInfo) {
        Fetcher.postJson("/EditorApi/Layout/SetLayout",
            {
                LayoutId: source.CustomData["layoutId"],
                TemplateXml: this.props.applicationScope.myCanvasEditor.getTemporaryXml()
            })
            .then(function (xml: string) {
                this.props.applicationScope.myCanvasEditor.openDocumentFromXml(xml);
            }.bind(this));
    }

    render() {
        return (
			<Panel id={`pnl${this.props.id}`} title="Layouts" bridge={true} disabled={this.state.isCoverPage} ref={(x: Panel) => this.objs.panel = x} onExpanded={this.props.onExpanded} hidden={this.props.applicationScope.conditions.photoPoster}>
                <ResourceExplorer ref={(x: ResourceExplorer) => this.objs.resourceExplorer = x} applicationScope={this.props.applicationScope}
                    onSelectedNodeChanged={this.handleNodeSelected.bind(this)}
                    onClick={this.handleClick.bind(this)}
                    horizontalLayoutSingle={this.props.horizontalLayoutSingle}
                    hideSearch={true} horizontalLayout={this.props.horizontalLayout} />
            </Panel>);
    }
}
