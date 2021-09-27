// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { DropDown } from "./DropDown";
import { Fetcher } from "../Fetcher";
import * as Autosuggest from "react-autosuggest";
import { Button, ButtonTitle, ButtonIcon } from "./Button";
import { FamilyHistoryDescendancy } from "./FamilyHistoryDescendancy";
import { LayoutTypes, LayoutSubTypes } from "../Common";
import { ClassicButton } from "./ClassicButton";

interface IFamilyHistoryPersonProps extends EditorPropsBase {
    pageAddedCompleted: (data?: Page[]) => void;
    selectedPage?: number;
}

interface IFamilyHistoryPersonStates {
    // input parameters
    layoutId?: number;
    themeId?: number;
    layoutTypeId?: LayoutTypes;
    layoutSubTypeId?: LayoutSubTypes;
    layoutName?: string;
    layoutThumbnailUrl?: string;
    // initial fields
    title?: string;
    treeItemList?: string[];
    treeSelectedItemId?: number;
    // Autosuggest
    personSuggestions?: PersonInfo[];
    personSelectedText?: string;
    personId?: number;
    isFetchingPerson?: boolean;
    // Generations
    generationsVisible?: boolean;
    generationsItemList?: string[];
    generationsSelectedItemId?: string;
    // Spouses
    spouseItemList?: string[];
    spouseSelectedItemId?: number;
    spouseVisible?: boolean;
    // Events
    eventInfoList?: EventInfo[];
    isFetchingEvents?: boolean;
    // Records
    recordInfoList?: RecordInfo[];
    isFetchingSpouses?: boolean;
    // Add button
    addPagesButtonVisible?: boolean;
}

interface IFamilyHistoryPersonObjs {
    modal?: Modal;
    eventListCheckBox?: HTMLInputElement[];
    eventInfoCheckedList?: EventInfo[];
    recordListCheckBox?: HTMLInputElement[];
    recordInfoCheckedList?: RecordInfo[];
    familyHistoryDescendancy?: FamilyHistoryDescendancy;
    // Additional pages
    addTimelinePagesCheckBox?: HTMLInputElement;
    addGroupSheetPagesCheckBox?: HTMLInputElement;
    addRecordPagesCheckBox?: HTMLInputElement;
    addPhotoPagesCheckBox?: HTMLInputElement;
    addFamilySectionPagesCheckBox?: HTMLInputElement;
}
export class FamilyHistoryPerson extends React.Component<IFamilyHistoryPersonProps, IFamilyHistoryPersonStates> {
    objs: IFamilyHistoryPersonObjs = {
        eventListCheckBox: new Array<HTMLInputElement>(), eventInfoCheckedList: new Array<EventInfo>(),
        recordListCheckBox: new Array<HTMLInputElement>(), recordInfoCheckedList: new Array<RecordInfo>()
    };
    constructor() {
        super();
        this.state = {
            title: "",
            treeItemList: [],
            treeSelectedItemId: null,
            personSuggestions: [],
            personSelectedText: "",
            spouseItemList: [],
            spouseSelectedItemId: null,
            spouseVisible: false,
            generationsVisible: false,
            addPagesButtonVisible: false,
            generationsItemList: ["2|3 Generations", "3|4 Generations"],
            generationsSelectedItemId: "2",
            eventInfoList: [],
            recordInfoList: [],
            isFetchingEvents: false,
            isFetchingSpouses: false,
            isFetchingPerson: false
        };
    }

    private treeTitle = "Add a new Family Tree page";
    private groupSheetTitle = "Add a new Family Group Sheet page";
    private timelineTitle = "Add a new Timeline page";
    private recordTitle = "Add new Record pages";

