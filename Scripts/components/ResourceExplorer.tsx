// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { TreePanel, TreePanelNode } from "../components/TreePanel";
import { UploadButton } from "../components/UploadButton";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { LayoutTypes, LayoutSubTypes } from "../Common";
import { ClassicButton } from "./ClassicButton";

interface ResourceExplorerProps extends EditorPropsBase {
    horizontalLayout?: boolean;
    horizontalLayoutSingle?: boolean;
    levels?: number;
    newNodeLabel?: string;
    canAddOrRemoveFolders?: boolean;
    canUpload?: boolean;
    isBackground?: boolean;
    hideSearch?: boolean;
    thumbnailsSize?: ThumbnailSizes;
    onSelectedNodeChanged?: (node: TreePanelNode) => void;
    onSearchReqested?: (searchText: string, categoryId: string) => void;
    onDoubleClick?: (source: any) => void;
    onClick?: (source: any) => void;
}
interface ResourceExplorerState {
    source: TreePanelNode[];
    selectedNode: TreePanelNode;
    thumbnailsSize?: ThumbnailSizes;
}
interface ResourceExplorerRefs {
    treePanel?: TreePanel;
    viewer?: ResourceExplorerViewer;
}
export class ResourceExplorer extends React.Component<ResourceExplorerProps, ResourceExplorerState> {
    objs: ResourceExplorerRefs = {};
    constructor() {
        super();
        this.state = {
            source: null,
            selectedNode: null,
            thumbnailsSize: ThumbnailSizes.Small
        };
    }
    setSource(source: TreePanelNode[]) {
        this.setState({
            source: source,
            selectedNode: null
        });
    }
    handleSelectedNodeChanged(node: TreePanelNode, silently: boolean) {
        this.setState({
            source: this.state.source,
            selectedNode: node
        });
        if (this.props.onSelectedNodeChanged && !silently) {
            this.props.onSelectedNodeChanged(node);
        }
    }
    handleThumbnailSizeChanged(uiEvent: UIEvent) {
        this.setState({ thumbnailsSize: parseInt((uiEvent.target as HTMLInputElement).value) });
    }

    render() {
        let event = this.props.horizontalLayoutSingle ? { onClick: this.props.onClick } : { onDoubleClick: this.props.onDoubleClick };

        return this.props.horizontalLayout ?
            <div>
                <div className="table-margin-left-auto">
                    Choose thumbnail size:
                    <input type="radio" value={ThumbnailSizes.Small.toString()} checked={this.state.thumbnailsSize === ThumbnailSizes.Small} onChange={this.handleThumbnailSizeChanged.bind(this)} />sm
                    <input type="radio" value={ThumbnailSizes.Large.toString()} checked={this.state.thumbnailsSize === ThumbnailSizes.Large} onChange={this.handleThumbnailSizeChanged.bind(this)} />lg
                </div>
                <div className="resource-explorer-horizontal">
                    <div className="layout-in-modal">
                        <TreePanel ref={(x: TreePanel) => this.objs.treePanel = x}
                            levels={this.props.levels} source={this.state.source} newNodeLabel={this.props.newNodeLabel} editable={this.props.canAddOrRemoveFolders}
                            onSelectedNodeChanged={this.handleSelectedNodeChanged.bind(this)} horizontalLayout={this.props.horizontalLayout} />
                    </div>
                    <div className="layout-in-modal">
                        <ResourceExplorerViewer ref={(x: ResourceExplorerViewer) => this.objs.viewer = x} applicationScope={this.props.applicationScope}
                            categoryId={this.state.selectedNode ? this.state.selectedNode.props.tag : null} isBackground={this.props.isBackground}
                            horizontalLayout={this.props.horizontalLayout} horizontalLayoutSingle={this.props.horizontalLayoutSingle} onSearchReqested={this.props.onSearchReqested} thumbnailsSize={this.state.thumbnailsSize} {...event} hideSearch={this.props.hideSearch} />
                    </div>
                </div>
            </div>
            :
            <div className="resource-explorer">
                <TreePanel ref={(x: TreePanel) => this.objs.treePanel = x}
                    levels={this.props.levels} source={this.state.source} newNodeLabel={this.props.newNodeLabel} editable={this.props.canAddOrRemoveFolders}
                    onSelectedNodeChanged={this.handleSelectedNodeChanged.bind(this)} />
                <br />
                {this.state.selectedNode
                    ? <div>
                        {this.props.canUpload
                            ? <div>
                                <UploadButton albumId={this.state.selectedNode
                                    ? this.state.selectedNode.props.tag
                                    : null} isBackground={this.props.isBackground} />
                            </div>
                            : null}
                        <hr />
                        <b>{this.state.selectedNode.props.name}</b>
                    </div>
                    : null}
                <ResourceExplorerViewer ref={(x: ResourceExplorerViewer) => this.objs.viewer = x} applicationScope={this.props.applicationScope}
                    categoryId={this.state.selectedNode ? this.state.selectedNode.props.tag : null} isBackground={this.props.isBackground}
                    onSearchReqested={this.props.onSearchReqested} thumbnailsSize={this.props.thumbnailsSize} onDoubleClick={this.props.onDoubleClick} onClick={this.props.onClick} hideSearch={this.props.hideSearch} />
            </div>;
    }
}

