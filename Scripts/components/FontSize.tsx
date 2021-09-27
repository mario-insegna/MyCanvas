// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { DropDown } from "./DropDown";

interface IProps extends EditorPropsBase { }
interface IState { current: string }
export class FontSize extends React.Component<IProps, IState> {
    constructor() {
        super();
        this.state = { current: '' };
    }

    componentDidMount(): void {
        let size = this.props.applicationScope.myCanvasEditor.getSelectedTextFontSize();
        this.setState({ current: size });
    }

    componentWillUpdate(nextProps: IProps, nextState: IState, nextContext: any): void {
        let size = this.props.applicationScope.myCanvasEditor.getSelectedTextFontSize();
        if (size !== nextState.current) {
            this.setState({ current: size });
        }
    }

    applyFontSize(item: string) {
        this.props.applicationScope.myCanvasEditor.setSelectedTextFontSize(item);
        this.setState({ current: item });
    }

    render() {
        return (
            <DropDown options={this.sizes} onChange={this.applyFontSize.bind(this)} value={this.state.current} />
        );
    }
    sizes: Array<string> = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "24", "32", "48", "72", "96", "120"];
}
