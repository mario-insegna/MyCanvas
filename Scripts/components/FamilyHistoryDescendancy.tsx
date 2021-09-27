// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";

interface IFamilyHistoryDescendancyProps extends EditorPropsBase { }

interface IFamilyHistoryDescendancyStates {
    
}

interface IFamilyHistoryDescendancyObjs {
    modal?: Modal;
}
export class FamilyHistoryDescendancy extends React.Component<IFamilyHistoryDescendancyProps, IFamilyHistoryDescendancyStates> {
    objs: IFamilyHistoryDescendancyObjs = {};
    constructor() {
        super();
    }

    render() {
        return (
            <Modal dimension={Dimension.Medium} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title={"Descendant Tree Options"} applicationScope={this.props.applicationScope}>
                Not implemented...
            </Modal>
        );
    }
}