// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { DropDown } from "./DropDown";
import { MyCanvasColorPicker } from "./ColorPicker";

interface IProps extends EditorPropsBase { }
interface IStates { current: string; }
export class Borders extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { current: "" };
    }

    componentDidMount(): void {
        let border = this.props.applicationScope.myCanvasEditor.getSelectedFrameBorderWidth();
        this.setState({ current: border });
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any): void {
        let border = this.props.applicationScope.myCanvasEditor.getSelectedFrameBorderWidth();
        if (border !== nextState.current) {
            this.setState({ current: border });
        }
    }

    applyBorderWidth(item: any) {
        this.props.applicationScope.myCanvasEditor.setSelectedFrameBorderWidth(item);
        this.setState({ current: item });
    }

    handleColorPickerGetter() {
        return this.props.applicationScope.myCanvasEditor.getSelectedFrameBorderColor();
    }

    handleColorPickerSetter(r: number, g: number, b: number) {
        this.props.applicationScope.myCanvasEditor.setSelectedFrameBorderColor(r, g, b);
    }

    render() {
        return (
            <div className="borders group paddingRight15px">
                <label>Border</label>
                <DropDown options={this.borders} onChange={this.applyBorderWidth.bind(this)} value={this.state.current} />
                {this.state.current === this.borders[0]
                    ? null
                    : <MyCanvasColorPicker
                        className={"top-3px"}
                        textSelection={true}
                        getter={this.handleColorPickerGetter.bind(this)}
                        setter={this.handleColorPickerSetter.bind(this)} />
                }
            </div>
        );
    }

    borders: Array<string> = [
        "0|None",
        "1|1pt",
        "2|2pt",
        "3|3pt",
        "4|4pt",
        "5|5pt",
        "6|6pt",
        "7|7pt",
        "8|8pt",
        "9|9pt",
        "10|10pt",
        "20|20pt"];
}
