// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { DropDown } from "./DropDown";

interface IShapesProps extends EditorPropsBase {
    frameid: string;
}
interface IShapesStates {
    current: string; 
    frameid?: string;
}
export class Shapes extends React.Component<IShapesProps, IShapesStates> {
    constructor() {
        super();
        this.state = { current: "", frameid: "" };
    }

    componentDidMount(): void {
        let shape = this.getSelectedFrameShape();
        this.setState({ current: shape, frameid : this.props.frameid });
    }

    componentWillUpdate(nextProps: IShapesProps, nextState: IShapesStates, nextContext: any): void {
        let shape = this.getSelectedFrameShape();
        if (shape !== nextState.current || nextProps.frameid !== nextState.frameid) {
            this.setState({ current: shape, frameid: nextProps.frameid});
        }
    }

    getSelectedFrameShape() {
        let shape = this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.shp;
        return shape || "0";
    }

    applyShape(item: any) {
        this.props.applicationScope.myCanvasEditor.applyShape(item, this.props.frameid);
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataShapeIndex(item);
        this.setState({ current: item });
    }

    render() {
        return (
            <div className="shapes group paddingLeftRight10px">
                <label>Shapes</label>
                <DropDown options={this.shapes} onChange={this.applyShape.bind(this)} value={this.state.current} />
            </div>
        );
    }

    shapes: Array<string> = [
        "0|Square",
        "1|Triangle",
        "2|Diamond",
        "3|Circle",
        "4|Stadium"];
}