    componentDidMount() {
        Fetcher.getJson("/EditorApi/Ancestry/GetTrees")
            .then(function (treeInfoList: TreeInfo[]) {
                let treeDropDownItems = new Array<string>();
                let defaultTree: string;
                treeInfoList.forEach((treeInfo: TreeInfo) => {
                    if (!defaultTree) {
                        defaultTree = treeInfo.Id;
                    }
                    treeDropDownItems.push(treeInfo.Id + "|" + treeInfo.Name);
                });
                this.setState({
                    treeItemList: treeDropDownItems,
                    treeSelectedItemId: defaultTree
                });
            }.bind(this));
    }

    /**
     * Input from LayoutSelection
     * @param layoutId
     * @param themeId
     * @param layoutTypeId
     * @param layoutSubTypeId
     * @param layoutName
     * @param layoutThumbnailUrl
     */
    input(layoutId: number, themeId: number, layoutTypeId: LayoutTypes, layoutSubTypeId: LayoutSubTypes, layoutName: string, layoutThumbnailUrl: string) {
        this.setState({
            layoutId: layoutId,
            themeId: themeId,
            layoutTypeId: layoutTypeId,
            layoutSubTypeId: layoutSubTypeId,
            layoutName: layoutName,
            layoutThumbnailUrl: layoutThumbnailUrl
        });
        this.init(layoutTypeId, layoutSubTypeId);
    }

    private init(layoutTypeId: LayoutTypes, layoutSubTypeId: LayoutSubTypes) {
        let titleState: string = "";
        let spouseVisibleState: boolean = false;

        switch (layoutTypeId) {
            case LayoutTypes.Tree:
                titleState = this.treeTitle;
                if (layoutSubTypeId === LayoutSubTypes.ListDescendant || layoutSubTypeId === LayoutSubTypes.TreeDescendant) {
                    spouseVisibleState = false;
                } else {
                    spouseVisibleState = true;
                }
                break;
            case LayoutTypes.GroupSheet:
                titleState = this.groupSheetTitle;
                spouseVisibleState = true;
                break;
            case LayoutTypes.Timeline:
                titleState = this.timelineTitle;
                spouseVisibleState = true;
                break;
            case LayoutTypes.Record:
                titleState = this.recordTitle;
                spouseVisibleState = false;
                break;
        }

        this.setState({
            title: titleState,
            spouseVisible: spouseVisibleState,
            generationsVisible: layoutTypeId === LayoutTypes.Tree && layoutSubTypeId === LayoutSubTypes.TreeDescendant
        });
    }

    findPerson({ value }: any) {
        if (this.state.personSelectedText === value) return;

        this.setState({ isFetchingPerson: true });
        Fetcher.getJson("/EditorApi/Ancestry/FindPerson", [
                ["treeId", this.state.treeSelectedItemId],
                ["searchString", value]
            ])
            .then(function (personInfoList: PersonInfo[]) {
                this.setState({
                    personSuggestions: personInfoList,
                    isFetchingPerson: false
                });
            }.bind(this));
    }