export enum ThumbnailSizes {
    Small,
    Large
}
interface ResourceExplorerViewerProps extends EditorPropsBase {
    isBackground?: boolean;
    categoryId?: string;
    thumbnailsSize: ThumbnailSizes;
    hideSearch?: boolean;
    onSearchReqested?: (searchText: string, categoryId: string) => void;
    onDoubleClick?: (source: any) => void;
    onClick?: (source: any) => void;
    horizontalLayout?: boolean;
    horizontalLayoutSingle?: boolean;
}
interface ResourceExplorerViewerState {
    files?: JSX.Element[];
    ownFilter?: string;
    searchResult?: ResourceExplorerViewerFile[];
    searching?: boolean;
    multipleSelection?: boolean;
}
export class ResourceExplorerViewer extends React.Component<ResourceExplorerViewerProps, ResourceExplorerViewerState> {
    private radioList: HTMLInputElement[];
    private fileList: ResourceExplorerViewerFile[] = [];
    constructor() {
        super();
        this.radioList = new Array<HTMLInputElement>();
        this.state = {
            files: null,
            ownFilter: null,
            searchResult: null,
            searching: false,
            multipleSelection: true
        };
    }
    handleSearchRequested(searchText: string) {
        if (this.props.onSearchReqested) {
            this.setState({
                searching: true
            });
            this.props.onSearchReqested(searchText, this.props.categoryId);
        } else {
            this.setState({
                ownFilter: searchText
            });
        }
    }

    toggleCheckBoxContainerBorder(input: HTMLInputElement) {
        let clss = input.parentElement.className.replaceAll(" selected", "");
        input.parentElement.className = input.checked ? `${clss} selected` : clss;
    }

    selection(file: ImageInfo, checkBox?: HTMLInputElement, allowDeleteSelection?: boolean) {
        if (this.state.multipleSelection || allowDeleteSelection) {
            checkBox.click();
            this.state.files.filter(x => x.props.source.ImageInfo === file)[0].props.source.ImageInfo.Selected = checkBox.checked;
            this.toggleCheckBoxContainerBorder(checkBox);
        }
        else {
            this.radioList.forEach(r => {
                r.checked = (r.id === file.ImageId);
                this.toggleCheckBoxContainerBorder(r);
            });
            this.state.files.forEach(f => f.props.source.ImageInfo.Selected = f.props.source.ImageInfo.ImageId === file.ImageId);
        }
        Subscribers.UpdateSubscribers(EvenType.ResourceExplorerSelected);
    }

    isFamilyHistoryLayout(imageInfo: ImageInfo): boolean {
        let customData: any = imageInfo.CustomData;
        if (customData) {
            let layoutTypeId = +customData["layoutTypeId"];
            return this.isFamilyHistoryByLayoutType(layoutTypeId);
        }
        return false;
    }

