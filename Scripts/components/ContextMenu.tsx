// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase, ChiliObjectTypes } from "../MyCanvasEditor";
import { DropDownFonts } from "./Fonts";
import { MyCanvasColorPicker } from "./ColorPicker";
import { FontSize } from "./FontSize";
import { ButtonBold, ButtonItalic } from "./ButtonBoldItalic";
import { Button, ButtonTitle, ButtonIcon } from "./Button";
import { Borders } from "./Borders";
import { Cropping } from "./Cropping";
import { Subscribers, EvenType } from "../Subscribers";
import { Fetcher } from "../Fetcher";
import { CacheManager, CacheType } from "../CacheManager";


interface ContextMenuProps extends EditorPropsBase {
    selectedFrame: any;
    imageFrameDrag?: HTMLDivElement;
}
interface ContextMenuState {
    position?: { left: number; top: number; };
    display?: boolean;
    frameid?: string;
    isLocked?: boolean;
}
export class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
    constructor() {
        super();
        this.state = { position: { left: 0, top: 0 }, display: false, isLocked: false };
        Subscribers.AddSubscriber("ContextMenu", EvenType.RenderChanged, this, this.getPosition.bind(this));
        Subscribers.AddSubscriber("ContextMenu", EvenType.FrameMoveInProgress, this, this.hideMenu.bind(this));
        Subscribers.AddSubscriber("ContextMenu", EvenType.DocumentDirtyStateChanged, this);
    }

    componentWillUnmount(): void {
        Subscribers.RemoveSubscriber("ContextMenu");
    }

    componentDidMount() {
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        this.setState({ isLocked: isCoverPage && isCoverRestricted });

        this.setState({ frameid: this.props.selectedFrame.id });
        this.getPosition();
    }

    componentWillUpdate(nextProps: ContextMenuProps, nextState: ContextMenuState, nextContext: any): void {
        let frame = this.props.applicationScope.myCanvasEditor.getSelectedFrameType();
        if (frame.id !== nextState.frameid) {
            this.setState({ frameid: frame.id });
            this.getPosition();
            // hide colorpickers
            this.hideColorPickers();
        }
    }

    getPosition() {
        setTimeout(function () {
            let framePosition = this.props.applicationScope.myCanvasEditor.getSelectedFrameMetrics();
            let margin = 10;

            // set pointer for dragging
            (this.props.imageFrameDrag.children[0] as HTMLElement).style.top = `${framePosition.top + (framePosition.height / 2) - 10}px`;
            (this.props.imageFrameDrag.children[0] as HTMLElement).style.left = `${framePosition.left + (framePosition.width / 2) - 10}px`;

            // Prevent context menu from being over the frame.
            let frameContextMenu = document.getElementById("frameContextMenu");
            if (frameContextMenu) {
                let iframe = document.getElementsByTagName("iframe")[0];

                let desktopElements = CacheManager.GetValueFromCache<IDesktop>("desktopElements", CacheType.DesktopVariables);

                // heigth from header
                let hH = desktopElements.header.offsetHeight + desktopElements.bar.offsetHeight;

                // width from left side bar
                let hW = desktopElements.side.offsetWidth;

                // initial top value
                let oH = frameContextMenu.offsetHeight;
                framePosition.top -= oH + margin;
                framePosition.top += hH;

                // initial left value
                let oW = frameContextMenu.offsetWidth;
                framePosition.left += hW;

                // Prevent context menu from being out of view.
                if (framePosition.left < hW) {
                    framePosition.left = hW;
                }
                if (framePosition.top < hH) {
                    framePosition.top = hH;
                }
                if (framePosition.left - hW > iframe.clientWidth - oW) {
                    framePosition.left = iframe.clientWidth - oW + hW;
                }
                if (framePosition.top - hH > iframe.clientHeight - oH) {
                    framePosition.top = iframe.clientHeight - oH + hH;
                }

                this.setState({
                    position: framePosition,
                    display: true
                });

                // refresh colorpickers
                this.refreshColorPickers();
            }
        }.bind(this), 0);
    }

    refreshColorPickers() {
        CacheManager.GetDataByType(CacheType.ColorPickers).forEach(v => (v.Data as MyCanvasColorPicker).getPosition());
    }

    hideColorPickers() {
        CacheManager.GetDataByType(CacheType.ColorPickers).forEach(v => (v.Data as MyCanvasColorPicker).hidePicker());
    }

    hideMenu() {
        this.setState({ display: false });
    }

    render() {
        let frame = this.props.applicationScope.myCanvasEditor.getFrameById(this.state.frameid);
        if ((frame && frame.name === this.props.applicationScope.myCanvasEditor.backgroundFrameName) || (this.state.isLocked && this.props.selectedFrame.type !== ChiliObjectTypes.TextSelection)) return null;

        let content: JSX.Element = null;
        switch (this.props.selectedFrame.type) {
            case ChiliObjectTypes.ImageFrame:
                content = <ImageFrameContextMenu frameid={this.state.frameid} imageFrameDrag={this.props.imageFrameDrag} applicationScope={this.props.applicationScope} />;
                break;
            case ChiliObjectTypes.TextFrame:
                content = <TextFrameContextMenu frameid={this.state.frameid} applicationScope={this.props.applicationScope} />;
                break;
            case ChiliObjectTypes.TextSelection:
                content = <TextSelectionContextMenu frameid={this.state.frameid} applicationScope={this.props.applicationScope} />;
                break;
            case ChiliObjectTypes.LineFrame:
                content = <LineFrameContextMenu applicationScope={this.props.applicationScope} />;
                break;
            case ChiliObjectTypes.RectangleFrame:
                content = <RectangleFrameContextMenu applicationScope={this.props.applicationScope} />;
                break;
        }

        return content === null
            ? null
            : <div id="frameContextMenu" className={`context-menu ${this.state.display ? "" : "hidden"}`} style={{ "left": this.state.position.left, "top": this.state.position.top }}>
                {content}
            </div>;
    }
}