    findAssets(personId: any) {
        this.clearStates(false);

        this.setState({ personId: personId });

        // Find events and records
        if (this.state.layoutTypeId === LayoutTypes.Timeline || this.state.layoutTypeId === LayoutTypes.Record) {
            this.setState({ isFetchingEvents: true});
            Fetcher.getJson("/EditorApi/Ancestry/GetAllAssetsByPerson",
                    [
                        ["treeId", this.state.treeSelectedItemId],
                        ["personId", personId],
                        ["themeId", this.props.applicationScope.projectParameters.ThemeId]
                    ])
                .then(function (arrayList: Array<AssetInfo>) {

                    if (this.state.layoutTypeId === LayoutTypes.Timeline) {
                        let eventInfoList = arrayList.filter((asset: AssetInfo) => asset.EventInfo).map((asset: AssetInfo) => { return asset.EventInfo });
                        this.setState({ eventInfoList: eventInfoList });
                    }
                    if (this.state.layoutTypeId === LayoutTypes.Record) {
                        let recordInfoList = arrayList.filter((asset: AssetInfo) => asset.RecordInfo && asset.RecordInfo.Url).map((asset: AssetInfo) => { return asset.RecordInfo });
                        this.setState({ recordInfoList: recordInfoList });
                    }
                    this.setState({ isFetchingEvents: false });
                    this.updateAddButton();

                }.bind(this))
                .catch((error: any) => {
                    alert(error);
                });
        }

        // Find spouses
        if (this.state.spouseVisible) {
            this.setState({ isFetchingSpouses: true });
            Fetcher.getJson("/EditorApi/Ancestry/GetSpouses", [
                    ["treeId", this.state.treeSelectedItemId],
                    ["personId", personId]
                ])
            .then(function (personList: Array<PersonInfo>) {
                let items = new Array<string>();
                let defaultItem: string;
                personList.forEach((person: PersonInfo) => {
                    if (!defaultItem) {
                        defaultItem = person.Id;
                    }
                    items.push(`${person.Id}|${person.FirstName} ${person.LastName} (${this.buildDates(person.BirthDate, person.DeathDate)})`);
                });

                if (personList.length === 0) {
                    items.push(`0|[No spouses]`);
                    defaultItem = `0`;
                }

                this.setState({
                    spouseItemList: items,
                    spouseSelectedItemId: defaultItem
                });

                this.setState({ isFetchingSpouses: false });
                this.updateAddButton();

            }.bind(this))
            .catch((error: any) => {
                alert(error);
            });
        }
        this.updateAddButton();
    }

    clearStates(all: boolean) {
        if (all) {
            this.setState({
                personSuggestions: [],
                personSelectedText: ""
            });
        }
        this.setState({
            generationsVisible: false,
            spouseItemList: [],
            spouseSelectedItemId: null,
            spouseVisible: false,
            eventInfoList: [],
            recordInfoList: [],
            addPagesButtonVisible: false
        });
        this.init(this.state.layoutTypeId, this.state.layoutSubTypeId);
    }

    handleTreeSelected(value: number) {
        this.clearStates(true);
        this.setState({ treeSelectedItemId: value });
    }

    handleSpouseSelected(value: number) {
        this.setState({ spouseSelectedItemId: value });
    }

    handleGenerationsSelected(value: string) {
        this.setState({ generationsSelectedItemId: value });
    }

    buildDates(birthDate: string, deathDate: string) {
        let dates = `${birthDate} - ${deathDate}`;
        return dates === " - " ? "" : dates;
    }

    eventSelection(asset: EventInfo, index: number) {
        const input: HTMLInputElement = this.objs.eventListCheckBox[index];
        const indexAsset = this.objs.eventInfoCheckedList.findIndex((e: EventInfo) => e.Id === asset.Id);
        if (input.checked) {
            if (indexAsset === -1) this.objs.eventInfoCheckedList.push(asset);
        } else {
            if (indexAsset !== -1) this.objs.eventInfoCheckedList.splice(indexAsset, 1);
        }
        this.updateAddButton();
    }

    recordSelection(asset: RecordInfo, index: number) {
        const input: HTMLInputElement = this.objs.recordListCheckBox[index];
        const indexAsset = this.objs.recordInfoCheckedList.findIndex((e: RecordInfo) => e.Id === asset.Id);
        if (input.checked) {
            if (indexAsset === -1) this.objs.recordInfoCheckedList.push(asset);
        } else {
            if (indexAsset !== -1) this.objs.recordInfoCheckedList.splice(indexAsset, 1);
        }
        this.updateAddButton();
    }

    updateAddButton() {
        let enabled: boolean = true;
        if (this.state.layoutTypeId === LayoutTypes.Timeline) {
            enabled = this.objs.eventInfoCheckedList.length > 0;
        }
        if (this.state.layoutTypeId === LayoutTypes.Record) {
            enabled = this.objs.recordInfoCheckedList.length > 0;
        }
        if (this.state.layoutTypeId === LayoutTypes.Tree || this.state.layoutTypeId === LayoutTypes.GroupSheet) {
            enabled = (this.state.spouseVisible && this.state.spouseItemList.length > 0) || this.state.layoutSubTypeId !== LayoutSubTypes.None;
        }
        this.setState({ addPagesButtonVisible: enabled });
    }