    isFamilyHistoryByLayoutType(layoutTypeId: LayoutTypes): boolean {
        return layoutTypeId === LayoutTypes.GroupSheet ||
            layoutTypeId === LayoutTypes.Record ||
            layoutTypeId === LayoutTypes.Timeline ||
            layoutTypeId === LayoutTypes.Tree;
    }

    resetCheckBoxInViewerList() {
        this.fileList.forEach((v) => { v.resetCheckBox(this.toggleCheckBoxContainerBorder) });
    }

    getfileList(): ResourceExplorerViewerFile[] {
        return this.fileList;
    }

    setFiles(files: Array<AssetInfo>, allowDeleteSelection?: boolean) {
        this.fileList = [];
        if (this.props.horizontalLayout && !this.props.horizontalLayoutSingle) {
            let allowMultipleSelection = files && !files.some((file: AssetInfo) => { return file.ImageInfo && this.isFamilyHistoryLayout(file.ImageInfo) });
            this.setState({ multipleSelection: allowMultipleSelection });
            this.radioList = [];
            this.setState({
                files: files ? files.map((file: AssetInfo, i: number) =>
                    <ResourceExplorerViewerFile key={i} ref={(x: ResourceExplorerViewerFile) => { if (x) this.fileList.push(x) }} source={file} applicationScope={this.props.applicationScope} onDoubleClick={this.props.onDoubleClick} onClick={this.props.onClick} horizontalLayout={true} selection={this.selection.bind(this)} multipleSelection={allowMultipleSelection} radioList={this.radioList} />
                ) : null
            });
        }
        else {
            this.setState({
                files: files ? files.map((file: AssetInfo, i: number) =>
                    <ResourceExplorerViewerFile key={i} ref={(x: ResourceExplorerViewerFile) => { if (x) this.fileList.push(x) }} source={file} applicationScope={this.props.applicationScope} onDoubleClick={this.props.onDoubleClick} onClick={this.props.onClick} horizontalLayout={false} selection={this.selection.bind(this)} allowDeleteSelection={allowDeleteSelection}/>
                ) : null
            });
        }
        this.setState({
            searching: false
        });

    }
    getFiles(): JSX.Element[] {

        return this.state.files;
    }
    convertImageInfoToAssetInfo(items: ImageInfo[], embellishment: boolean): AssetInfo[] {
        return items.map((item: ImageInfo) => {
            return {
                ImageInfo: item,
                AssetMetadata: {
                    client: {
                        embellishment: embellishment
                    }
                }
            } as AssetInfo;
        });
    }
    setSearchResult(searchResult: ResourceExplorerViewerFile[]) {
        this.setState({
            searchResult: searchResult,
            searching: false
        });
    }
    clearSearch() {
        this.setState({
            ownFilter: null,
            searchResult: null
        });
    }
    render() {
        return (
            <div className={this.props.horizontalLayout ? "resource-explorer-viewer-horizontal" : "resource-explorer-viewer"}>
                {this.props.hideSearch ? null : <ResourceExplorerViewerSearch onSearchReqested={this.handleSearchRequested.bind(this)} viewer={this} />}
                <div className={this.props.thumbnailsSize === ThumbnailSizes.Small ? "content" : "content content-lg"}>
                    {this.state.searchResult
                        ? this.state.searchResult
                        : this.state.files
                            ? this.state.files.map((file, i) => {
                                if (file.props.source.ImageInfo) {
                                    return (!this.state.ownFilter || file.props.source.ImageInfo.Name.toLowerCase().indexOf(this.state.ownFilter.toLowerCase()) >= 0)
                                        ? file
                                        : null;
                                }
                                //some Ancestry Records Images
                                else if (file.props.source.EventInfo) {
                                    return (!this.state.ownFilter || file.props.source.EventInfo.Name.toLowerCase().indexOf(this.state.ownFilter.toLowerCase()) >= 0)
                                        ? file
                                        : null;
                                }
                            })
                            : null
                    }
                    {this.state.searching ? <div className="loading">loading...</div> : null}
                </div>
            </div>);
    }
}

