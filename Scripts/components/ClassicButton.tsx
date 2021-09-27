import * as React from "react";



interface IClassicButtonProps
{
    text: any;
    onClick: (button: ClassicButton) => void;
    enabled: boolean;
    hidden?: boolean;
}



export class ClassicButton extends React.Component<IClassicButtonProps, {}>{
    render() {
        return this.props.hidden ? null : <button className={"classic-button " + (this.props.enabled ? "" : "disabled")} type={"button"} onClick={() => this.props.onClick(this)}>{this.props.text} </button>
    }
}