// Subscribers.ts

import * as React from "react";

export interface ISubscriber {
    name: string;
    event: number;
    component: React.Component<any, any>;
    callback?: () => void;
}

export enum EvenType {
    ApplyFont,
    PositioningBar,
    MyCanvasEditorLoaded,
    BackgroundFrameCreated,
    EditorDocumentLoaded,
    UndoStackChanged,
    RenderChanged,
    FrameMoveInProgress,
    PagesLoaded,
    TextSelectionChanged,
    CoverPagesLoaded,
    HorizontalPaneFullyOpened,
    NewPageSelected,
	ResourceExplorerSelected,
    DocumentDirtyStateChanged,
    AdditionalDirtyStateChanged,
    ImageUploaded,
    MyPhotoChanged,
    DocumentSaved,
}

let reactSubscribers: ISubscriber[] = [];

class Subscriber {

    UpdateSubscribers(event: EvenType): void {
        reactSubscribers.filter((a) => a.event === event).forEach((subscriber: ISubscriber) => {
            if (subscriber.callback) {
                subscriber.callback();
            }
            subscriber.component.forceUpdate();
        });
    }

    AddSubscriber(name: string, event: EvenType, component: React.Component<any, any>, callback?: () => void) {
        let index = reactSubscribers.findIndex((s: ISubscriber) => s.name === name && s.event === event);
        if (index === -1) {
            reactSubscribers.push({ name, event, component, callback });
        } else {
            reactSubscribers[index] = { name, event, component, callback };
        }
    }

    RemoveSubscriber(name: string, event?: EvenType) {
        let subscribers = reactSubscribers.filter((s) => s.name === name && (s.event === event || !event));
        subscribers.map((subscriber) => {
            let index = reactSubscribers.findIndex((s) => s.name === subscriber.name && s.event === subscriber.event);
            if (index !== -1) {
                reactSubscribers.splice(index, 1);
            }
        });
    }

}

export const Subscribers = new Subscriber();