interface ResourceExplorerViewerSearchProps {
    viewer: ResourceExplorerViewer;
    onSearchReqested?: (searchText: string) => void;
}
interface ResourceExplorerViewerSearchState {
    inputText?: string;
}
class ResourceExplorerViewerSearch extends React.Component<ResourceExplorerViewerSearchProps, ResourceExplorerViewerSearchState> {
    timer: number;
    constructor() {
        super();
        this.state = { inputText: '' };
    }
    handleInputChanged(uiEvent: UIEvent) {
        this.setState({ inputText: (uiEvent.target as HTMLInputElement).value });

        clearTimeout(this.timer);
        var self = this;
        this.timer = setTimeout(function () {
            if (self.props.onSearchReqested) {
                self.props.onSearchReqested(self.state.inputText);
            }
        }, 1000);
    }
    handleClearClick() {
        this.setState({ inputText: '' });
        this.props.viewer.handleSearchRequested('');
    }
    render() {
        return (
            <div className="search">
                <table style={{ width: "100%" }}>
                    <tbody>
                        <tr>
                            <td>
                                Search
                        </td>
                            <td style={{ width: "100%" }}>
                                <input style={{ width: "100%" }} onChange={this.handleInputChanged.bind(this)} value={this.state.inputText} placeholder="Type name here" />
                            </td>
                            <td>
                                <ClassicButton text={"clear"} enabled={true} onClick={this.handleClearClick.bind(this)} />
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>);
    }
}

interface ResourceExplorerViewerFileProps extends EditorPropsBase {
    source: AssetInfo;
    key?: number;
    onDoubleClick?: (source: ImageInfo) => void;
    onClick?: (source: ImageInfo) => void;
    horizontalLayout?: boolean;
    selection?: (file: ImageInfo, checkBox?: HTMLInputElement, allowDeleteSelection?: boolean) => void;
    multipleSelection?: boolean;
    radioList?: HTMLInputElement[];
    allowDeleteSelection?: boolean;
}

interface ResourceExplorerViewerFileStates {
    tooltip?: string;
}

export class ResourceExplorerViewerFile extends React.Component<ResourceExplorerViewerFileProps, ResourceExplorerViewerFileStates> {
    constructor() {
        super();
        this.state = { tooltip: "" }
    }

    private checkBox: HTMLInputElement;
    resetCheckBox(callback?: (input: HTMLInputElement) => void) {
        if (this.checkBox) {
            this.checkBox.checked = false;
            if (callback) callback(this.checkBox);
        };
        this.props.source.ImageInfo.Selected = false;
    }
    enableCheckBox() {
        if (this.checkBox) this.checkBox.disabled = false;
    }
    disableCheckBox() {
        if (this.checkBox) this.checkBox.disabled = true;
    }
    handleDoubleClick() {
        if (this.props.onDoubleClick && this.props.source.ImageInfo) {
            this.props.onDoubleClick(this.props.source.ImageInfo);
        }
    }
    handleClick() {
        if (this.props.onClick && this.props.source.ImageInfo) {
            this.props.onClick(this.props.source.ImageInfo);
        }
    }
    handleDragStart(event: any) {
        if (this.props.source.ImageInfo) {
            this.startDragImageInfo(event);
        } else if (this.props.source.RecordInfo) {
            this.startDragRecordInfo(event);
        } else if (this.props.source.StoryInfo) {
            this.startDragStoryInfo(event);
        } else if (this.props.source.NoteInfo) {
            this.startDragNoteInfo(event);
        } else if (this.props.source.CommentInfo) {
            this.startDragCommentInfo(event);
        } else if (this.props.source.EventInfo) {
            this.startDragEventInfo(event);
        }
    }

