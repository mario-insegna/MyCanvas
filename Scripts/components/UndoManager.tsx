// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { DropDown } from "./DropDown";
import { Button, ButtonTitle, ButtonIcon } from "./Button";

interface IProps extends EditorPropsBase {
    disabled: boolean;
}
interface IState {
    undoList: Array<any>;
    redoList: Array<any>;
}
export class UndoManager extends React.Component<IProps, IState> {
    constructor() {
        super();
        this.state = {
            undoList: new Array<any>(),
            redoList: new Array<any>()
        }
        Subscribers.AddSubscriber("UndoManager", EvenType.UndoStackChanged, this, this.refresh.bind(this));
        Subscribers.AddSubscriber("UndoManager", EvenType.FrameMoveInProgress, this, this.refresh.bind(this));
    }
    
    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount(): void {
        Subscribers.RemoveSubscriber("UndoManager");
    }

    predicate = (item: any) => this.props.applicationScope.myCanvasEditor.getUndoManagerPredicate(item);

    optionParser(source: Array<any>, onClick: (value: any) => void) {
        return source.map((item: any, i: number) => {
            if (this.predicate(item)) {
                return <div key={item.index} onClick={() => onClick(item.index)} className="dropdown-option">
                    {item.name}
                </div>;
            }
            return null;
        });
    }

    buildUndoStack(source: Array<any>) {
        for (let j = 0; j < source.length; j++) {
            source[j].index = j;
        }
        return source;
    }

    buildRedoStack(source: Array<any>) {
        return this.buildUndoStack(source.reverse());
    }

    handleUndoStackClick(i: number) {
        this.props.applicationScope.myCanvasEditor.setUndoManagerAction("Undo", 1 + i);
    }
    handleRedoStackClick(i: number) {
        this.props.applicationScope.myCanvasEditor.setUndoManagerAction("Redo", 1 + i);
    }

    handleFirstUndoStackClick(stack: Array<any>) {
        if (stack.length)
            this.handleUndoStackClick(stack[0].index);
    }

    handleFirstRedoStackClick(stack: Array<any>) {
        if (stack.length)
            this.handleRedoStackClick(stack[0].index);
    }

    refresh() {
        this.setState({
            undoList: this.buildUndoStack(this.props.applicationScope.myCanvasEditor.getUndoManagerUndoStack()),
            redoList: this.buildRedoStack(this.props.applicationScope.myCanvasEditor.getUndoManagerRedoStack())
        });
    }

    clearStack() {
        this.props.applicationScope.myCanvasEditor.clearUndoManager();
        this.refresh();
    }

    isEnabled(source: Array<any>): boolean {
        return source !== null && source.length > 0 && source.filter(item => this.predicate(item)).length > 0;
    }

    isDisabled(source: Array<any>): boolean {
        return source === null || source.length === 0 || source.filter(item => this.predicate(item)).length === 0;
    }

    render() {
        return ( this.props.disabled ? null :
            <div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Undo} title={ButtonTitle.Undo}
                        onClick={() => this.handleFirstUndoStackClick(this.state.undoList)} enabled={this.isEnabled(this.state.undoList)}>◄</Button>
                </div>
                <div className="button-group">
                    <Button icon={ButtonIcon.Redo} title={ButtonTitle.Redo}
                        onClick={() => this.handleFirstRedoStackClick(this.state.redoList)} enabled={this.isEnabled(this.state.redoList)}>►</Button>
                </div>
            </div>);
    }
}