// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { ResourceExplorer, ThumbnailSizes } from "../components/ResourceExplorer";
import { TreePanel, TreePanelNode, VirtualTreePanelNode } from "../components/TreePanel";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { Subscribers, EvenType } from "../Subscribers";
import { ImageUsage, IImageUsage } from "../ImageUsage";
import { CacheManager, CacheType } from "../CacheManager";
import { Button, ButtonTitle, ButtonIcon } from "./Button";
import { ClassicButton } from "./ClassicButton";
import { PanelLeftMenu } from "../components/PanelLeftMenu";

interface ResourceExplorerMyPhotosProps extends EditorPropsBase {
    id: string;
    thumbnailsSize: ThumbnailSizes;
    onExpanded?: (panel: PanelLeftMenu) => void;
}
interface ResourceExplorerBackgroundsRefs {
    panel?: PanelLeftMenu;
    resourceExplorer?: ResourceExplorer;
}

interface IResourceExplorerMyPhotosStates {
    isCoverRestricted?: boolean;
    enableDeleteButton?: boolean;
}
export class ResourceExplorerMyPhotos extends React.Component<ResourceExplorerMyPhotosProps, IResourceExplorerMyPhotosStates> {
    objs: ResourceExplorerBackgroundsRefs = { panel: null };
    constructor() {
        super();
        this.state = { isCoverRestricted: false };
        Subscribers.AddSubscriber("ResourceExplorerMyPhotos", EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
        Subscribers.AddSubscriber("ResourceExplorerMyPhotos", EvenType.ResourceExplorerSelected, this, this.enableDeleteButton.bind(this));
        Subscribers.AddSubscriber("ResourceExplorerMyPhotos", EvenType.ImageUploaded, this, this.refreshSelectedNode.bind(this));
        Subscribers.AddSubscriber("ResourceExplorerMyPhotos", EvenType.MyPhotoChanged, this, this.updateImageUsages.bind(this));
        Subscribers.AddSubscriber("ResourceExplorerMyPhotos", EvenType.EditorDocumentLoaded, this, this.loadImageUsages.bind(this));
    }

    refreshSelectedNode() {
        this.handleNodeSelected(this.objs.resourceExplorer.state.selectedNode, this.resetSelectedNode.bind(this));
    }

    resetSelectedNode() {
        this.objs.resourceExplorer.objs.viewer.resetCheckBoxInViewerList();
        this.enableDeleteButton();
    }

    enableDeleteButton(): void {
        const files = this.objs.resourceExplorer.objs.viewer.getFiles();
        if (files) this.setState({ enableDeleteButton: files.filter(x => x.props.source.ImageInfo.Selected).length !== 0 });
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
        Fetcher.getJson("/EditorApi/Image/GetAllImages")
            .then(function (data: Content) {
                let treePanel = this.objs.resourceExplorer.objs.treePanel;
                this.objs.resourceExplorer.setSource(this.treeNodeParser(data.Subcategories, treePanel, 0));
        
                if (callback) {
                    callback();
                }
            }.bind(this));
    }

    updateImageUsages() {
        const files = this.objs.resourceExplorer.objs.viewer.getfileList();
        files.forEach(f => {
            let id = f.props.source.ImageInfo.ImageId;
            let tooltip = ImageUsage.buildTooltip(id);
            f.setState({ tooltip: tooltip });
            f.enableCheckBox();
            if (tooltip !== "") {
                f.resetCheckBox(this.objs.resourceExplorer.objs.viewer.toggleCheckBoxContainerBorder);
                f.disableCheckBox();
            }
        });
    }

    loadImageUsages() {
        Fetcher.getJson("/EditorApi/Image/GetImageUsage", [
            ["projectId", this.props.applicationScope.projectParameters.ProjectId]
        ]).then(function (data: IImageUsage[]) {
            ImageUsage.init(data);
            this.updateImageUsages();
        }.bind(this));
    }

    treeNodeParser(source: Array<Content>, treePanel: TreePanel, level: number) {
        return source.map((content: Content, i: number) =>
            <TreePanelNode ref={(x: TreePanelNode) => treePanel.objs.treePanelNodes.push(x)} key={i}
                treePanel={treePanel} level={level + 1} name={content.Category} tag={content.Id.toString()}
                subNodesSource={content.Subcategories} sourceParser={this.treeNodeParser.bind(this)}
                onNodeRemoved={this.handleNodeRemoved.bind(this)} onNodeAdded={this.handleNodeAdded.bind(this)}
                applicationScope={this.props.applicationScope} />
        );
    }
    handleNodeSelected(node: TreePanelNode, callBack?: () => void) {
        if (node && !node.state.loaded) {
            Fetcher.getJson("/EditorApi/Image/GetImages", [
                    ["categoryId", node.props.tag],
                    ["searchString", ''],
                    ["type", '']
                ])
                .then(function (data: Array<ImageInfo>) {
                    node.setLeavesCount(data.length);
                    this.objs.resourceExplorer.objs.viewer.setFiles(this.objs.resourceExplorer.objs.viewer.convertImageInfoToAssetInfo(data, false), true);
                    if (callBack) callBack();
                    this.updateImageUsages();
            }.bind(this));
        }
    }
    handleNodeAdded(node: VirtualTreePanelNode) {
        Fetcher.postJson("/EditorApi/Image/CreateAlbum", {
                Name: node.state.name
            })
        .then(function () {
            this.loadTree(node.clear);
        }.bind(this));
    }
    handleNodeRemoved(node: TreePanelNode) {
        Fetcher.postJson("/EditorApi/Image/DeleteAlbum",
            {
                Id: node.props.tag
            })
        .then(function () {
            this.loadTree();
        }.bind(this));
    }
    deleteImages() {
        let filesSelected = this.objs.resourceExplorer.objs.viewer.getFiles().filter(x => x.props.source.ImageInfo.Selected);
        if (confirm("Are you sure that you want to delete the selected images from MyCanvas?")) {

            Fetcher.postJson("/EditorApi/Image/DeleteImages",
                { Ids: filesSelected.map(v => v.props.source.ImageInfo.ImageId) })
                .then(function (response: IHttpStatusCodeResult) {

                    if (response.StatusCode === 200) {
                        this.refreshSelectedNode();
                    }

                    if (response.StatusCode >= 400 || response.StatusDescription !== "") {
                        alert(response.StatusDescription);
                    }

                }.bind(this))
                .catch((error: any) => {
                    alert(`Network error or permission issues. (${error})`);
                });
        }
    }

    render() {
        const styleButton: React.CSSProperties = {
            width: "97%",
            height: "16px",
            margin: "0px",
            marginTop: "2px"
        };
        return (
            <PanelLeftMenu id={"pnl" + this.props.id} title="My Photos" disabled={this.state.isCoverRestricted} ref={(x: PanelLeftMenu) => this.objs.panel = x} onExpanded={this.props.onExpanded}>
                <ResourceExplorer ref={(x: ResourceExplorer) => this.objs.resourceExplorer = x} applicationScope={this.props.applicationScope}
                    levels={1} newNodeLabel="New Album" canAddOrRemoveFolders={true} canUpload={true}
                    onSelectedNodeChanged={this.handleNodeSelected.bind(this)} thumbnailsSize={this.props.thumbnailsSize} />
                <ClassicButton text={ButtonIcon.DeleteSelectedImages} enabled={this.state.enableDeleteButton} onClick={this.deleteImages.bind(this)} />
            </PanelLeftMenu>);
    }
}