interface ImageFrameContextMenuProps extends EditorPropsBase {
    imageFrameDrag?: HTMLDivElement;
    frameid?: string;
}
interface ImageFrameContextMenuState {
    flipHorizontal?: boolean;
    cropHidden?: boolean;
}
class ImageFrameContextMenu extends React.Component<ImageFrameContextMenuProps, ImageFrameContextMenuState> {
    constructor() {
        super();
        this.state = { flipHorizontal: null, cropHidden: true };
    }

    componentDidMount(): void {
        let flipHorizontal = this.props.applicationScope.myCanvasEditor.hasSelectedFrameHorizontalFlip();
        this.setState({ flipHorizontal: flipHorizontal });
        this.props.imageFrameDrag.ondblclick = this.handleCrop.bind(this);
    }

    componentWillUpdate(nextProps: Object, nextState: ImageFrameContextMenuState, nextContext: any): void {
        let flipHorizontal = this.props.applicationScope.myCanvasEditor.hasSelectedFrameHorizontalFlip();
        if (flipHorizontal !== nextState.flipHorizontal) {
            this.setState({ flipHorizontal: flipHorizontal });
        }
    }

    flipHorizontalOnClick() {
        this.props.applicationScope.myCanvasEditor.toggleSelectedFrameFlipHorizontally();
        this.setState({ flipHorizontal: !this.state.flipHorizontal });
    }

    reSyncOnClick() {
        Fetcher.postJson("/EditorApi/Page/ResyncImageElement",
            this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata())
            .then(function (data: ResyncImageElementResult) {
                this.props.applicationScope.myCanvasEditor.setSelectedFrameImage(
                    data.result.ImageId,
                    data.result.Name,
                    this.props.applicationScope.projectsUrls.PwsUrl + "/" + data.result.Url,
                    this.props.applicationScope.projectsUrls.PwsUrl + "/" + data.result.ThumbUrl,
                    this.props.applicationScope.projectsUrls.PwsUrl + "/" + data.result.Url,
                    data.result.Width,
                    data.result.Height,
                    '300 kb');
            }.bind(this));
    }

    handleCrop() {
        this.setState({ cropHidden: !this.state.cropHidden });
        if (this.state.cropHidden) this.props.applicationScope.myCanvasEditor.setImageFrameFitMode("manual");
        Subscribers.UpdateSubscribers(EvenType.RenderChanged);
    }

    render() {
        let cropping = <Cropping hidden={this.state.cropHidden} handleCrop={this.handleCrop.bind(this)} imageFrameDrag={this.props.imageFrameDrag} applicationScope={this.props.applicationScope} />;
        let render = this.state.cropHidden
            ? <div className="sub-context-menu">
                {cropping}
                <div className="button-group">
                    <Borders applicationScope={this.props.applicationScope} />
                </div>
                {this.props.applicationScope.projectParameters.PartnerId > 0 &&
                    this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.sync
                    ? <div className="button-group">
                        <Button icon={ButtonIcon.Resync} title={ButtonTitle.Resync} enabled={true} onClick={this.reSyncOnClick.bind(this)} noborder={true} />
                    </div>
                    : null}
                <CommonFrameContextMenuItems imageMenu={true} flipHorizontal={this.state.flipHorizontal} flipHorizontalOnClick={this.flipHorizontalOnClick.bind(this)} applicationScope={this.props.applicationScope} />
            </div>
            : <div className="sub-context-menu">{cropping}</div>;
        return render;
    }
}

