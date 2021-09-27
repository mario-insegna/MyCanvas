// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Button, ButtonTitle, ButtonIcon } from "./Button";

interface IProps extends EditorPropsBase {
    disabled: boolean;
}
interface IStates { }
export class Frames extends React.Component<IProps, IStates> {
    constructor() {
        super();
    }

    handleTextClick(uiEvent: UIEvent) {
        this.props.applicationScope.myCanvasEditor.createDefaultTextFrame();
    }

    handleLineClick(uiEvent: UIEvent) {
        this.props.applicationScope.myCanvasEditor.createDefaultLineFrame();
    }

    handleRectangleClick(uiEvent: UIEvent) {
        this.props.applicationScope.myCanvasEditor.createDefaultRectangleFrame();
    }

    handleImageClick(uiEvent: UIEvent) {
        this.props.applicationScope.myCanvasEditor.createDefaultImageFrame();
    }

    render(): JSX.Element {
        return this.props.disabled ? null :
            <div>
                <div className="button-group">
                    <div className="divTextBox">
                        <span className="icon-plus iconsmall" onClick={this.handleTextClick.bind(this)}></span>
                        <span className="icon-textbox" onClick={this.handleTextClick.bind(this)}></span>
                    </div>
                    <div className="labelTextBox">
                        Add Text Box
                    </div>
                </div>
                 <div className="button-group">
                        <span className="icon-plus iconsmall" onClick={this.handleLineClick.bind(this)}></span>
                        <span className="icon-line" onClick={this.handleLineClick.bind(this)}></span>
                        <div className="labelAddLine">
                            Add Line Box
                        </div>
                    </div>
                {this.props.applicationScope.conditions.photoPoster
                    ? null
                    : <div className="button-group">
                        <div className="divAddBox">
                            <span className="icon-plus iconsmall" onClick={this.handleRectangleClick.bind(this)}></span>
                            <span className="icon-box" onClick={this.handleRectangleClick.bind(this)}></span>
                        </div>
                        <div className="labelAddBox">
                            Add Box
                        </div>
                    </div>}
                {this.props.applicationScope.conditions.layoutOrCoverLayout
                    ?
                    <div className="button-group">
                        <Button icon={ButtonIcon.AddImage} title={ButtonTitle.AddImage} enabled={true} onClick={this.handleImageClick.bind(this)} />
                        <Button icon={ButtonIcon.Select} title={ButtonTitle.Select} enabled={true} onClick={() => this.props.applicationScope.myCanvasEditor.setCursor("selection")} />
                    </div>
                    : null}

            </div>;
    }
}