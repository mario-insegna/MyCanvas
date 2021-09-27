import { Panel } from "../components/Panel";
import { CollapseItemleftMenu } from "../components/CollapseItemLeftMenu";
import * as React from "react";



export class PanelLeftMenu extends Panel {

    render() {
        return (
            <div ref={(x: HTMLDivElement) => this.objs.panel = x} id={this.props.id} className={`panel ${this.props.hidden ? "hidden" : ""}`} style={this.state.height || this.state.width ? { height: this.state.height, width: this.state.width } : null}>
                {this.props.bridge
                    ?
                    <div className="collapse-item">
                        <div className={"body in"}><div className="panel-body">{this.props.children}</div></div>
                    </div>
                    :
                    this.props.title === "Embellishments" ?
                        <CollapseItemleftMenu ref={(x: CollapseItemleftMenu) => this.objs.collapseItemLeftMenu = x}
                            onExpanded={this.handleExpanded.bind(this)} onCollapsed={this.handleCollapsed.bind(this)} hideToggler={this.props.disabled} type={"Embellishments"}
                            header={
                                <div className="panel-header">{this.props.title}</div>
                            }
                            body={
                                <div className="panel-body">{this.props.children}</div>
                            } />
                        : this.props.title === "My Photos" ?
                            <CollapseItemleftMenu ref={(x: CollapseItemleftMenu) => this.objs.collapseItemLeftMenu = x}
                                onExpanded={this.handleExpanded.bind(this)} onCollapsed={this.handleCollapsed.bind(this)} hideToggler={this.props.disabled} type={"MyPhotos"}
                                header={
                                    <div className="panel-header">{this.props.title}</div>
                                }
                                body={
                                    <div className="panel-body">{this.props.children}</div>
                                } />
                            : <CollapseItemleftMenu ref={(x: CollapseItemleftMenu) => this.objs.collapseItemLeftMenu = x}
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