class LineFrameContextMenu extends React.Component<EditorPropsBase, {}> {
    render() {
        return <div className="sub-context-menu">
            <div className="button-group">
                <Borders applicationScope={this.props.applicationScope} />
            </div>
            <CommonFrameContextMenuItems applicationScope={this.props.applicationScope} />
        </div>;
    }
}

class RectangleFrameContextMenu extends React.Component<EditorPropsBase, {}> {

    handleColorPickerGetter() {
        return this.props.applicationScope.myCanvasEditor.getSelectedFrameFillColor();
    }

    handleColorPickerSetter(r: number, g: number, b: number) {
        this.props.applicationScope.myCanvasEditor.setSelectedFrameFillColor(r, g, b);
    }

    render() {
        return <div className="sub-context-menu">
            <div className="button-group">
                <div className="borders paddingRight15px">
                    <label className="super">Fill</label>
                    <MyCanvasColorPicker
                        textSelection={true}
                        className={"top-8px"}
                        getter={this.handleColorPickerGetter.bind(this)}
                        setter={this.handleColorPickerSetter.bind(this)} />
                </div>
            </div>
            <div className="button-group">
                <Borders applicationScope={this.props.applicationScope} />
            </div>
            <CommonFrameContextMenuItems applicationScope={this.props.applicationScope} />
        </div>;
    }
}

interface ITextFrameContextMenuProps extends EditorPropsBase {
    frameid?: string;
}
class TextFrameContextMenu extends React.Component<ITextFrameContextMenuProps, {}> {
    reSyncOnClick() {
        Fetcher.postJson("/EditorApi/Page/ResyncTextElement",
            this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata())
            .then(function (data: ResyncTextElementResult) {
                this.props.applicationScope.myCanvasEditor.setSelectedFrameText(data.result, false, this.props.frameid);
            }.bind(this));
    }
    handleSelectClick() {
        this.props.applicationScope.myCanvasEditor.turnOnEditingMode();
    }
    render() {
        return (
            <div className="sub-context-menu">
                <div className="button-group">
                    <Button icon={ButtonIcon.EditingOn} title={ButtonTitle.EditingOn} enabled={true} onClick={this.handleSelectClick.bind(this)} noborder={true} />
                </div>
                {this.props.applicationScope.projectParameters.PartnerId > 0 &&
                    this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.sync
                    ? <div className="button-group">
                        <Button icon={ButtonIcon.Resync} title={ButtonTitle.Resync} enabled={true} onClick={this.reSyncOnClick.bind(this)} noborder={true} />
                    </div>
                    : null}
                <CommonFrameContextMenuItems applicationScope={this.props.applicationScope} />
            </div>
        );
    }
}

interface CommonFrameContextMenuItemsState {
    shadow?: boolean;
    opacity?: number;
}
interface CommonFrameContextMenuItemsProps extends EditorPropsBase {
    imageMenu?: boolean;
    flipHorizontal?: boolean;
    flipHorizontalOnClick?: () => void;

}
class CommonFrameContextMenuItems extends React.Component<CommonFrameContextMenuItemsProps, CommonFrameContextMenuItemsState> {
    constructor() {
        super();
        this.state = { shadow: null, opacity: 100 };
    }

    componentDidMount(): void {
        let shadow = this.props.applicationScope.myCanvasEditor.hasSelectedFrameDropShadow();
        let opacity = this.props.applicationScope.myCanvasEditor.getSelectedFrameOpacity();
        this.setState({ shadow: shadow, opacity: opacity });
    }

    componentWillUpdate(nextProps: Object, nextState: CommonFrameContextMenuItemsState, nextContext: any): void {
        let shadow = this.props.applicationScope.myCanvasEditor.hasSelectedFrameDropShadow();
        let opacity = this.props.applicationScope.myCanvasEditor.getSelectedFrameOpacity();
        if (shadow !== nextState.shadow || opacity !== nextState.opacity) {
            this.setState({ shadow: shadow, opacity: opacity });
        }
    }

    shadowOnClick() {
        this.props.applicationScope.myCanvasEditor.toggleSelectedFrameDropShadow();
        this.setState({ shadow: !this.state.shadow });
    }

