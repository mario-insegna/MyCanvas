// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { ModalEx } from "../ModalEx";
import { ClassicButton } from "./ClassicButton";

export enum Dimension {
    Small,
    Medium,
    Large
}

interface ModalProps extends EditorPropsBase {
    title: string;
    useUndoRedo: boolean;
    handleClosed?: () => void;
    dimension: Dimension;
    contentSelector?: string;
}
interface ModalState {
    opened?: boolean;
    clientWidth?: any;
    clientHeight?: any;
}
export class Modal extends React.Component<ModalProps, ModalState> {
    constructor() {
        super();
        this.state = {
            opened: false,
            clientWidth: 0,
            clientHeight: 0
        };
        Subscribers.AddSubscriber("Modal", EvenType.RenderChanged, this, this.handleRenderChanged.bind(this));
    }
    handleRenderChanged() {
        ModalEx.setContentDiv();
    }
    show() {
        this.setState({ opened: true });
        if (this.props.useUndoRedo) this.props.applicationScope.myCanvasEditor.beginUndoableOperations('Settings');
        ModalEx.setMetrics(this.props.contentSelector);
        ModalEx.setContentDiv();
    }
    close() {
        this.setState({ opened: false });
        if (this.props.useUndoRedo) this.props.applicationScope.myCanvasEditor.endUndoableOperations();
        if (this.props.handleClosed) this.props.handleClosed();
    }
    handlePanelClick(uiEvent: UIEvent) {
        uiEvent.stopPropagation();
    }
    handleCancelClick(uiEvent: UIEvent) {
        if (this.props.useUndoRedo) this.props.applicationScope.myCanvasEditor.setUndoManagerAction("Undo", 1);
        this.close();
    }
    render() {
        return (
            <div className={this.state.opened ? "modal in" : "modal"} onClick={this.close.bind(this)}>
                <div className="modal-panel" onClick={this.handlePanelClick.bind(this)}>
                    <div className="modal-header">
                        {this.props.title}
                        <button className="modal-close" onClick={this.close.bind(this)}>X</button>
                    </div>
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">                     
                        <ClassicButton text={"Cancel"} enabled={true} onClick={this.handleCancelClick.bind(this)} />
                    </div>
                </div>
            </div>);
    }
}