    handleClosed() {
        this.clearStates(true);
    }

    handleAddClick() {
        if (this.state.layoutTypeId === LayoutTypes.Tree && this.state.layoutSubTypeId === LayoutSubTypes.TreeDescendant) { 

            this.objs.familyHistoryDescendancy.objs.modal.show();

        } else {
            this.addPage();
        }
    }

	addPage() {
		this.setState({ addPagesButtonVisible: false });

        Fetcher.postJson("/EditorApi/Page/NewPagesFromTree", this.parameters())
			.then(function (data: Page[]) {

				this.pageAddedCompleted(data);
				this.setState({ addPagesButtonVisible: true });

            }.bind(this))
			.catch((error: any) => {
		        this.setState({ addPagesButtonVisible: true });
                alert(error);
            });
    }

    pageAddedCompleted(data: Page[]) {
        if (this.objs && this.objs.modal) this.objs.modal.close();
        this.props.pageAddedCompleted(data);
    }

    parameters(): any {
        let params: any = {
            ProjectId: this.props.applicationScope.projectParameters.ProjectId,
			ProductId: this.props.applicationScope.projectParameters.ProductId,
            Url: this.props.applicationScope.projectsUrls.EditorUrl,
            LayoutId: this.state.layoutId,
            LayoutTypeId: this.state.layoutTypeId,
            ThemeId: this.state.themeId,
            PersonId: this.state.personId,
            TreeId: this.state.treeSelectedItemId,
            PageNumber: this.props.selectedPage,
			LayoutIds: [this.state.layoutId]
        };

        if (this.state.layoutTypeId === LayoutTypes.Tree) {
            let toSkip: LayoutTypes[] = [];
            if (!this.objs.addTimelinePagesCheckBox.checked) {
                toSkip.push(LayoutTypes.Timeline);
            }
            if (!this.objs.addGroupSheetPagesCheckBox.checked) {
                toSkip.push(LayoutTypes.GroupSheet);
            }
            if (!this.objs.addRecordPagesCheckBox.checked) {
                toSkip.push(LayoutTypes.Record);
            }
            if (this.state.layoutSubTypeId === LayoutSubTypes.TreeDescendant) {
                if (!this.objs.addPhotoPagesCheckBox.checked) {
                    toSkip.push(LayoutTypes.PhotoAndText);
                }
                if (!this.objs.addFamilySectionPagesCheckBox.checked) {
                    toSkip.push(LayoutTypes.FamilySection);
                }
            }
            // always skip title and TOC pages for descendant tree books
            if (this.state.layoutSubTypeId === LayoutSubTypes.TreeDescendant) {
                toSkip.push(LayoutTypes.Title);
                toSkip.push(LayoutTypes.TOC);
            }
            // add skip param
            if (toSkip.length > 0) {
                params = { ...params, LayoutTypesToSkip: toSkip }
            }
        }

        if (this.state.spouseVisible) {
            params = { ...params, SpouseId: this.state.spouseSelectedItemId }
        }
        if (this.state.generationsVisible) {
            params = { ...params, NumGenerations: this.state.generationsSelectedItemId }
        }
        if (this.objs.eventInfoCheckedList.length > 0) {
            params = { ...params, EventIds: this.objs.eventInfoCheckedList.map((v) => v.Id) }
        }
        if (this.objs.recordInfoCheckedList.length > 0) {
            params = { ...params, RecordIds: this.objs.recordInfoCheckedList.map((v) => v.Id) }
        }
        
        return params;
    }

