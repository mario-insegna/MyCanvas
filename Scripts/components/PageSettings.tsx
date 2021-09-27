// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { Layouts } from "../components/Layouts";
import { Backgrounds } from "../components/Backgrounds";
import { ModalTabs, TabItem } from "../components/ModalTabs";
import { MyCanvasColorPicker } from "./ColorPicker";
import { Pages } from "./Pages";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";
import { ClassicButton } from "./ClassicButton";

interface PageSettingsRefs {
    modal?: Modal;
    layout?: Layouts;
    background?: Backgrounds;
    pages?: Pages;
    modalTabs?: ModalTabs;
}

interface IPageSettingsProps extends EditorPropsBase {
}
interface IPageSettingsStates {
    isCoverRestricted?: boolean;
    isCoverPage?: boolean;
}
export class PageSettings extends React.Component<IPageSettingsProps, IPageSettingsStates> {
    objs: PageSettingsRefs = {};
    constructor() {
        super();
        this.state = { isCoverRestricted: false, isCoverPage: false };
    }

    componentDidMount(): void {
        Subscribers.AddSubscriber("PageSettings", EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
        this.handleCoverPage();
    }

    componentWillUnmount(): void {
        Subscribers.RemoveSubscriber("PageSettings", EvenType.CoverPagesLoaded);
    }

    setPages(pages: Pages) {
        this.objs.pages = pages;
    }

    init() {
        var title = this.objs.modalTabs ? this.objs.modalTabs.getFirstTitle() : "";
        this.handleOnchange(title);
    }

    handleOnchange(title: string) {
        if (title === "Layouts") {
            if (this.objs.layout) this.objs.layout.objs.panel.setHeightFromModal();
        }
        if (title === "Backgrounds") {
            if (this.objs.background) this.objs.background.objs.panel.setHeightFromModal();
        }
    }

    handleCoverPage() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        this.setState({ isCoverRestricted: isCoverPage && isCoverRestricted, isCoverPage: isCoverPage });
        if (this.objs.modalTabs) this.objs.modalTabs.refresh();
    }

    handleDeletePageRequested(): void {
        if (this.objs.pages) this.objs.pages.deletePage();
    }

    handleColorPickerGetter() {
        return this.props.applicationScope.myCanvasEditor.getBackgroundFrameFillColor();
    }

    handleColorPickerSetter(r: number, g: number, b: number) {
        this.props.applicationScope.myCanvasEditor.setBackgroundFrameFillColor(r, g, b);
    }

    render() {
        return (
            <Modal dimension={Dimension.Large} contentSelector={"panel"} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title={this.props.applicationScope.conditions.photoPoster ? "Backgrounds" : "Manage Pages"} applicationScope={this.props.applicationScope}>
                <div>
                    <ModalTabs ref={(x: ModalTabs) => this.objs.modalTabs = x} onChange={this.handleOnchange.bind(this)}>
                      
                            <TabItem title={"Layouts"} disabled={this.state.isCoverPage || this.props.applicationScope.conditions.photoPoster}>
                                <Layouts
                                    id="idPageSettings"
                                    ref={(x: Layouts) => this.objs.layout = x}
                                    applicationScope={this.props.applicationScope}
                                    horizontalLayout={true}
                                    horizontalLayoutSingle={true} /> <br />
                            </TabItem> 

                        <TabItem title={"Backgrounds"} disabled={this.state.isCoverRestricted}>
                            <Backgrounds
                                id="idBackgrounds"
                                ref={(x: Backgrounds) => this.objs.background = x}
                                applicationScope={this.props.applicationScope}
                                horizontalLayout={true}
                                horizontalLayoutSingle={true} />
                            or choose a background color
                            <MyCanvasColorPicker textSelection={true} getter={this.handleColorPickerGetter.bind(this)} setter={this.handleColorPickerSetter.bind(this)} />
                        </TabItem>
                      
                            <TabItem title={"Delete"} disabled={this.state.isCoverPage || this.props.applicationScope.conditions.photoPoster}>
                                <DeletePage
                                    applicationScope={this.props.applicationScope}
                                    handleDeletePage={this.handleDeletePageRequested.bind(this)} /> <br />
                            </TabItem>

                    </ModalTabs>
                </div>
            </Modal>
        );
    }
}

interface IDeletePageProps extends EditorPropsBase {
    handleDeletePage: () => void;
}
interface IDeletePageStates {
}
export class DeletePage extends React.Component<IDeletePageProps, IDeletePageStates> {
    render() {
        return (
            <div className="panel">
                <label>This page will be permanently deleted. Are you sure?</label>
                <br />
                <ClassicButton text={"Delete current page"} enabled={true} onClick={this.props.handleDeletePage.bind(this)} />
            </div>
        );
    }
}
