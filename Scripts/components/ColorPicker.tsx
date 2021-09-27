// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import ColorPicker from "coloreact";
import { CacheManager, CacheType } from "../CacheManager";
import { ClassicButton } from "./ClassicButton";

interface IRgb {
    r: number;
    g: number;
    b: number;
}
interface IProps {
    getter: () => string;
    setter: (r: number, g: number, b: number) => void;
    textSelection?: boolean;
    className?: string;
}
interface IStates {
    current?: string;
    hidden?: boolean;
    pickerColor?: string;
    pickerHidden?: boolean;
}
export class MyCanvasColorPicker extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { current: "", hidden: true, pickerColor: "", pickerHidden: true };
    }

    containerDiv: HTMLDivElement;
    pickerDiv: HTMLDivElement;

    componentDidMount(): void {
        let color = this.props.getter();
        this.setState({ current: color, hidden: true, pickerColor: color });
        CacheManager.SetDataByType(this, CacheType.ColorPickers);
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any): void {
        let color = this.props.getter();
        if (color !== nextState.current) {
            this.setState({ current: color, hidden: true });
            if (!this.state.pickerColor) this.setState({ pickerColor: color });
        }
    }

    applyColor() {
        if (this.state.current === this.state.pickerColor) return;
        let rgb = this.hexToRgb(this.state.pickerColor);
        this.props.setter(rgb.r, rgb.g, rgb.b);
        this.setState({ hidden: true, current: this.state.pickerColor});
    }

    private hexToRgb(hex: string): IRgb {
        hex = hex.replace(/[^0-9A-F]/gi, "");
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return { r, g, b };
    }

    handlePicker(picker: any) {
        this.setState({ pickerColor: picker.hexString });
    }

    togglePicker() {
        this.setState({ hidden: !this.state.hidden });
        this.getPosition();
    }

    getPosition() {
        if (this.props.textSelection && this.containerDiv) {
            this.forceUpdate();
            setTimeout(function () {
                let margin = 10;
                let metrics = { left: 0, top: 0, width: 235, height: 206 };
                let iframe = document.getElementsByTagName("iframe")[0];

                // calculate position
                let spaceLeft = iframe.clientWidth - this.containerDiv.offsetLeft;
                if (spaceLeft < metrics.width) metrics.left = ((spaceLeft + margin) * -1);
                let spaceBottom = iframe.clientHeight - this.containerDiv.offsetTop;
                if (spaceBottom < metrics.height) metrics.top = ((235 + margin) * -1);

                // set position
                this.pickerDiv.style.width = "230px";
                this.pickerDiv.style.top = `${metrics.top}px`;
                this.pickerDiv.style.left = `${metrics.left}px`;
            }.bind(this), 0);
        }
    }

    hidePicker() {
        if (this.containerDiv) this.setState({ hidden: true });
    }

    render() {
        return (
            <div className={`color-picker ${this.props.className}`}>
                <div className="colorpicker-label" onClick={() => this.togglePicker()}>
                    <div style={{ backgroundColor: this.state.current }} className="colorpicker-label-2" data-icon={" ▾"}></div>
                </div>

                <div ref={(x: HTMLDivElement) => { this.containerDiv = x }} className={this.state.hidden ? "colorpicker-container-hidden" : "colorpicker-container"}>

                    <div ref={(x: HTMLDivElement) => { this.pickerDiv = x }} className="colorpicker-label-1">
                        <span style={{ backgroundColor: this.state.pickerColor }} className="colorpicker-label-header"></span>
                        <span className="colorpicker-label-input">{this.state.pickerColor}</span>
                        <span className="colorpicker-button-icon" onClick={() => this.setState({ pickerHidden: !this.state.pickerHidden })}>{" ◉"}</span>

                        
                        <ClassicButton text={"Ok"} enabled={true} onClick={() => this.applyColor()} />
                        
                        <ClassicButton text={"Cancel"} enabled={true} onClick={() => this.setState({ hidden: true })} />

                        {this.state.pickerHidden
                            ? this.colors.map((item: any, key: any) =>
                                <span key={key} className="colorpicker-wrapper">
                                    <span style={{ backgroundColor: item }} className="colorpicker-cell" onClick={() => this.setState({ pickerColor: item })}></span>
                                </span>)
                            : <ColorPicker opacity={false} color={this.state.pickerColor} onChange={this.handlePicker.bind(this)} onComplete={this.handlePicker.bind(this)} style={{ position: "relative", height: "160px", width: "225px" }} />}
                    </div>
                </div>
            </div>);
    }

    colors: Array<string> = [
        "#FFCCCC", "#FFCC99", "#FFFF99", "#EBFFAE", "#D0FFD0", "#D2F3F7", "#C1C8FF", "#DDC1FF", "#FFB3D9", "#F0E6D9",
        "#FF9999", "#FFAD33", "#FFFF57", "#DFFF80", "#86F451", "#A4E7EE", "#6A8FFF", "#BB84FF", "#FF71B8", "#D7B999",
        "#FF4444", "#FF7E28", "#FFFF00", "#C1FF06", "#4ACB0C", "#5AD2E0", "#4650FF", "#A459FF", "#FF46A3", "#8C6239",
        "#FF0000", "#FF6600", "#D2D200", "#99CC00", "#008000", "#1C8995", "#0000FF", "#6600FF", "#E40A4B", "#603913",
        "#990000", "#863500", "#939300", "#567300", "#2B5500", "#11565E", "#000A60", "#37007B", "#930631", "#4A2D0F",
        "#660000", "#441C00", "#606000", "#283500", "#003300", "#092D31", "#00042F", "#210048", "#440031", "#301D0A",
        "#000000", "#1C1C1C", "#383838", "#545454", "#707070", "#8C8C8C", "#A8A8A8", "#C4C4C4", "#E0E0E0", "#FFFFFF"];
}