    startDragImageInfo(event: any) {
        let data: IData = {
            Type: "image",
            Id: this.props.source.ImageInfo.ImageId,
            Name: this.props.source.ImageInfo.Name,
            RemoteUrl: this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.Url,
            Thumb: this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl,
            HighResPdfUrl: this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.Url,
            Width: this.props.source.ImageInfo.Width,
            Height: this.props.source.ImageInfo.Height,
            FileSize: "300 kb",
            JsonAssetMetadata: this.props.source.AssetMetadata
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        this.setDragContent(event, this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl, null, this.props.source.ImageInfo.Width, this.props.source.ImageInfo.Height);
    }
    startDragRecordInfo(event: any) {

    }
    startDragStoryInfo(event: any) {
        let data: IData = {
            Type: "text",
            Id: this.props.source.StoryInfo.Id,
            Text: this.props.source.StoryInfo.Text,
            JsonAssetMetadata: this.props.source.AssetMetadata
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        this.setDragContent(event, null, this.props.source.StoryInfo.Text, 800, 20);
    }
    startDragNoteInfo(event: any) {
        let data: IData = {
            Type: "text",
            Id: this.props.source.NoteInfo.Id,
            Text: this.props.source.NoteInfo.Text,
            JsonAssetMetadata: this.props.source.AssetMetadata
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        this.setDragContent(event, null, this.props.source.NoteInfo.Text, 800, 20);
    }
    startDragCommentInfo(event: any) {
        let data: IData = {
            Type: "text",
            Id: this.props.source.CommentInfo.Id,
            Text: this.props.source.CommentInfo.Text,
            JsonAssetMetadata: this.props.source.AssetMetadata
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        this.setDragContent(event, null, this.props.source.CommentInfo.Text, 800, 20);
    }
    startDragEventInfo(event: any) {
        let data: IData = {
            Type: "text",
            Id: this.props.source.EventInfo.Id,
            Text: this.props.source.EventInfo.Text,
            JsonAssetMetadata: this.props.source.AssetMetadata
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        this.setDragContent(event, null, this.props.source.EventInfo.Text, 800, 20);
    }

    setDragContent(event: any, image: string, text: string, width: number, height: number) {
        if (event.dataTransfer.setDragImage) {
            let frameMetrics = this.props.applicationScope.myCanvasEditor.getImageFramePreviewMetrics(0, 0, width, height);

            let img = document.querySelector('.dnd-preview img') as HTMLImageElement;
            img.src = image;
            img.width = image ? frameMetrics.width : 0;

            let span = document.querySelector('.dnd-preview span') as HTMLImageElement;
            span.innerHTML = text;

            let div = document.querySelector('.dnd-preview') as HTMLElement;
            div.style.width = frameMetrics.width + 'px';
            div.style.marginLeft = (-2 * frameMetrics.width) + 'px';

            event.dataTransfer.setDragImage(div, 0, 0);
        }
    }
    render() {
        let draggable: any = this.props.onDoubleClick || this.props.onClick ? {} : { "draggable": true };
        return this.props.source.ImageInfo 
            ?
            this.props.allowDeleteSelection ? 
                <div className="item item-file"
                    title={this.props.source.ImageInfo.Name} draggable={true} onDragStart={this.handleDragStart.bind(this)} onClick={() => this.props.selection(this.props.source.ImageInfo, this.checkBox, true)}>
                    <Tooltip title={this.state.tooltip} />
                    <div className="preview" style={{ backgroundImage: "url(" + this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl + ")" }}></div>
                    <div className="name"><small>{this.props.source.ImageInfo.Name}</small></div>
                    <input type="checkbox" ref={(x: HTMLInputElement) => this.checkBox = x} onClick={() => this.props.selection(this.props.source.ImageInfo, this.checkBox, true)} />
                </div>
                :
                this.props.horizontalLayout ?
                    (this.props.multipleSelection ?
                        <div className="item item-file"
                            title={this.props.source.ImageInfo.Name} onClick={() => this.props.selection(this.props.source.ImageInfo, this.checkBox)}>
                            <div className="preview" style={{ backgroundImage: "url(" + this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl + ")" }}></div>
                            <div className="name"><small>{this.props.source.ImageInfo.Name}</small></div>
                            <input type="checkbox" ref={(x: HTMLInputElement) => this.checkBox = x} onClick={() => this.props.selection(this.props.source.ImageInfo, this.checkBox)} />
                        </div>
                        : <div className="item item-file"
                            title={this.props.source.ImageInfo.Name} onClick={() => this.props.selection(this.props.source.ImageInfo)}>
                            <div className="preview" style={{ backgroundImage: "url(" + this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl + ")" }}></div>
                            <div className="name"><small>{this.props.source.ImageInfo.Name}</small></div>
                            <input type="radio" ref={(x: HTMLInputElement) => { if (x) this.props.radioList.push(x) }} id={this.props.source.ImageInfo.ImageId} onClick={() => this.props.selection(this.props.source.ImageInfo)} />
                        </div>)
                    : <div className="item item-file"
                        title={this.props.source.ImageInfo.Name} {...draggable} onDragStart={this.props.onDoubleClick || this.props.onClick ? null : this.handleDragStart.bind(this)}
                        onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                        <div className="preview" style={{ backgroundImage: "url(" + this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.ImageInfo.ThumbUrl + ")" }}></div>
                        <div className="name"><small>{this.props.source.ImageInfo.Name}</small></div>
                    </div>
            :
            (this.props.source.RecordInfo
                ?
                <div className="item item-file"
                    title={this.props.source.RecordInfo.DisplayName} draggable={true} onDragStart={this.handleDragStart.bind(this)}
                    onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                    <div className="preview" style={{ backgroundImage: "url(" + this.props.applicationScope.projectsUrls.PwsUrl + "/" + this.props.source.RecordInfo.Source + ")" }}></div>
                    <div className="name"><small>{this.props.source.RecordInfo.DisplayName}</small></div>
                </div>
                : (this.props.source.StoryInfo
                    ?
                    <div className="item item-file"
                        title={this.props.source.StoryInfo.Name} draggable={true} onDragStart={this.handleDragStart.bind(this)}
                        onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                        <h2>SI</h2>
                        <div className="name"><small>{this.props.source.StoryInfo.Name}</small></div>
                    </div>
                    : (this.props.source.NoteInfo
                        ?
                        <div className="item item-file"
                            title={this.props.source.NoteInfo.Name} draggable={true} onDragStart={this.handleDragStart.bind(this)}
                            onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                            <h2>NI</h2>
                            <div className="name"><small>{this.props.source.NoteInfo.Name}</small></div>
                        </div>
                        : (this.props.source.CommentInfo
                            ?
                            <div className="item item-file"
                                title={this.props.source.CommentInfo.Name} draggable={true} onDragStart={this.handleDragStart.bind(this)}
                                onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                                <h2>CI</h2>
                                <div className="name"><small>{this.props.source.CommentInfo.Name}</small></div>
                            </div>
                            : (this.props.source.EventInfo
                                ?
                                <div className="item item-file"
                                    title={this.props.source.EventInfo.Name} draggable={true} onDragStart={this.handleDragStart.bind(this)}
                                    onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                                    <h2>EI</h2>
                                    <div className="name"><small>{this.props.source.EventInfo.Name}</small></div>
                                </div>
                                :
                                <div className="item item-file"
                                    title="??" draggable={true} onDragStart={this.handleDragStart.bind(this)}
                                    onDoubleClick={this.handleDoubleClick.bind(this)} onClick={this.handleClick.bind(this)}>
                                    <h2>??</h2>
                                    <div className="name"><small>??</small></div>
                                </div>)))))
            ;
    }
}



interface ITooltipProps {
    title: string;
}

interface ITooltipStates {
    isHover: boolean;
}

class Tooltip extends React.Component<ITooltipProps, ITooltipStates> {
    constructor() {
        super();
        this.state = { isHover: false }
    }

    onMouseOver() {
        this.setState({ isHover: true });
    }

    onMouseOut() {
        this.setState({ isHover: false });
    }

    render() {
        if (this.props.title === "") return null;

        const clearStyle = { clear: "both" };

        return (
            <div className="popup">
                <div className="point" onMouseOver={this.onMouseOver.bind(this)} onMouseOut={this.onMouseOut.bind(this)} />

                {this.state.isHover
                    ? <div className="message">{this.props.title}</div>
                    : null
                }

                <div style={clearStyle}></div>
            </div>);
    }
}