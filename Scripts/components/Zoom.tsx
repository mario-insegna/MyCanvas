// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Button, ButtonTitle, ButtonIcon } from "./Button";

interface IProps extends EditorPropsBase { }
interface IStates { zoom: number; min?: number; max?: number; }

export class Zoom extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { zoom: 50, min: 20, max: 300 };
    }

    componentDidMount(): void {
        let zoom = this.props.applicationScope.myCanvasEditor.getDocumentZoom();
        this.setState({ zoom: zoom });
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any): void {
        let zoom = this.props.applicationScope.myCanvasEditor.getDocumentZoom();
        if (zoom !== nextState.zoom)
            this.setState({ zoom: zoom });
    }

    handleZoomChanged(uiEvent: UIEvent) {
        let zoom = parseInt((uiEvent.target as HTMLInputElement).value);
        this.setZoom(zoom);
    }

    zoomIn() {
        let zoom = +this.state.zoom + 10;
        this.setZoom(zoom > this.state.max ? this.state.max : zoom);
    }

    zoomOut() {
        let zoom = +this.state.zoom - 10;
        this.setZoom(zoom < this.state.min ? this.state.min : zoom);
    }

    setZoom(zoom: number) {
        this.setState({ zoom: zoom });
        this.props.applicationScope.myCanvasEditor.setDocumentZoom(zoom);
    }

    render(): JSX.Element {
        return <div className="button-group">
            <div className="button-sub-group">
                <div title="Zoom out" onClick={this.zoomOut.bind(this)}>
                    <span className="icon-zout iconsmall"></span>
                </div>

                <input type="range" min={this.state.min} max={this.state.max} onChange={this.handleZoomChanged.bind(this)} value={this.state.zoom.toString()} />
                <div title="Zoom in" onClick={this.zoomIn.bind(this)}>
                    <span className="icon-zin iconsmall"></span>
                </div>
            </div>
        </div>;
    }
}