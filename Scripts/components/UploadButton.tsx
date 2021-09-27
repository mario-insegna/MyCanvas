// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { Subscribers, EvenType } from "../Subscribers";
import { ClassicButton } from "./ClassicButton";

declare var window: MyWindow;

interface UploadButtonProps {
    albumId: string;
    isBackground?: boolean;
}
interface UploadButtonStates {
    timer: any;
}
export class UploadButton extends React.Component<UploadButtonProps, UploadButtonStates> {
    constructor() {
        super();
        this.state = { timer: null };
    }
    handleModalClosing() {
        let uploadWindow = document.getElementById("upload-image-modal");
        if (uploadWindow && uploadWindow.className === "modal") {
            clearInterval(this.state.timer);
            let uploadContainer = uploadWindow.getElementsByClassName("qq-upload-list")[0];
            if (uploadContainer && uploadContainer.hasChildNodes()) {
                Subscribers.UpdateSubscribers(EvenType.ImageUploaded);
            }
        }
    }
    handleButtonClick() {
        window.OpenUploadImageModal(this.props.albumId, this.props.isBackground);
        this.setState({ timer: setInterval(this.handleModalClosing.bind(this), 500) });
    }
    render() {
        return (
            <div className="upload-button">
                <ClassicButton text={"Upload images"} enabled={true} onClick={this.handleButtonClick.bind(this)} />
            </div>);
    }
}