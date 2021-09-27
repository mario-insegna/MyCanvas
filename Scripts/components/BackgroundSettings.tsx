// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { DropDown } from "./DropDown";
import { Subscribers, EvenType } from "../Subscribers";

interface BackgroundSettingsRefs {
    modal?: Modal;
}
interface BackgroundSettingsState {
    fitPoint?: string;
    flipHorizontal?: boolean;
    opacity?: number;
    editorDocumentLoaded?: boolean;
}
export class BackgroundSettings extends React.Component<EditorPropsBase, BackgroundSettingsState> {
    objs: BackgroundSettingsRefs = {};
    constructor() {
        super();
        Subscribers.AddSubscriber("BackgroundSettings", EvenType.EditorDocumentLoaded, this, this.onEditorReady.bind(this));
        this.state = {
            fitPoint: "",
            flipHorizontal: false,
            opacity: 100,
            editorDocumentLoaded: false
        }
    }
    onEditorReady() {
        this.setState({ editorDocumentLoaded: true});
    }
    handleFitPointChanged(value: string) {
        this.setState({ fitPoint: value });
        this.props.applicationScope.myCanvasEditor.setBackgroundFrameFitPoint(value);
    }
    handleFliphorizontalChanged(uiEvent: UIEvent) {
        this.setState({ flipHorizontal: (uiEvent.target as HTMLInputElement).checked });
        this.props.applicationScope.myCanvasEditor.toggleBackgroundFrameFlipHorizontally();
    }
    handleOpacityChanged(uiEvent: UIEvent) {
        let opacity = parseInt((uiEvent.target as HTMLInputElement).value);
        this.setState({ opacity: opacity });
        this.props.applicationScope.myCanvasEditor.setBackgroundFrameOpacity(opacity);
    }
    componentDidMount() {
        this.refresh();
    }
    componentWillUpdate(nextProps: EditorPropsBase, nextState: BackgroundSettingsState) {
        let data = this.data();
        if (!data) return;
        if (data.fitPoint !== nextState.fitPoint ||
            data.flipHorizontal !== nextState.flipHorizontal ||
            data.opacity !== nextState.opacity) {
            this.setState({
                fitPoint: data.fitPoint,
                flipHorizontal: data.flipHorizontal,
                opacity: data.opacity
            });
        }
    }
    refresh() {
        let data = this.data();
        if (!data) return;
        this.setState({
            fitPoint: data.fitPoint,
            flipHorizontal: data.flipHorizontal,
            opacity: data.opacity
        });
    }
    data() {
        if (!this.state.editorDocumentLoaded) return;
        return {
            fitPoint: this.props.applicationScope.myCanvasEditor.getBackgroundFrameFitPoint(),
            flipHorizontal: this.props.applicationScope.myCanvasEditor.hasBackgroundFrameHorizontalFlip(),
            opacity: this.props.applicationScope.myCanvasEditor.getBackgroundFrameOpacity()
        };
    }
    render() {
        return (
            <Modal dimension={Dimension.Small} useUndoRedo={true} ref={(x: Modal) => { this.objs.modal = x }} title="Background Settings" applicationScope={this.props.applicationScope}>
                <div className="background-settings">
                    <div className="field-group">
                        <div className="field-label">Fit point</div>
                        <div className="field-control">
                            <DropDown options={this.fitPoints} onChange={this.handleFitPointChanged.bind(this)} value={this.state.fitPoint} />
                        </div>
                    </div>
                    <div className="field-group">
                        <div className="field-label">Flip horizontally</div>
                        <div className="field-control">
                            <input type="checkbox" onChange={this.handleFliphorizontalChanged.bind(this)} checked={this.state.flipHorizontal} />
                        </div>
                    </div>
                    <div className="field-group">
                        <div className="field-label">Opacity</div>
                        <div className="field-control">
                            <input type="range" min="0" max="100" onChange={this.handleOpacityChanged.bind(this)} value={this.state.opacity.toString()} />
                        </div>
                    </div>
                </div>
            </Modal>);
    }
    fitPoints: Array<string> = ["topleft|top left", "top", "topright|top right", "left", "center", "right", "bottomleft|bottom left", "bottom", "bottomright|bottom right"];
}
