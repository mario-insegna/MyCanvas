import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { Fetcher } from "../Fetcher";

interface IReactMessageRefs {
    modal?: Modal;
}
export class ResyncMessage extends React.Component<EditorPropsBase, {}> {
    objs: IReactMessageRefs = {};

    handleClick() {
        const trueThis = this;
        Fetcher.postJson
        ("/EditorApi/Page/ResyncAllElements",
                this.props.applicationScope.myCanvasEditor.getAllFramesMetadata())
            .then(function (data: FrameElement[]) {
                data.forEach(function(frame) {
                    if (frame.ImageElement) {
                        trueThis.props.applicationScope.myCanvasEditor.setSelectedFrameImageWithId(
                            frame.FrameId,
                            frame.ImageElement.ImageId,
                            frame.ImageElement.Name,
                            trueThis.props.applicationScope.projectsUrls.PwsUrl + "/" + frame.ImageElement.Url,
                            trueThis.props.applicationScope.projectsUrls.PwsUrl + "/" + frame.ImageElement.ThumbUrl,
                            trueThis.props.applicationScope.projectsUrls.PwsUrl + "/" + frame.ImageElement.Url,
                            frame.ImageElement.Width,
                            frame.ImageElement.Height,
                            '300 kb');
                    }
                    if (frame.TextElement) {
						trueThis.props.applicationScope.myCanvasEditor.setSelectedFrameText(frame.TextElement, false, frame.FrameId);
                    }
                });
                trueThis.objs.modal.close();
            }.bind(this));
    }
    render() {
        return (
            <Modal dimension={Dimension.Medium} useUndoRedo={true} ref={(x: Modal) => { this.objs.modal = x }} title="Page Update" applicationScope={this.props.applicationScope}>
                <div>
                    <p>
                        This feature allows you to make updates to your page or poster to match your online Ancestry tree.
                    </p>
                    <p>
                        Here are a few things to be aware of:
                        You may lose some of your edits such as font type, size, color and placement.
                        You can undo the update if you don't like the results. Simply click the undo arrow button on the top toolbar.
                        Objects added to your page that don't come from your online tree will not be affected.
                        Some pages like descendant lists cannot be updated. If you want to update pages with an inactive update icon, you will need to do it manually by adding a new page from the 'Pages' drop-down and then deleting the old page(s).
                        You can also update individual elements by selecting the element(s) and clicking on the 'Update' icon on the element menu bar.
                        This feature will only work for pages created after Feb 21, 2008.
                    </p>
                    <p>
                        To learn more about the Update feature go to the help section.
                    </p>
                    <input type="button" value="Continue with Update" onClick={this.handleClick.bind(this)} />
                </div>
            </Modal>);
    }
}
