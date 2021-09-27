// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { ButtonTitle } from "./Button";
import { ClassicButton } from "./ClassicButton";
import { DataState } from "./States";


interface ISaveProjectProps extends EditorPropsBase {
	onClick: () => void;
}
interface ISaveProjectState {
	isDirty: boolean;
	functionBeforeUnload: EventListenerOrEventListenerObject;
}
declare let window: MyWindow;

export class SaveProject extends React.Component<ISaveProjectProps, ISaveProjectState> {
	constructor() {
		super();
		this.state = {
			isDirty: false,
			functionBeforeUnload: (e: BeforeUnloadEvent) => {
				const message = "Do you want to leave this site?";
				e.returnValue = message;
				return message;
			}};
        Subscribers.AddSubscriber("SaveProject", EvenType.DocumentDirtyStateChanged, this, this.updateDirtyState.bind(this));
	    Subscribers.AddSubscriber("SaveProject", EvenType.EditorDocumentLoaded, this, this.updateDirtyState.bind(this));
        Subscribers.AddSubscriber("SaveProject", EvenType.AdditionalDirtyStateChanged, this, this.updateDirtyState.bind(this));
    }
    private datastate = new DataState();

	updateDirtyState() {
	    let data = this.datastate.getData();
        let dirty = data.isDocumentDirty || data.isAdditionalDirty;
		this.setState({ isDirty: dirty });

		window.removeEventListener("beforeunload", this.state.functionBeforeUnload);
		if (dirty)
			window.addEventListener("beforeunload", this.state.functionBeforeUnload);
	}

	onClick() {
		this.props.onClick();
	}

	render() {
		return (
            <ClassicButton text={ButtonTitle.SaveProject} enabled={this.state.isDirty} onClick={this.onClick.bind(this)} />
		);
	}
}
