// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { ObjectAssign } from "../Polyfills";

interface IContextMenuButtonProps {
    icon: any;
    active?: boolean;
    enabled: boolean;
    hidden?: boolean;
    noborder?: boolean;
    title: any;
    value?: any;
    onClick: (button: Button) => void;
    styleActive?: React.CSSProperties;
    styleInactive?: React.CSSProperties;
    onlyIcon?: boolean;
}

export class Button extends React.Component<IContextMenuButtonProps, {}> {
    handleClick() {
        this.props.onClick(this);
    }
    render() {
        const noBorder: React.CSSProperties = {
            border: "none"
        };
        let styleActive = ObjectAssign(this.props.noborder ? noBorder : {}, this.props.styleActive);
        let styleInactive = ObjectAssign(this.props.noborder ? noBorder : {}, this.props.styleInactive);
        return this.props.hidden
            ? null
            : this.props.enabled
                ? <div style={styleActive} title={this.props.title} className={this.props.onlyIcon ? "" : this.props.active ? "button active" : "button"} onClick={() => this.handleClick()}>{this.props.icon}</div>
                : <div style={styleInactive} title={this.props.title} className={"button inactive"}>{this.props.icon}</div>;
                
    }
}

export enum ButtonTitle {
    EditingOn = ("Turn editing on") as any,
    EditingOff = ("Turn editing off") as any,
    Duplicate = ("Duplicate the selected item(s)") as any,
    Shadow = ("Add or remove a drop shadow") as any,
    Front = ("Move the selected item(s) to Front") as any,
    Back = ("Move the selected item(s) to Back") as any,
    Backward = ("Move the selected item(s) Backward") as any,
    Forward = ("Move the selected item(s) Forward") as any,
    Delete = ("Delete the selected item(s)") as any,
    Underline = ("Underline the text") as any,
    Italic = ("Italicise the text") as any,
    Bold = ("Make the text bold") as any,
    AlignLeft = ("Align text to the left") as any,
    AlignRight = ("Align text to the right") as any,
    AlignCenter = ("Center the text") as any,
    AlignJustify = ("Justify the text") as any,
    AddText = ("Create a new text box") as any,
    AddLine = ("Create a new line box") as any,
    AddRectangle = ("Create a new rectangle box") as any,
    AddImage = ("Create a new image box") as any,
    FlipH = ("Flip the image horizontally") as any,
    Undo = ("Undo last change") as any,
    Redo = ("Redo last change") as any,
    Resync = ("ReSync") as any,
    Crop = ("Cropping image") as any,
    Plus = ("Increment") as any,
    Minus = ("Decrement") as any,
    Zout = ("Zoom out") as any,
    Zin = ("Zoom in") as any,
    FitIn = ("Fit image in container") as any,
    ArrowL = ("Move to left") as any,
    ArrowR = ("Move to right") as any,
    ArrowU = ("Move up") as any,
    ArrowD = ("Move down") as any,
    AddNewEmptyPage = ("Add Blank Page") as any,
    AddFromLayout = ("Add From Layout") as any,
    AddPages = ("Add Page(s)") as any,
    DeletePage = ("Delete a Page") as any,
    DeleteSelectedPages = ("Delete page/s") as any,
	SaveProject = ("SAVE WORK") as any,
    Select = ("Select multiple objects") as any,
    DeleteSelectedImages = ("Delete image/s") as any,
    Cover = ("Cover") as any,
}

export enum ButtonIcon {
    EditingOn = (<span className="icon-pencil2"></span>) as any,
    EditingOff = (<span className="icon-pencil2"></span>) as any,
    Duplicate = (<span className="icon-duplicate"></span>) as any,
    Shadow = (<span className="icon-shadow"></span>) as any,
    Front = (<span className="icon-front"></span>) as any,
    Back = (<span className="icon-back"></span>) as any,
    Backward = (<span className="icon-backward"></span>) as any,
    Forward = (<span className="icon-forward"></span>) as any,
    Delete = (<span className="icon-trash"></span>) as any,
    Underline = (<u>U</u>) as any,
    Italic = ("I") as any,
    Bold = ("B") as any,
    AlignLeft = (<span className="icon-lalign"></span>) as any,
    AlignRight = (<span className="icon-ralign"></span>) as any,
    AlignCenter = (<span className="icon-center"></span>) as any,
    AlignJustify = (<span className="icon-justify"></span>) as any,
    AddText = (<span className="icon-textbox"></span>) as any,
    AddLine = (<span className="icon-line"></span>) as any,
    AddRectangle = (<span className="icon-box"></span>) as any,
    AddImage = ("CI") as any,
    BackgroundSettings = (<span className="icon-background"></span>) as any,
    FlipH = (<span className="icon-flip"></span>) as any,
    Undo = (<span className="icon-undo"></span>) as any,
    Redo = (<span className="icon-redo"></span>) as any,
    Resync = (<span className="icon-sync"></span>) as any,
    Crop = (<span className="icon-crop"></span>) as any,
    Plus = (<span className="icon-plus"></span>) as any,
    Minus = (<span className="icon-minus"></span>) as any,
    Zin = (<span className="icon-zin"></span>) as any,
    Zout = (<span className="icon-zout"></span>) as any,
    FitIn = (<span className="icon-fit"></span>) as any,
    ArrowL = ("←") as any,
    ArrowR = ("→") as any,
    ArrowU = ("↑") as any,
    ArrowD = ("↓") as any,
    AddPages = ("Add Page(s)") as any,
    AddNewEmptyPage = ("Add empty Page") as any,
    DeletePage = ("Delete a Page") as any,
    DeleteSelectedPages = ("Delete selected pages") as any,
	SaveProject = ("SAVE WORK") as any,
    Select = ("SE") as any,
    DeleteSelectedImages = ("Delete selected images") as any,
    PageSettings = (<span className="icon-pagesettings"></span>) as any,
    Cover = (<span className="icon-cover"></span>) as any,
}
