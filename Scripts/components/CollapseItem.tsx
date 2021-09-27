// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";

export interface CollapseItemProps {
    header: any;
    body: any;
    hideToggler?: boolean;
    onCollapsed?: () => void;
    onExpanded?: () => void;
    type?: string;
}
interface CollapseItemState {
    collapsed: boolean;
}
export class CollapseItem extends React.Component<CollapseItemProps, CollapseItemState> {
    constructor() {
        super();
        this.state = {
            collapsed: true
        };
    }

    handleTogglerClick() {
        this.collapse(!this.state.collapsed);
    }
    collapse(collapsed: boolean) {
        this.setState({
            collapsed: collapsed
        });
        if (!collapsed && this.props.onExpanded) {
            this.props.onExpanded();
        }
        else if (collapsed && this.props.onCollapsed) {
            this.props.onCollapsed();
        }
    }
    render() {
        return (
            <div className="collapse-item">
                <div className="header">
                    {this.props.header}
                    {!this.props.hideToggler
                        ?
                        <div className="toggler" onClick={this.handleTogglerClick.bind(this)}>
                            {this.state.collapsed ? <span className="icon-plus"></span> : <span className="icon-minus"></span>}
                            </div>
                        : null}
                </div>
                <div className={this.state.collapsed ? "body" : "body in"}>{this.props.body}</div>
            </div>);
    }
}
