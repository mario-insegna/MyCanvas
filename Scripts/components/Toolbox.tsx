// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";

export enum Docks {
    Left,
    Bottom
}
interface ToolboxRefs {
    toolboxPanelList?: ToolboxPanel[];
    toolboxPanelTogglerList?: ToolboxPanelToggler[];
}
interface ToolboxProps extends EditorPropsBase {
    dock: Docks;
    startExpanded?: boolean;
    onExpanded?: () => void;
    onCollapsedChanged: (collapsed: boolean) => void;
}
interface ToolboxState {
    collapsed?: boolean;
}
export class Toolbox extends React.Component<ToolboxProps, ToolboxState> {
    objs: ToolboxRefs = {
        toolboxPanelList: new Array<ToolboxPanel>(),
        toolboxPanelTogglerList: new Array<ToolboxPanelToggler>()
    };
    constructor() {
        super();
        this.state = {
            collapsed: true
        }
    }
    toggleActiveToolboxPanel(index: number) {
        let oneActive: boolean = false;
        this.objs.toolboxPanelList.forEach((toolboxPanel: ToolboxPanel, i: number) => {
            if (i !== index) {
                toolboxPanel.collapse();
            } else {
                if (!toolboxPanel.state.active) {
                    oneActive = true;
                }
                toolboxPanel.toggleActive();
            }
        });
        this.objs.toolboxPanelTogglerList.forEach((toolboxPanelToggler, i) => {
            if (i !== index) {
                toolboxPanelToggler.unselect();
            } else {
                toolboxPanelToggler.toggleSelected();
            }
        });
        this.setCollapsed(!oneActive);
    }
    setCollapsed(collapsed: boolean) {
        this.setState({ collapsed: collapsed });
        this.props.onCollapsedChanged(collapsed);
    }
    componentDidMount() {
        if (this.props.startExpanded) {
            this.toggleActiveToolboxPanel(0);
        }
    }
    render() {
        let toolboxPanelListCount = this.objs.toolboxPanelList.length;
        for (let i = 0; i < toolboxPanelListCount; i++) {
            this.objs.toolboxPanelList.pop();
        }
        let toolboxPanelTogglerListCount = this.objs.toolboxPanelTogglerList.length;
        for (let i = 0; i < toolboxPanelTogglerListCount; i++) {
            this.objs.toolboxPanelTogglerList.pop();
        }
        let panelList = (this.props.children instanceof Array ? this.props.children as Array<any> : [this.props.children] as Array<any>)
            .map((toolboxPanel: ToolboxPanel, i: number) =>
                <ToolboxPanel key={i} name={toolboxPanel.props.name} ref={(x: ToolboxPanel) => { if (x) { this.objs.toolboxPanelList.push(x) } }}>
                    {toolboxPanel.props.children}
                </ToolboxPanel>);
        let togglerList = (this.props.children instanceof Array ? this.props.children as Array<any> : [this.props.children] as Array<any>)
            .map((toolboxPanel: ToolboxPanel, i: number) =>
                <ToolboxPanelToggler key={i} name={toolboxPanel.props.name} togglerSize={toolboxPanel.props.togglerSize} ref={(x: ToolboxPanelToggler) => { if (x) { this.objs.toolboxPanelTogglerList.push(x) } }}
                    onClick={() => this.toggleActiveToolboxPanel(i)}></ToolboxPanelToggler>);
        return (
            this.props.dock === Docks.Bottom ?
                <div className={`tool-box tool-box-bottom ${this.state.collapsed ? "collapsed" : ""}`}>
                    <div className="togglers">
                        {togglerList}
                        {this.props.onExpanded
                            ? <div className="expander" onClick={this.props.onExpanded}>⇵</div>
                            : null
                        }
                    </div>
                    <div className="panels">
                        {panelList}
                    </div>
                </div> :
                <div className={`tool-box ${this.state.collapsed ? "collapsed" : ""}
                ${this.props.dock === Docks.Left ? "tool-box-left" : ""}`}>
                    <div className="panels">
                        {panelList}
                    </div>
                    <div className="togglers">
                        {togglerList}
                        {this.props.onExpanded
                            ? <div className="expander" onClick={this.props.onExpanded}>⇵</div>
                            : null
                        }
                    </div>
                </div>
        );
    }
}

interface ToolboxPanelProps {
    name: string;
    togglerSize?: number;
}
interface ToolboxPanelState {
    active: boolean;
}
export class ToolboxPanel extends React.Component<ToolboxPanelProps, ToolboxPanelState> {
    constructor() {
        super();
        this.state = {
            active: false
        };
    }
    collapse() {
        this.setState({
            active: false
        });
    }
    toggleActive() {
        this.setState({
            active: !this.state.active
        });
    }
    render() {
        return (
            <div className={`tool-box-panel ${this.state.active ? "" : "hidden"}`}>
                {this.props.children}
            </div>);
    }
}

interface ToolboxPanelTogglerProps {
    name: string;
    togglerSize?: number;
    onClick: () => void;
}
interface ToolboxPanelTogglerState {
    selected: boolean;
}
class ToolboxPanelToggler extends React.Component<ToolboxPanelTogglerProps, ToolboxPanelTogglerState> {
    constructor() {
        super();
        this.state = {
            selected: false
        };
    }
    unselect() {
        this.setState({
            selected: false
        });
    }
    toggleSelected() {
        this.setState({
            selected: !this.state.selected
        });
    }
    render() {
        return (
            <div className={this.state.selected ? "toggler active" : "toggler"}
                style={this.props.togglerSize ? { width: this.props.togglerSize, height: this.props.togglerSize } : {}}
                onClick={this.props.onClick}>
                <span className="name"><span className="chevron"></span> {this.props.name}</span>
            </div>);
    }
}