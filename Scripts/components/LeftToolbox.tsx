// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { Toolbox, ToolboxPanel, Docks } from "../components/Toolbox";
import { Panel } from "../components/Panel";
import { ResourceExplorerAncestry } from "../components/ResourceExplorerAncestry";
import { ResourceExplorerEmbellishments } from "../components/ResourceExplorerEmbellishments";
import { ResourceExplorerMyPhotos } from "../components/ResourceExplorerMyPhotos";
import { ThumbnailSizes } from "../components/ResourceExplorer";
import { EditorPropsBase } from "../MyCanvasEditor";

interface LeftToolboxRefs {
    imagesResourceExplorerList?: Panel[];
}
interface LeftToolboxProps extends EditorPropsBase {
    onCollapsedChanged: (collapsed: boolean) => void;
}
interface LeftToolboxState {
    thumbnailsSize?: ThumbnailSizes;
}
export class LeftToolbox extends React.Component<LeftToolboxProps, LeftToolboxState> {
    objs: LeftToolboxRefs = {
        imagesResourceExplorerList: new Array<Panel>()
    };
    constructor() {
        super();
        this.state = {
            thumbnailsSize: ThumbnailSizes.Small
        }
    }
    toggleActiveImageResourceExplorer(activePanel: Panel) {
        this.objs.imagesResourceExplorerList.forEach((imagesResourceExplorer) => {
            if (imagesResourceExplorer !== activePanel) {
                imagesResourceExplorer.collapse();
            }
        });
        this.setState({
            thumbnailsSize: this.state.thumbnailsSize
        });
    }
    handleThumbnailSizeChanged(uiEvent: UIEvent) {
        this.setState({ thumbnailsSize: parseInt((uiEvent.target as HTMLInputElement).value) });
    }
    render() {
        let imagesResourceExplorerListCount = this.objs.imagesResourceExplorerList.length;
        for (let i = 0; i < imagesResourceExplorerListCount; i++) {
            this.objs.imagesResourceExplorerList.pop();
        }
        return (
            <Toolbox applicationScope={this.props.applicationScope}
                dock={Docks.Left}
                onCollapsedChanged={this.props.onCollapsedChanged}>
                <ToolboxPanel name="Images">

                    <ResourceExplorerEmbellishments
                        id="reEmbellishments"
                        ref={(x: ResourceExplorerEmbellishments) => { if (x) { this.objs.imagesResourceExplorerList.push(x.objs.panel) } }}
                        applicationScope={this.props.applicationScope}
                        onExpanded={this.toggleActiveImageResourceExplorer.bind(this)}
                        thumbnailsSize={this.state.thumbnailsSize} />

                    <ResourceExplorerMyPhotos
                        id="reMyPhotos"
                        ref={(x: ResourceExplorerMyPhotos) => { if (x) { this.objs.imagesResourceExplorerList.push(x.objs.panel) } }}
                        applicationScope={this.props.applicationScope}
                        onExpanded={this.toggleActiveImageResourceExplorer.bind(this)}
                        thumbnailsSize={this.state.thumbnailsSize} />

                    {this.props.applicationScope.projectParameters.PartnerId > 0
                        ?
                        <ResourceExplorerAncestry
                            id="reAncestry"
                            ref={(x: ResourceExplorerAncestry) => { if (x) { this.objs.imagesResourceExplorerList.push(x.objs.panel) } }}
                            applicationScope={this.props.applicationScope}
                            onExpanded={this.toggleActiveImageResourceExplorer.bind(this)}
                            thumbnailsSize={this.state.thumbnailsSize} />
                        : null}
                    <div className="bottom-bar">
                        Choose thumbnail size:
                        <input type="radio" value={ThumbnailSizes.Small.toString()} checked={this.state.thumbnailsSize === ThumbnailSizes.Small} onChange={this.handleThumbnailSizeChanged.bind(this)} />sm
                        <input type="radio" value={ThumbnailSizes.Large.toString()} checked={this.state.thumbnailsSize === ThumbnailSizes.Large} onChange={this.handleThumbnailSizeChanged.bind(this)} />lg
                    </div>
                </ToolboxPanel>
            </Toolbox>);
    }
}
