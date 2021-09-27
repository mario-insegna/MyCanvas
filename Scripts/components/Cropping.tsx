// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Button, ButtonTitle, ButtonIcon } from "./Button";

interface IBox {
    imgX: number;
    imgY: number;
    imgWidth: number;
    imgHeight: number;
    frameWidth: number;
    frameHeight: number;
    frameId: string;
}
interface IProps extends EditorPropsBase {
    imageFrameDrag?: HTMLDivElement;
    hidden?: boolean;
    handleCrop: () => void;
}
interface IStates {
    box?: IBox;
    zoomValue?: number;
    minZoom?: number;
    maxZoom?: number;
}
export class Cropping extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { box: { imgX: 0, imgY: 0, imgWidth: 0, imgHeight: 0, frameWidth: 0, frameHeight: 0, frameId: "" }, zoomValue: 0, minZoom: -90, maxZoom: 400 };
    }

    private contextMenu: HTMLElement;
    private pixelsToInches = 0.010416667;
    private inchesToPixels = 96;
    private fineStep = 0.02;
    private mouseX = 0;
    private mouseY = 0;
    private delayMax = 18;
    private delay = 0;
    private nbsp = "\u00A0\u00A0";
    private dragging = false;

    componentDidMount(): void {
        let box = this.props.applicationScope.myCanvasEditor.getImageBox();
        this.setState({ box: box, zoomValue: this.percentageFrom(box.frameWidth, box.imgWidth) });
        this.contextMenu = document.getElementById("frameContextMenu");

        this.props.imageFrameDrag.onmousedown = this.onMouseDown.bind(this);
        this.props.imageFrameDrag.onmousemove = this.onMouseMove.bind(this);
        this.props.imageFrameDrag.onmouseup = this.onMouseUp.bind(this);
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any) {
        let box = this.props.applicationScope.myCanvasEditor.getImageBox();
        if (box.frameId !== nextState.box.frameId) {
            this.setState({ box: box, zoomValue: this.percentageFrom(box.frameWidth, box.imgWidth) });
        }
    }

    componentWillUnmount(): void {
        this.props.imageFrameDrag.className = "cropping-drag-hidden";
    }

    handleZoomChanged(uiEvent: UIEvent) {
        let value = parseInt((uiEvent.target as HTMLInputElement).value);
        this.setZoomValue(value);
    }

    setZoomValue(value: number) {
        let perWidth = this.percentageOf(this.state.box.imgWidth, value);
        let perHeight = this.percentageOf(this.state.box.imgHeight, value);

        let imgWidth = this.state.box.imgWidth + perWidth;
        let imgHeight = this.state.box.imgHeight + perHeight;

        this.setState({ zoomValue: value });
        this.props.applicationScope.myCanvasEditor.setImageBox({ imgWidth: imgWidth, imgHeight: imgHeight });
    }

    setHorizontalValue(value: number) {
        let box = this.state.box;
        box.imgX = value;
        this.setState({ box: box });
        this.props.applicationScope.myCanvasEditor.setImageBox({ imgX: value });
    }

    setVerticalValue(value: number) {
        let box = this.state.box;
        box.imgY = value;
        this.setState({ box: box });
        this.props.applicationScope.myCanvasEditor.setImageBox({ imgY: value });
    }

    percentageOf(number: number, factor: number) {
        return (number * factor / 100);
    }

    percentageFrom(number1: number, number2: number) {
        return (number2 / number1 - 1) * 100;
    }

    decrementZoom() {
        let pos = this.state.zoomValue - 2;
        let value = pos < this.state.minZoom ? this.state.minZoom : pos;
        this.setZoomValue(value);
    }

    incrementZoom() {
        let pos = this.state.zoomValue + 2;
        let value = pos > this.state.maxZoom ? this.state.maxZoom : pos;
        this.setZoomValue(value);
    }

    decrementH() {
        let imgX = this.state.box.imgX - this.fineStep;
        if (!this.validPosition(imgX, this.state.box.imgY)) return;
        this.setHorizontalValue(imgX);
    }

    incrementH() {
        let imgX = this.state.box.imgX + this.fineStep;
        if (!this.validPosition(imgX, this.state.box.imgY)) return;
        this.setHorizontalValue(imgX);
    }

    decrementV() {
        let imgY = this.state.box.imgY - this.fineStep;
        if (!this.validPosition(this.state.box.imgX, imgY)) return;
        this.setVerticalValue(imgY);
    }

    incrementV() {
        let imgY = this.state.box.imgY + this.fineStep;
        if (!this.validPosition(this.state.box.imgX, imgY)) return;
        this.setVerticalValue(imgY);
    }

    validPosition(x: number, y: number): boolean {
        // boundaries
        let minX = 0;
        let minY = 0;
        let maxX = this.state.box.frameWidth;
        let maxY = this.state.box.frameHeight;
        // check for valid position
        let validRegion = true;
        if (x + this.state.box.imgWidth < minX) validRegion = false;
        if (x > maxX) validRegion = false;
        if (y + this.state.box.imgHeight < minY) validRegion = false;
        if (y > maxY) validRegion = false;
        return validRegion;
    }

    onMouseDown(ev: MouseEvent) {
        this.contextMenu.style.display = "none";
        (this.props.imageFrameDrag.children[0] as HTMLElement).style.display = "none";
        this.props.imageFrameDrag.style.cursor = "move";
        this.dragging = true;

        this.mouseX = ev.clientX - (this.state.box.imgX * this.inchesToPixels);
        this.mouseY = ev.clientY - (this.state.box.imgY * this.inchesToPixels);
    }

    onMouseMove(ev: MouseEvent) {
        if (!this.dragging) return;
        this.delay++;
        if (this.delay > this.delayMax) {
            this.delay = 0;
            // current mouse position
            let currentX = (ev.clientX - this.mouseX) * this.pixelsToInches;
            let currentY = (ev.clientY - this.mouseY) * this.pixelsToInches;

            let box = this.state.box;
            box.imgX = currentX;
            box.imgY = currentY;
            this.setState({ box: box });

            this.props.applicationScope.myCanvasEditor.setImageBox({ imgX: currentX, imgY: currentY });
        }
    }

    onMouseUp(ev: MouseEvent) {
        this.contextMenu.style.display = "";
        (this.props.imageFrameDrag.children[0] as HTMLElement).style.display = "";
        this.props.imageFrameDrag.style.cursor = "default";
        this.dragging = false;
    }

    fitIn() {
        let editorBox = this.props.applicationScope.myCanvasEditor.getImageBox();
        let box = this.state.box;
        box.imgWidth = editorBox.frameWidth;
        box.imgHeight = editorBox.frameHeight;
        box.imgX = 0;
        box.imgY = 0;
        this.props.applicationScope.myCanvasEditor.setImageBox({ imgWidth: box.imgWidth, imgHeight: box.imgHeight, imgX: box.imgX, imgY: box.imgY });
        this.setState({ box: box, zoomValue: 0 });
    }

    render() {
        this.props.imageFrameDrag.className = this.props.hidden ? "cropping-drag-hidden" : "cropping-drag";
        return (
            <span className="sub-context-menu">
                <div className="button-group">
                    <Button icon={ButtonIcon.Crop} title={ButtonTitle.Crop} active={!this.props.hidden} enabled={true} onClick={this.props.handleCrop.bind(this)} noborder={true} />
                </div>
                <div className={this.props.hidden ? "button-group-hidden" : null}>
                    <div className="button-group">
                        <label>Zoom</label>
                        <div className="button-sub-group">
                            <Button icon={ButtonIcon.Zout} title={ButtonTitle.Zout} enabled={true} onClick={this.decrementZoom.bind(this)} noborder={true} />
                            <input type="range" min={this.state.minZoom} max={this.state.maxZoom} step="5" onChange={this.handleZoomChanged.bind(this)} value={this.state.zoomValue.toString()} />
                            <Button icon={ButtonIcon.Zin} title={ButtonTitle.Zin} enabled={true} onClick={this.incrementZoom.bind(this)} noborder={true} />
                        </div>
                    </div>
                    <div className="button-group">
                        <label>{this.nbsp}Horizontal</label>
                        <div className={"buttons-flex"}>
                            <Button icon={ButtonIcon.ArrowL} title={ButtonTitle.ArrowL} enabled={true} onClick={this.decrementH.bind(this)} noborder={true} />
                            <Button icon={ButtonIcon.ArrowR} title={ButtonTitle.ArrowR} enabled={true} onClick={this.incrementH.bind(this)} noborder={true} />
                        </div>
                    </div>
                    <div className="button-group">                     
                        <label>{this.nbsp}Vertical</label>
                        <div className={"buttons-flex"}>
                            <Button icon={ButtonIcon.ArrowU} title={ButtonTitle.ArrowU} enabled={true} onClick={this.decrementV.bind(this)} noborder={true} />
                            <Button icon={ButtonIcon.ArrowD} title={ButtonTitle.ArrowD} enabled={true} onClick={this.incrementV.bind(this)} noborder={true} />                       
                        </div>
                    </div>
                    <div className="button-group">
                        <label>{this.nbsp}</label>
                        <Button icon={ButtonIcon.FitIn} title={ButtonTitle.FitIn} enabled={true} onClick={this.fitIn.bind(this)} noborder={true} />
                    </div>
                </div >
            </span >
        );
    }
}