    handleOpacityChanged(uiEvent: UIEvent) {
        let opacity = parseInt((uiEvent.target as HTMLInputElement).value);
        this.setState({ opacity: opacity });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameOpacity(opacity);
    }

    render() {
        return (
            <div className="sub-context-menu">
                <div className="button-group">
                    <div>-  OPACITY  +</div>
                    <div className="divinput">
                        <input type="range" min="0" max="100" onChange={this.handleOpacityChanged.bind(this)} value={this.state.opacity.toString()} />
                    </div>
                    <div className="frame-group-content"></div>
                </div>
                {this.props.imageMenu ?
                    <div className="button-group">
                        <Button icon={ButtonIcon.FlipH} title={ButtonTitle.FlipH} active={this.props.flipHorizontal} enabled={true} onClick={this.props.flipHorizontalOnClick.bind(this)} noborder={true} />
                        <div>Flip</div>
                    </div>
                    : null}
                <div className="button-group">
                    <Button icon={ButtonIcon.Shadow} title={ButtonTitle.Shadow} onlyIcon={true}
                        active={this.state.shadow} enabled={true} onClick={this.shadowOnClick.bind(this)} noborder={true} />
                    <div>Shadow</div>

                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Front} title={ButtonTitle.Front} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.bringSelectedFrameToFront.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div>Bring to Front</div>
                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Forward} title={ButtonTitle.Forward} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.moveSelectedFrameForward.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div >Forward</div>
                </div>

                <div className="button-group">
                    <Button icon={ButtonIcon.Backward} title={ButtonTitle.Backward} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.moveSelectedFrameBackwards.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div >Backward</div>
                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Back} title={ButtonTitle.Back} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.sendSelectedFrameToBack.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div>Send to Back</div>
                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Duplicate} title={ButtonTitle.Duplicate} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.duplicateSelectedFrame.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div >Duplicate</div>
                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Delete} title={ButtonTitle.Delete} onlyIcon={true}
                        enabled={true} onClick={this.props.applicationScope.myCanvasEditor.deleteSelectedFrame.bind(this.props.applicationScope.myCanvasEditor)} noborder={true} />
                    <div>Delete</div>
                </div>
            </div>);
    }
}

enum TextAlign {
    Left = ("left") as any,
    Center = ("center") as any,
    Justify = ("justify") as any,
    Right = ("right") as any
}
interface ITextSelectionContextMenuProps extends EditorPropsBase {
    frameid?: string;
}
interface TextSelectionContextMenuState {
    alignment?: TextAlign;
    underline?: string;
    isLocked?: boolean;
}
class TextSelectionContextMenu extends React.Component<ITextSelectionContextMenuProps, TextSelectionContextMenuState> {
    constructor() {
        super();
        this.state = { alignment: null, underline: "", isLocked: false };
        Subscribers.AddSubscriber("TextSelectionContextMenu", EvenType.TextSelectionChanged, this, this.textSelectionChanged.bind(this));
    }

    componentDidMount() {
        let state: any = this.getState();
        this.setState({ alignment: state.alignment, underline: state.underline, isLocked: state.isLocked });
    }

    componentWillUnmount() {
        Subscribers.RemoveSubscriber("TextSelectionContextMenu");
    }

    componentWillUpdate(nextProps: EditorPropsBase, nextState: TextSelectionContextMenuState) {
        let state: any = this.getState();
        if (state.alignment !== nextState.alignment || state.underline !== nextState.underline || state.isLocked !== nextState.isLocked) {
            this.setState({ alignment: state.alignment, underline: state.underline, isLocked: state.isLocked });
        }
    }

    textSelectionChanged() {
        this.validateTextMaxLength();
        this.updateTagFromContent();
    }

    validateTextMaxLength() {
        if (this.state.isLocked) {
            let maxLength = this.props.applicationScope.myCanvasEditor.getTextFlowMaxLength();
            let text = this.props.applicationScope.myCanvasEditor.getSelectedFrameText();
            if (text.plain.length > maxLength) {
                text.formatted = text.formatted.replace(text.plain, text.plain.substring(0, maxLength));
                this.props.applicationScope.myCanvasEditor.setSelectedTextFrameText(text.formatted);
                alert(`Maximum length allowed is "${maxLength}"`);
            }
        }
    }

    updateTagFromContent() {
        if (this.props.applicationScope.conditions.layoutOrCoverLayout) {
            this.props.applicationScope.myCanvasEditor.updateTagFromContent(this.props.frameid);
        }
    }

