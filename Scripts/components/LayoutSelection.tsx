import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { Layouts } from "../components/Layouts";
import { Fetcher } from "../Fetcher";
import { Subscribers, EvenType } from "../Subscribers";
import { FamilyHistoryPerson } from "./FamilyHistoryPerson";
import { ClassicButton } from "./ClassicButton";

interface LayoutSelectionRefs {
    modal?: Modal;
    resourceExplorerLayouts?: Layouts;
}

interface IProps extends EditorPropsBase {
    pageAddedCompleted: (data?: Page[]) => void;
}
interface IStates {
    selectedPage?: number;
    disableAddButton?: boolean;
}
export class LayoutSelection extends React.Component<IProps, IStates> {
    objs: LayoutSelectionRefs = {};
    private familyHistoryPerson: FamilyHistoryPerson;
    constructor() {
        super();
        Subscribers.AddSubscriber("LayoutSelection", EvenType.ResourceExplorerSelected, this, this.enableAddPagesButton.bind(this));
        this.state = {
            disableAddButton: false,
            selectedPage: -1
        }
    }

    enableAddPagesButton(): void {
        const files = this.objs.resourceExplorerLayouts.objs.resourceExplorer.objs.viewer.getFiles();
        if (files) this.setState({ disableAddButton: files.filter(x => x.props.source.ImageInfo.Selected).length !== 0 });
    }

    addPages(): void {
        const filesSelected = this.objs.resourceExplorerLayouts.objs.resourceExplorer.objs.viewer.getFiles().filter(x => x.props.source.ImageInfo.Selected);

        if (this.objs.resourceExplorerLayouts.objs.resourceExplorer.objs.viewer.state.multipleSelection) {

            const layoutIdArray = new Array<number>();
            filesSelected.forEach(file => {
                layoutIdArray.push(file.props.source.ImageInfo.CustomData.layoutId as number);
            });
            Fetcher.postJson("/EditorApi/Page/AddPages",
                    {
                        ProjectId: this.props.applicationScope.projectParameters.ProjectId,
                        ProductId: this.props.applicationScope.projectParameters.ProductId,
                        PageNumber: this.state.selectedPage,
                        LayoutIds: layoutIdArray
                    })
                .then(function (data: Page[]) {
                    this.pageAddedCompleted(data);
                }.bind(this));

        } else {

            // this is a family history page so we need more info
            const file = filesSelected[0];
            let layoutId = +file.props.source.ImageInfo.CustomData["layoutId"];
            let themeId = +file.props.source.ImageInfo.CustomData["themeId"];
            let layoutTypeId = +file.props.source.ImageInfo.CustomData["layoutTypeId"];
            let layoutSubTypeId = +file.props.source.ImageInfo.CustomData["layoutSubTypeId"];
            // validate layoutTypeId
            if (this.objs.resourceExplorerLayouts.objs.resourceExplorer.objs.viewer.isFamilyHistoryByLayoutType(layoutTypeId)) {
                this.familyHistoryPerson.input(
                    layoutId,
                    themeId,
                    layoutTypeId,
                    layoutSubTypeId,
                    file.props.source.ImageInfo.Name,
                    file.props.applicationScope.projectsUrls.PwsUrl + "/" + file.props.source.ImageInfo.ThumbUrl
                );
                this.familyHistoryPerson.objs.modal.show();
            }

        }
    }

    pageAddedCompleted(data?: Page[]) {
        this.objs.modal.close();
        this.props.pageAddedCompleted(data);
    }

    addBlankPage(): void {
        this.objs.modal.close();
        this.props.pageAddedCompleted();
    }

    render() {
        return (
            <Modal dimension={Dimension.Large} contentSelector={"panel"} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title="Layout Selection" applicationScope={this.props.applicationScope}>
                <Layouts
                    id="idLayoutSelection"
                    ref={(x: Layouts) => { if (x) { this.objs.resourceExplorerLayouts = x } }}
                    applicationScope={this.props.applicationScope}
                    horizontalLayout={true} />
                <div className={"layout-selection-buttons"}>
                    <ClassicButton text={"Add a blank page"} enabled={true} onClick={this.addBlankPage.bind(this)} /> &ensp; 
                    <ClassicButton text={"Add Pages"} enabled={this.state.disableAddButton} onClick={this.addPages.bind(this)} />
                </div>
                <br />
                <FamilyHistoryPerson ref={(x: FamilyHistoryPerson) => { this.familyHistoryPerson = x }} applicationScope={this.props.applicationScope}
                    selectedPage={this.state.selectedPage}
                    pageAddedCompleted={this.pageAddedCompleted.bind(this)} />
            </Modal>
        );
    }
}