    render() {
        return (
            <Modal dimension={Dimension.Large} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title={this.state.title} applicationScope={this.props.applicationScope} handleClosed={this.handleClosed.bind(this)}>
                <div className="family-history-person-container">

                    {/* right side */}
                    <div className="right">
                        <label className="label">Preview</label>
                        <hr />
                        <img className="image" src={this.state.layoutThumbnailUrl} alt="" />
                        <br />
                        <label className="minilabel">{this.state.layoutName}</label>
                    </div>

                    {/* left side */}
                    <div className="left">
                        <label className="label">Choose a person for this page</label>
                        <hr />

                        <div className="separator"></div>

                        <div>
                            <label className="sublabel">Select a tree</label> <br />
                            <DropDown options={this.state.treeItemList} onChange={this.handleTreeSelected.bind(this)} value={this.state.treeSelectedItemId} width={400} />
                        </div>

                        <div className="separator"></div>

                        <div>
                            <label className="sublabel">Select a person</label>
                            <br />
                            <label className="minilabel">
                                Start by typing the name of the person you would like to appear as the "primary" person of this page.
                                As you type, we will search your tree for possible matches. Select the name when it appears in the list below to create your page.
                            </label>
                            <br />
                            <Autosuggest
                                suggestions={this.state.personSuggestions}
                                onSuggestionsFetchRequested={this.findPerson.bind(this)}
                                onSuggestionsClearRequested={() => { }}
                                focusInputOnSuggestionClick={false}
                                getSuggestionValue={(suggestion: PersonInfo) => {
                                    this.findAssets(suggestion.Id);
                                    return `${suggestion.FirstName} ${suggestion.LastName} (${this.buildDates(suggestion.BirthDate, suggestion.DeathDate)})`;
                                }}
                                renderSuggestion={(suggestion: PersonInfo) => (
                                    <div>
                                        <div className="caption">{suggestion.FirstName} {suggestion.LastName}</div>
                                        <div className="info">
                                            Birth date: {suggestion.BirthDate ? suggestion.BirthDate : "(No birth date)"}<br />
                                            Birth place: {suggestion.BirthPlace ? suggestion.BirthPlace : "(No birth place)"}
                                        </div>
                                    </div>
                                )}
                                inputProps={{
                                    placeholder: 'Type name here',
                                    value: this.state.personSelectedText,
                                    onChange: (event: any, { newValue }: any) => {
                                        this.setState({
                                            personSelectedText: newValue
                                        });
                                    }
                                }}
                                shouldRenderSuggestions={(value: string) => {return value.trim().length > 2;}}
                            />
                        </div>

                        {this.state.isFetchingEvents || this.state.isFetchingSpouses || this.state.isFetchingPerson
                            ? <div>Loading...</div>
                            : null
                        }

                        {this.state.spouseVisible && this.state.spouseItemList.length > 0
                            ? <div>
                                <div className="separator"></div>
                                <label className="sublabel">Select a spouse</label>
                                <br />
                                <DropDown options={this.state.spouseItemList} onChange={this.handleSpouseSelected.bind(this)} value={this.state.spouseSelectedItemId} width={400} />
                            </div>
                            : null
                        }

                        {this.state.generationsVisible
                            ? <div>
                                <div className="separator"></div>
                                <label className="sublabel">Select number of generations</label>
                                <br />
                                <DropDown options={this.state.generationsItemList} onChange={this.handleGenerationsSelected.bind(this)} value={this.state.generationsSelectedItemId} width={400} />
                            </div>
                            : null
                        }

                        {this.state.eventInfoList.length > 0
                            ? <div>
                                <div className="separator"></div>
                                <label className="sublabel">Select events to include on your timeline</label>
                                <br />
                                <div className="frame">
                                    {this.state.eventInfoList.map((asset: EventInfo, index: number) => {
                                        return (
                                            <div key={index}>
                                                <div className="left">
                                                    <input ref={(x: HTMLInputElement) => { if (x) this.objs.eventListCheckBox.push(x) }} type="checkbox" onChange={() => this.eventSelection(asset, index)} />
                                                </div>
                                                <div className="left">
                                                    <div className="caption">{asset.Name}</div>
                                                    <label className="minilabel">
                                                        {asset.Place ? asset.Place + ", " : ""} {asset.Date ? asset.Date : ""}
                                                    </label>
                                                </div>
                                                <div className="clear"></div>
                                            </div>);
                                    })}
                                </div>
                            </div>
                            : null
                        }

                        {this.state.recordInfoList.length > 0
                            ? <div>
                                <div className="separator"></div>
                                <label className="sublabel">Select records to create pages from</label>
                                <br />
                                <div className="frame">
                                    {this.state.recordInfoList.map((asset: RecordInfo, index: number) => {
                                        return (
                                            <div key={index}>
                                                <div className="left">
                                                    <input ref={(x: HTMLInputElement) => { if (x) this.objs.recordListCheckBox.push(x) }} type="checkbox" onChange={() => this.recordSelection(asset, index)} />
                                                </div>
                                                <div className="left">
                                                    <div className="caption">{asset.Name}</div>
                                                </div>
                                                <div className="clear"></div>
                                            </div>);
                                    })}
                                </div>
                            </div>
                            : null
                        }

                        {/* additional pages */}
                        {this.state.layoutTypeId === LayoutTypes.Tree
                            ? <div>
                                  <div className="separator"></div>

                                  <label className="label">Add additional pages (optional)</label>
                                  <hr />

                                  <label className="minilabel">
                                      We can automatically add the following page types for people in this new Family Tree page. 
                                      These will be added to your book after your new Family Tree page.
                                  </label>
                                  <br />

                                  <div className="frame">
                                      <div>
                                          <div className="left"> <input ref={(x: HTMLInputElement) => { if (x) this.objs.addTimelinePagesCheckBox = x }}  type="checkbox" onChange={() => { }} /> </div>
                                          <div className="left"> <div className="caption">Timeline Pages</div> </div>
                                          <div className="clear"></div>
                                      </div>

                                      <div>
                                          <div className="left"> <input ref={(x: HTMLInputElement) => { if (x) this.objs.addGroupSheetPagesCheckBox = x }} type="checkbox" onChange={() => { }} /> </div>
                                          <div className="left"> <div className="caption">Family Group Sheets</div> </div>
                                          <div className="clear"></div>
                                      </div>

                                      <div>
                                          <div className="left"> <input ref={(x: HTMLInputElement) => { if (x) this.objs.addRecordPagesCheckBox = x }} type="checkbox" onChange={() => { }} /> </div>
                                          <div className="left"> <div className="caption">Record Pages</div> </div>
                                          <div className="clear"></div>
                                      </div>

                                      {this.state.layoutSubTypeId === LayoutSubTypes.TreeDescendant
                                        ? <div>
                                            <div className="left"> <input ref={(x: HTMLInputElement) => { if (x) this.objs.addPhotoPagesCheckBox = x }} type="checkbox" onChange={() => { }} /> </div>
                                            <div className="left"> <div className="caption">Photo Layout Pages</div> </div>
                                            <div className="clear"></div>
                                        </div>
                                        : null
                                      }

                                      {this.state.layoutSubTypeId === LayoutSubTypes.TreeDescendant
                                        ? <div>
                                            <div className="left"> <input ref={(x: HTMLInputElement) => { if (x) this.objs.addFamilySectionPagesCheckBox = x }} type="checkbox" onChange={() => { }} /> </div>
                                            <div className="left"> <div className="caption">Family Section Pages</div> </div>
                                            <div className="clear"></div>
                                        </div>
                                        : null
                                      }
                                  </div>
                            </div>
                            : null
                        }

                        <div className="separator"></div>

                        <div>
                            <ClassicButton text={ButtonIcon.AddPages} enabled={this.state.addPagesButtonVisible} onClick={this.handleAddClick.bind(this)} />
                        </div>
                    </div>

                    <div className="clear"></div>
                </div>

                <FamilyHistoryDescendancy ref={(x: FamilyHistoryDescendancy)=> this.objs.familyHistoryDescendancy = x} applicationScope={this.props.applicationScope} />

            </Modal>
        );
    }
}
