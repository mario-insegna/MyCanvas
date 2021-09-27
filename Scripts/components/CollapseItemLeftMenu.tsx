import { CollapseItem } from "../components/CollapseItem";
import * as React from "react";



export class CollapseItemleftMenu extends CollapseItem {

    render() {
        return (
            <div className="collapse-item">
                <div className="header">
                    {this.props.type === "Embellishments" ?
                        <div className="button-group-left-menu" onClick={this.handleTogglerClick.bind(this)}>
                            <span className="icon-embelishment"></span>
                            <div>Embellishments</div>
                        </div> :
                        this.props.type === "MyPhotos" ?
                            <div className="button-group-left-menu" onClick={this.handleTogglerClick.bind(this)}>
                                <span  className="icon-photo"></span>
                                <div>Photos</div>
                            </div> :
                            <div className="button-group-left-menu" onClick={this.handleTogglerClick.bind(this)}>
                                <span className="icon-ancestry"></span>
                                <div>Ancestry</div>
                            </div>}
                </div>
                <div className={this.state.collapsed ? "body" : "body in"}>{this.props.body}</div>
            </div>);
    }

}