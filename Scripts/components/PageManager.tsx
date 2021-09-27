// PageManager.tsx

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { ButtonTitle } from "./Button";
import { BottomToolbox } from "../components/BottomToolbox";
import { LayoutSelection } from "./LayoutSelection";
import { DropDown } from "./DropDown";

interface IProps extends EditorPropsBase {
    bottomToolbox: BottomToolbox;
}
interface IStates {
    optionsPages?: string[];
}
interface IPageManagerObjs {
    layoutSelection?: LayoutSelection;
}
export class PageManager extends React.Component<IProps, IStates> {
    objs: IPageManagerObjs = {};

    private optionAddNewEmptyPage = "0";
    private optionAddPages = "1";

    constructor() {
        super();
        this.state = { optionsPages: [] };
    }

    componentDidMount(): void {
        // building options
        let options: string[] = [`${this.optionAddNewEmptyPage}|${ButtonTitle.AddNewEmptyPage.toString()}`];
        options.push(`${this.optionAddPages}|${ButtonTitle.AddFromLayout.toString()}`);
        
        this.setState({ optionsPages: options });
    }

    handleAddBlankPageRequested(): void {
        if (this.props.bottomToolbox.objs.pages)
            if (!this.props.bottomToolbox.objs.pages.PageLimitReached()) {
                this.props.bottomToolbox.objs.pages.addBlankPage();
            }
            else {
                return;
            }
    }

    handleAddPageRequested(): void {
        if (this.props.bottomToolbox.objs.pages)
            if (!this.props.bottomToolbox.objs.pages.PageLimitReached()) {
                this.objs.layoutSelection.setState({ selectedPage: this.props.bottomToolbox.objs.pages.selectedPageNumber() });
                this.objs.layoutSelection.objs.modal.show();
                this.objs.layoutSelection.objs.resourceExplorerLayouts.objs.panel.setHeightFromModal();
            }
            else {
                return;
            }
    }

    handleAddPageCompleted(data?: Page[]): void {
        if (data) {
            this.props.bottomToolbox.objs.pages.setState({ pages: data });
            this.props.bottomToolbox.objs.pages.setNewSelectedPage(this.objs.layoutSelection.state.selectedPage + 1);
        } else {
            this.handleAddBlankPageRequested();
        }
    }

    handleMenuPages(item: string) {
        if (item === this.optionAddNewEmptyPage) this.handleAddBlankPageRequested();
        if (item === this.optionAddPages) this.handleAddPageRequested();
    }

    render() {
        let icon = <div>
                       <div className="divAddBox">
                           <span className="icon-addpage iconmedium"></span><br/>
                       </div>
                       <div className="labelAddBox">
                           Add Page
                       </div>
                   </div>;
        return (
            this.props.bottomToolbox && this.props.bottomToolbox.objs.pages
            ? <div className="button-group">
                  <DropDown noborder={true} selectHeight={40} optionHeight={"auto"} icon={icon.props.children} onlyTitle={true} options={this.state.optionsPages} onChange={this.handleMenuPages.bind(this)} />
                  <LayoutSelection ref={(x: LayoutSelection) => { this.objs.layoutSelection = x }} applicationScope={this.props.applicationScope} pageAddedCompleted={this.handleAddPageCompleted.bind(this)} />
              </div>
            : null
        );
    }
}