    getState() {
        let alignment: any = this.props.applicationScope.myCanvasEditor.getSelectedTextAlignment();
        let underline: any = this.props.applicationScope.myCanvasEditor.getSelectedTextUnderline();
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isLocked: any = isCoverPage && isCoverRestricted;
        return { alignment, underline, isLocked };
    }

    handleTextAlignmentClick(button: Button) {
        this.setState({ alignment: button.props.value as TextAlign });
        this.props.applicationScope.myCanvasEditor.setSelectedTextAlignment(button.props.value);
    }

    handleUnderlineClick() {
        let newValue: any = this.state.underline !== "false" ? "false" : "true";
        this.props.applicationScope.myCanvasEditor.setSelectedTextUnderline(newValue);
        this.setState({ underline: newValue });
    }

    handleUnselectClick() {
        this.props.applicationScope.myCanvasEditor.turnOffEditingMode();
    }

    getter() {
        return this.props.applicationScope.myCanvasEditor.getSelectedTextColor();
    }

    setter(r: number, g: number, b: number) {
        this.props.applicationScope.myCanvasEditor.setSelectedTextColor(r, g, b);
    }

    reSyncOnClick() {
        Fetcher.postJson("/EditorApi/Page/ResyncTextElement",
            this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata())
            .then(function (data: ResyncTextElementResult) {
                this.props.applicationScope.myCanvasEditor.setSelectedFrameText(data.result, true);
            }.bind(this));
    }

    render() {
        return (
            this.state.isLocked
                ? <div className="button-group">
                    <Button icon={ButtonIcon.EditingOff} title={""} enabled={false} onClick={() => { return; }} noborder={true} />
                    {this.props.applicationScope.projectParameters.PartnerId > 0 &&
                        this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.sync
                        ? <div className="button-group">
                            <Button icon={ButtonIcon.Resync} title={ButtonTitle.Resync} enabled={true} onClick={this.reSyncOnClick.bind(this)} noborder={true} />
                        </div>
                        : null}
                </div>
                : <div className="sub-context-menu">
                    <div className="button-group">
                        <Button icon={ButtonIcon.EditingOff} title={ButtonTitle.EditingOff} enabled={true} active={true} onClick={this.handleUnselectClick.bind(this)} noborder={true} />
                    </div>
                    <div className="button-group paddingRight15px">
                        <label>&nbsp;</label>
                        <DropDownFonts applicationScope={this.props.applicationScope} />
                        <label></label>
                        <FontSize applicationScope={this.props.applicationScope} />
                        <MyCanvasColorPicker
                            className={"top-3px"}
                            getter={this.getter.bind(this)}
                            setter={this.setter.bind(this)}
                            textSelection={true} />
                    </div>
                    <div className="button-group">
                        <ButtonBold applicationScope={this.props.applicationScope} noborder={true} />
                    </div>
                    <div className="button-group">
                        <ButtonItalic applicationScope={this.props.applicationScope} noborder={true} />
                    </div>
                    <div className="button-group">
                        <Button icon={ButtonIcon.Underline} title={ButtonTitle.Underline} noborder={true}
                            enabled={true} active={this.state.underline === "true"} onClick={this.handleUnderlineClick.bind(this)} />
                    </div>

                    <div className="button-group">
                        <Button icon={ButtonIcon.AlignLeft} title={ButtonTitle.AlignLeft} noborder={true}
                            active={this.state.alignment === TextAlign.Left} enabled={true} value={TextAlign.Left} onClick={this.handleTextAlignmentClick.bind(this)} />
                        <div>Left</div>
                    </div>
                    <div className="button-group">
                        <Button icon={ButtonIcon.AlignCenter} title={ButtonTitle.AlignCenter} noborder={true}
                            active={this.state.alignment === TextAlign.Center} enabled={true} value={TextAlign.Center} onClick={this.handleTextAlignmentClick.bind(this)} />
                        <div>Center</div>
                    </div>
                    <div className="button-group">
                        <Button icon={ButtonIcon.AlignRight} title={ButtonTitle.AlignRight} noborder={true}
                            active={this.state.alignment === TextAlign.Right} enabled={true} value={TextAlign.Right} onClick={this.handleTextAlignmentClick.bind(this)} />
                        <div>Right</div>
                    </div>
                    <div className="button-group">
                        <Button icon={ButtonIcon.AlignJustify} title={ButtonTitle.AlignJustify} noborder={true}
                            active={this.state.alignment === TextAlign.Justify} enabled={true} value={TextAlign.Justify} onClick={this.handleTextAlignmentClick.bind(this)} />
                        <div>Full</div>
                    </div>
                </div >

        );
    }
}
