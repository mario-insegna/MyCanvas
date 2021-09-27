// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { CollapseItem } from "../components/CollapseItem";
import { CollapseItemleftMenu } from "../components/CollapseItemleftMenu";
import { ModalEx } from "../ModalEx";

export interface PanelProps {
    id: string;
    title: string;
    onExpanded?: (panel: Panel) => void;
    disabled?: boolean;
    hidden?: boolean;
    bridge?: boolean;
}
interface PanelState {
    height?: number;
    width?: number;
}
export interface PanelRefs {
    collapseItem?: CollapseItem;
    collapseItemLeftMenu?: CollapseItemleftMenu;
    panel?: HTMLDivElement;
}
export class Panel extends React.Component<PanelProps, PanelState> {
    objs: PanelRefs = { collapseItem: null };
    constructor() {
        super();
        this.state = {
            height: null
        };
    }
    handleCollapsed() {
        this.setHeight(null);
    }
    handleExpanded() {
        if (this.props.onExpanded) {
            this.props.onExpanded(this);
        }
    }
    collapse() {
        this.setHeight(null);
        if (this.objs.collapseItem) this.objs.collapseItem.collapse(true);
    }
    setHeight(height: number, width?: number) {
        this.setState({
            height: height,
            width: width
        });
    }
    setHeightFromModal() {
        let margin = 6;
        ModalEx.getContentDiv((div: any, component: any) => {
            this.getPanelReady((panel: HTMLDivElement) => {
                if (!panel) return;
                this.getLayoutsReady(panel, (layoutPanels: NodeListOf<HTMLDivElement>) => {
                    for (let j = 0; j < layoutPanels.length; j++) {
                        let layout = layoutPanels[j] as HTMLDivElement;
                        let treePanel = layout.querySelector("div:first-child") as HTMLDivElement;
                        let target = treePanel || layout;
                        target.style.height = `${component.state.clientHeight - (layout.offsetTop - panel.offsetTop) - margin}px`;
                    }
                });
            });

        });
    }
    getPanelReady(callback: (panel: any) => void) {
        setTimeout((): any => {
            let panel = Array.prototype.slice.call(document.querySelectorAll("[id^='pnl']")).filter((item: any) => item.offsetParent !== null)[0];
            callback(panel);
        }, 0);
    }
    getLayoutsReady(panel: any, callback: (layoutPanels: any) => void) {
        setTimeout((): any => {
            callback(panel.querySelectorAll(".layout-in-modal"));
        }, 0);
    }
    render() {
        return (
            <div ref={(x: HTMLDivElement) => this.objs.panel = x} id={this.props.id} className={`panel ${this.props.hidden ? "hidden" : ""}`} style={this.state.height || this.state.width ? { height: this.state.height, width: this.state.width } : null}>
                {this.props.bridge
                    ?
                    <div className="collapse-item">
                        <div className={"body in"}><div className="panel-body">{this.props.children}</div></div>
                    </div>
                    :
                    <CollapseItem ref={(x: CollapseItem) => this.objs.collapseItem = x}
                        onExpanded={this.handleExpanded.bind(this)} onCollapsed={this.handleCollapsed.bind(this)} hideToggler={this.props.disabled}
                        header={
                            <div className="panel-header">{this.props.title}</div>
                        }
                        body={
                            <div className="panel-body">{this.props.children}</div>
                        } />
                }
            </div>);
    }
}
