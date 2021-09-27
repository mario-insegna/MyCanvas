// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { LeftToolbox } from "../components/LeftToolbox";
import { BottomToolbox } from "../components/BottomToolbox";
import { ContextMenu } from "../components/ContextMenu";
import { BackgroundSettings } from "../components/BackgroundSettings";
import { MetadataSettings } from "../components/MetadataSettings";
import { XmlViewer } from "../components/XmlViewer";
import { ResyncMessage } from "../components/ResyncMessage";
import { EditorPropsBase, ChiliObjectTypes } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { UndoManager } from "./UndoManager";
import { Button, ButtonIcon } from "./Button";
import { SaveProject } from "./SaveProject";
import { Zoom } from "./Zoom";
import { Frames } from "./Frames";
import { PageManager } from "./PageManager";
import { Pages } from "./Pages";
import * as SplitPane from "react-split-pane";
import * as Spinner from "react-spinkit";
import { CacheManager, CacheType } from "../CacheManager";
import { ImageUsage } from "../ImageUsage";
import { Covers } from "../components/Covers";
import { PageSettings } from "../components/PageSettings";
import { States } from "../components/States";
import { ClassicButton } from "./ClassicButton";

interface DesktopRefs {
    bottomToolbox?: BottomToolbox;
    backgroundSettings?: BackgroundSettings;
    metadataSettings?: MetadataSettings;
    xmlViewer?: XmlViewer;
    resyncMessage?: ResyncMessage;
    undoMngr?: UndoManager;
    imageFrameDrag?: HTMLDivElement;
    covers?: Covers;
    pageSettings?: PageSettings;
}
interface DesktopProps extends EditorPropsBase {
    onEditorLoaded: () => void;
}
interface DesktopState {
    selectedFrame?: any;
    loading?: boolean;
    showSpinner?: boolean;
    resizingPanles?: boolean;
    buttonBackgroundEnabled?: boolean;
    leftSideBarCollapsed?: boolean;
    bottomSideBarCollapsed?: boolean;
    verticalSplitSize?: number;
    horizontalSplitSize?: number;
    pages?: Pages;
    isCoverRestricted?: boolean;
    isCoverPage?: boolean;
}
export class Desktop extends React.Component<DesktopProps, DesktopState> {
    objs: DesktopRefs = {};
    private minSplitSize = 21;
    private verticalSplitSize = 241;
    private horizontalSplitSize = 115;
    private verticalSplitPaneClass = "verticalSplitPaneClass";
    private desktop: IDesktop = {};
    constructor() {
        super();
        this.state = {
            selectedFrame: null,
            loading: true,
            showSpinner: false,
            buttonBackgroundEnabled: false,
            leftSideBarCollapsed: true,
            bottomSideBarCollapsed: true,
            verticalSplitSize: this.verticalSplitSize,
            horizontalSplitSize: this.horizontalSplitSize,
            isCoverRestricted: false,
            isCoverPage: false
        };
        Subscribers.AddSubscriber("Desktop", EvenType.EditorDocumentLoaded, this, this.setLoaded.bind(this));
        Subscribers.AddSubscriber("Desktop", EvenType.BackgroundFrameCreated, this);
        Subscribers.AddSubscriber("Desktop", EvenType.CoverPagesLoaded, this, this.setIsCoverRestrictedState.bind(this));
        Subscribers.AddSubscriber("Desktop", EvenType.NewPageSelected, this, this.handleOnExpanded.bind(this));
        Subscribers.AddSubscriber("Desktop", EvenType.RenderChanged, this, this.handleRenderChanged.bind(this));
    }
    componentDidMount(): void {
        CacheManager.SetDataToCache("desktopElements", this.desktop, CacheType.DesktopVariables);
    }
    setLoaded() {
        this.setState({ selectedFrame: null, loading: false, buttonBackgroundEnabled: this.props.applicationScope.myCanvasEditor.hasBackgroundFrame() });
        this.setState({ pages: this.objs.bottomToolbox ? this.objs.bottomToolbox.objs.pages : null });
        if (!this.props.applicationScope.conditions.notPreview) {
            this.props.applicationScope.myCanvasEditor.lockDocument(true);
        }
    }
    setIsCoverRestrictedState() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        this.setState({ isCoverRestricted: isCoverPage && isCoverRestricted, isCoverPage: isCoverPage });
    }
    setSelectedFrame(targetId: string) {
        let frame: any = this.props.applicationScope.myCanvasEditor.getSelectedFrameType();
        this.setState({ selectedFrame: { id: targetId, type: frame.type } });
    }
    setSelectedText(targetID: string) {
        this.setState({
            selectedFrame: targetID.length > 0 ? {
                id: targetID,
                type: ChiliObjectTypes.TextSelection
            } : null
        });
    }
    saveProject() {
        this.objs.bottomToolbox.objs.pages.saveProject();
    }

    saveLayout() {
        this.objs.bottomToolbox.objs.pages.saveLayout();
    }
    saveLayoutThumbnail() {
        this.objs.bottomToolbox.objs.pages.saveLayoutThumbnail();
    }
    handlBackgroundSettingClick() {
        this.objs.backgroundSettings.objs.modal.show();
        this.objs.backgroundSettings.refresh();
    }
    handlMetadataSettingClick() {
        this.objs.metadataSettings.objs.modal.show();
        this.objs.metadataSettings.refresh();
    }
    handlViewXmlClick() {
        this.objs.xmlViewer.objs.modal.show();
        this.objs.xmlViewer.refresh();
    }
    handleCovers() {
        this.objs.covers.objs.modal.show();
    }
    handlePageSettings() {
        this.objs.pageSettings.setPages(this.objs.bottomToolbox.objs.pages);

        this.objs.pageSettings.objs.modal.show();
        this.objs.pageSettings.init();
    }
    handleRsAllClick() {
        this.objs.resyncMessage.objs.modal.show();
    }
    handlePageChanged() {
        this.setState({ loading: true, showSpinner: false, selectedFrame: null });
        this.objs.undoMngr.clearStack();
    }
    handleFrameLoaded() {
        let frameBody = (document.querySelectorAll("iframe")[0] as HTMLIFrameElement).contentDocument.querySelector("body");
        frameBody.addEventListener("dragover", this.handleDragOver, false);
        frameBody.addEventListener("drop", this.handleDrop.bind(this), false);
        this.props.onEditorLoaded();
    }
    handleDragOver(event: Event) {
        event.preventDefault();
    }
    handleDrop(event: any) {
        let data: IData = JSON.parse(event.dataTransfer.getData("text"));
        setTimeout(() => {
            let position: any = this.props.applicationScope.myCanvasEditor.getMousePosition(event.clientX, event.clientY);
            if (data.Type === "image") {
                this.props.applicationScope.myCanvasEditor.createImageFrame(data.Id, data.Name, data.RemoteUrl, data.Thumb, data.HighResPdfUrl, position.docX, position.docY, data.Width, data.Height, data.FileSize, data.JsonAssetMetadata);
                ImageUsage.addImage(data.Id);
            }
            else if (data.Type === "text") {
                let isCoverPage: any = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
                let isCoverRestricted: any = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
                let isLocked: any = isCoverPage && isCoverRestricted;
                this.props.applicationScope.myCanvasEditor.createTextFrame(data.Id, data.Text, position.docX, position.docY, 800, data.JsonAssetMetadata, isLocked);
            }
        }, 150);
    }
    handleLeftToolboxCollapsedChanged(collapsed: boolean) {
        this.setState({
            leftSideBarCollapsed: collapsed
        });
        Subscribers.UpdateSubscribers(EvenType.RenderChanged);
    }
    handleRenderChanged() {
        setTimeout(() => {
            let desktopElements = CacheManager.GetValueFromCache<IDesktop>("desktopElements", CacheType.DesktopVariables);
            let availableWidth = `${window.innerWidth - desktopElements.side.offsetWidth}px`;
            desktopElements.bottom.style.width = availableWidth;
        }, 0);
    }
    handleBottomToolboxCollapsedChanged(collapsed: boolean) {
        this.setState({
            bottomSideBarCollapsed: collapsed
        });
    }
    handleResizeStarted() {
        this.setState({ resizingPanles: true });
    }
    handleResizeFinished() {
        this.setState({ resizingPanles: false });
    }
    toggleSpinner(visible: boolean) {
        this.setState({ showSpinner: visible });
    }
    handleOnExpanded() {
        if (this.state.horizontalSplitSize === this.minSplitSize) return;

        let panel = document.getElementsByClassName(this.verticalSplitPaneClass)[0] as HTMLDivElement;
        let size: number = panel.clientHeight * .7;

        let isHorizontalSplitSize = this.state.horizontalSplitSize === this.horizontalSplitSize;
        this.setState({ horizontalSplitSize: isHorizontalSplitSize ? size : this.horizontalSplitSize });

        CacheManager.SetDataToCache("isHorizontalPaneFullyOpened", isHorizontalSplitSize, CacheType.DesktopVariables);
        CacheManager.SetDataToCache("horizontalSplitSize", size, CacheType.DesktopVariables);
        Subscribers.UpdateSubscribers(EvenType.HorizontalPaneFullyOpened);
    }
    render() {
        return (
            <div className="desktop">
                <div ref={(x: HTMLDivElement) => this.desktop.header = x} className={"page-header"}>
                    <img src={"/content/images/last-title.png"} />
                    {this.props.applicationScope.conditions.editingOrAdmin
                        ? <SaveProject onClick={this.saveProject.bind(this)} applicationScope={this.props.applicationScope} />
                        : null}
                </div>
                <div ref={(x: HTMLDivElement) => this.desktop.bar = x} className={`top-bar`}>
                    <Zoom applicationScope={this.props.applicationScope} />

                    {this.props.applicationScope.conditions.notPreview
                        ? <Frames disabled={this.state.isCoverRestricted} applicationScope={this.props.applicationScope} />
                        : null}

                    {this.props.applicationScope.conditions.notPreviewNorLayout && !this.props.applicationScope.conditions.photoPoster
                        ? <PageManager applicationScope={this.props.applicationScope} bottomToolbox={this.objs.bottomToolbox} />
                        : null}

                    {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                        ? <div className="button-group">
                            <Button icon={ButtonIcon.Resync} title="Resync All" enabled={true} onClick={this.handleRsAllClick.bind(this)} />
                            <div className="labelAddLine" onClick={this.handleRsAllClick.bind(this)}>
                                Resync All
                                        </div>
                        </div>
                        : null}

                    {this.state.isCoverPage && !this.props.applicationScope.conditions.photoPoster && this.props.applicationScope.conditions.notPreview
                        ? <div className="button-group paddingLeftRightTop10px">
                            <span className="icon-cover iconmedium" onClick={this.handleCovers.bind(this)}></span>
                            <div className="labelAddLine" onClick={this.handleCovers.bind(this)}>
                                Covers
                                        </div>
                        </div>
                        : null}

                    {!this.state.isCoverRestricted && this.props.applicationScope.conditions.notPreview
                        ? <div>
                            {this.props.applicationScope.conditions.photoPoster ?
                                <div className="button-group">
                                    <span className="icon-pagesettings" onClick={this.handlePageSettings.bind(this)}></span>
                                    <div className="labelAddLine" onClick={this.handlePageSettings.bind(this)}>
                                        Backgrounds
                                                </div>
                                </div> :
                                <div className="button-group">
                                    <span className="icon-pagesettings iconmedium" onClick={this.handlePageSettings.bind(this)}></span>
                                    <div className="labelAddLine" onClick={this.handlePageSettings.bind(this)}>
                                        Manage Pages
                                                </div>
                                </div>}
                        </div>
                        : null}

                    <div style={{ marginLeft: "auto" }}></div>
                    <div className="button-group">

                        {this.props.applicationScope.conditions.layoutOrCoverLayout
                            ? <div className="button-group">
                                <ClassicButton text={"Save Layout"} enabled={true} onClick={this.saveLayout.bind(this)} />
                                <ClassicButton text={"Save Thumbnail"} enabled={true} onClick={this.saveLayoutThumbnail.bind(this)} />
                            </div>
                            : null}
                    </div>

                    {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                        ? <div className="button-group ">
                            <ClassicButton text={"View XML"} enabled={true} onClick={this.handlViewXmlClick.bind(this)} hidden={this.state.isCoverRestricted} />
                        </div>
                        : null}

                    {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                        ? <div className="button-group">
                            <ClassicButton text={"Metadata"} enabled={this.state.selectedFrame != null} onClick={this.handlMetadataSettingClick.bind(this)} hidden={this.state.isCoverRestricted} />
                        </div>
                        : null}

                    {this.props.applicationScope.conditions.notPreview
                        ? <div className="button-group">
                            <Button icon={ButtonIcon.BackgroundSettings} title="Opens the background settings dialog" onClick={this.handlBackgroundSettingClick.bind(this)} enabled={this.state.buttonBackgroundEnabled} hidden={this.state.isCoverRestricted} />
                        </div>
                        : null}

                    {this.props.applicationScope.conditions.notPreview
                        ? <UndoManager disabled={this.state.isCoverRestricted} ref={(undoMngr: UndoManager) => { this.objs.undoMngr = undoMngr }} applicationScope={this.props.applicationScope} />
                        : null}
                </div>
                <SplitPane className={`vertical-split ${this.verticalSplitPaneClass}`} split="vertical" allowResize={!this.state.leftSideBarCollapsed} size={this.state.leftSideBarCollapsed ? this.minSplitSize : this.state.verticalSplitSize}
                    minSize={this.state.leftSideBarCollapsed ? this.minSplitSize : this.verticalSplitSize}
                    onDragStarted={this.handleResizeStarted.bind(this)}
                    onDragFinished={this.handleResizeFinished.bind(this)}
                    onChange={(size: number) => this.setState({ verticalSplitSize: size })}
                    paneStyle={{ position: "static", left: "auto", right: "auto", backgroundColor: 'rgb(209,214,214)' }}>
                    <div ref={(x: HTMLDivElement) => this.desktop.side = x} className={`left-side-bar ${this.state.leftSideBarCollapsed ? "collapsed" : ""}`}>
                        {this.props.applicationScope.conditions.notPreview
                            ? <LeftToolbox applicationScope={this.props.applicationScope} onCollapsedChanged={this.handleLeftToolboxCollapsedChanged.bind(this)} />
                            : null}
                    </div>
                    <SplitPane className={"horizontal-split"} split="horizontal" allowResize={false}
                        size={this.props.applicationScope.conditions.photoPoster ? .1 : this.state.bottomSideBarCollapsed ? this.minSplitSize : this.state.horizontalSplitSize}
                        primary="second" paneStyle={{ position: "static", left: "auto", right: "auto" }}>
                        <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>                                                
                            <div className={`main-panel`} onDrop={this.handleDragOver.bind(this)}>
                                <div ref={(x: HTMLDivElement) => this.objs.imageFrameDrag = x} className="cropping-drag-hidden">
                                    <div className="cropping-drag-point"></div>
                                </div>
                                <iframe src={this.props.applicationScope.projectsUrls.EditorUrl} frameBorder="0" onLoad={this.handleFrameLoaded.bind(this)}></iframe>

                                {this.state.selectedFrame != null && this.props.applicationScope.conditions.notPreview
                                    ? <ContextMenu imageFrameDrag={this.objs.imageFrameDrag} applicationScope={this.props.applicationScope} selectedFrame={this.state.selectedFrame} />
                                    : null}

                                {this.state.resizingPanles
                                    ? <div className="main-panel-resize-area"></div>
                                    : null}
                            </div>
                        </div>
                        <div ref={(x: HTMLDivElement) => this.desktop.bottom = x} className={`bottom-side-bar ${this.state.bottomSideBarCollapsed ? "collapsed" : ""}`}>
                            <BottomToolbox ref={(x: BottomToolbox) => { this.objs.bottomToolbox = x }}
                                applicationScope={this.props.applicationScope} onCollapsedChanged={this.handleBottomToolboxCollapsedChanged.bind(this)}
                                onPageChanged={this.handlePageChanged.bind(this)} onExpanded={this.handleOnExpanded.bind(this)} />
                        </div>
                    </SplitPane>
                </SplitPane>
                {this.props.applicationScope.conditions.notPreview
                    ? <BackgroundSettings ref={(x: BackgroundSettings) => { this.objs.backgroundSettings = x }} applicationScope={this.props.applicationScope} />
                    : null}

                {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                    ? <XmlViewer ref={(x: XmlViewer) => { this.objs.xmlViewer = x }} applicationScope={this.props.applicationScope} />
                    : null}

                {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                    ? <MetadataSettings ref={(x: MetadataSettings) => { this.objs.metadataSettings = x }} applicationScope={this.props.applicationScope} />
                    : null}

                {this.props.applicationScope.conditions.adminOrLayoutOrCoverLayout
                    ? <ResyncMessage ref={(x: ResyncMessage) => { this.objs.resyncMessage = x }} applicationScope={this.props.applicationScope} />
                    : null}

                {!this.props.applicationScope.conditions.photoPoster
                    ? <Covers ref={(x: Covers) => { this.objs.covers = x }} applicationScope={this.props.applicationScope} />
                    : null}

                {this.props.applicationScope.conditions.notPreview
                    ? <PageSettings ref={(x: PageSettings) => { this.objs.pageSettings = x }} applicationScope={this.props.applicationScope}/>
                    : null}

                {this.state.loading || this.state.showSpinner
                    ? <div className="loading">
                    </div>
                    : null}
                {this.state.showSpinner
                    ? <Spinner spinnerName="chasing-dots" />
                    : null}
                <div className="dnd-preview"><img /><span /></div>
                <States applicationScope={this.props.applicationScope} />
            </div>);
    }
}
