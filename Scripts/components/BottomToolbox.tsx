// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { Toolbox, ToolboxPanel, Docks } from "../components/Toolbox";
import { Pages } from "./Pages";
import { EditorPropsBase } from "../MyCanvasEditor";

interface BottomToolboxRefs {
    pages?: Pages;
}
interface BottomToolboxProps extends EditorPropsBase {
    onCollapsedChanged: (collapsed: boolean) => void;
    onPageChanged: () => void;
    onExpanded?: () => void;
}
export class BottomToolbox extends React.Component<BottomToolboxProps, {}> {
    objs: BottomToolboxRefs = {};
    render() {
        return (
            <Toolbox onExpanded={this.props.onExpanded} applicationScope={this.props.applicationScope}
                dock={Docks.Bottom} startExpanded={true}
                onCollapsedChanged={this.props.onCollapsedChanged}>
                <ToolboxPanel name="Pages">
                    <Pages ref={(x: Pages) => { this.objs.pages = x } }
                        applicationScope={this.props.applicationScope} onPageChanged={this.props.onPageChanged} />
                </ToolboxPanel>
            </Toolbox>);
    }
}