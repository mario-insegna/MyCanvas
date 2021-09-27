// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";

interface IStatesProps extends EditorPropsBase {
}
interface IStatesStates {
    isDocumentDirty: boolean;
    isAdditionalDirty: boolean;
}
export class States extends React.Component<IStatesProps, IStatesStates> {
    constructor() {
        super();
        this.state = { isDocumentDirty: false, isAdditionalDirty: false };
    }
    private datastate = new DataState();

    componentDidMount(): void {
        Subscribers.AddSubscriber("States", EvenType.EditorDocumentLoaded, this, this.handleDocumentLoaded.bind(this));
        Subscribers.AddSubscriber("States", EvenType.UndoStackChanged, this, this.handleStateChanged.bind(this));
        Subscribers.AddSubscriber("States", EvenType.AdditionalDirtyStateChanged, this, this.handleAdditionalDirtyStateChanged.bind(this));
        Subscribers.AddSubscriber("States", EvenType.DocumentSaved, this, this.handleDocumentSaved.bind(this));
        let data = this.datastate.getData();
        this.setState({ isDocumentDirty: data.isDocumentDirty, isAdditionalDirty: data.isAdditionalDirty });
    }

    shouldComponentUpdate(nextProps: IStatesProps, nextState: IStatesStates, nextContext: any): boolean {
        let data = this.datastate.getData();
        let change = data.isAdditionalDirty !== nextState.isAdditionalDirty || data.isDocumentDirty !== nextState.isDocumentDirty;
        if (change) {
            this.setState({ isDocumentDirty: data.isDocumentDirty, isAdditionalDirty: data.isAdditionalDirty });
        }
        return change;
    }

    handleAdditionalDirtyStateChanged() {
        CacheManager.SetDataToCache("isAdditionalDirty", true, CacheType.DirtyStateProject);
    }

    reset() {
        CacheManager.SetDataToCache("isDocumentDirty", false, CacheType.DirtyStateProject);
        CacheManager.SetDataToCache("isAdditionalDirty", false, CacheType.DirtyStateProject);
    }

    handleDocumentSaved() {
        this.reset();
    }

    handleDocumentLoaded() {
        this.reset();
    }

    handleStateChanged() {
        let dirty = this.props.applicationScope.myCanvasEditor.getUndoRedoStack().length > 0;
        CacheManager.SetDataToCache("isDocumentDirty", dirty, CacheType.DirtyStateProject);
        if (dirty || this.state.isAdditionalDirty) {
            Subscribers.UpdateSubscribers(EvenType.DocumentDirtyStateChanged);
        }
    }

    render() {
        return <div/>;
    }
}

export interface IDataState {
    isDocumentDirty: boolean;
    isAdditionalDirty: boolean;
}

export class DataState
{
    getData(): IDataState {
        return {
            isDocumentDirty: CacheManager.GetValueFromCache<boolean>("isDocumentDirty", CacheType.DirtyStateProject),
            isAdditionalDirty: CacheManager.GetValueFromCache<boolean>("isAdditionalDirty", CacheType.DirtyStateProject),
        };
    }
}