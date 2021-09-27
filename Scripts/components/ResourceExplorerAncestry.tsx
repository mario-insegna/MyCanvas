// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { DropDown } from "./DropDown";
import { ThumbnailSizes, ResourceExplorerViewer } from "../components/ResourceExplorer";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import * as Autosuggest from "react-autosuggest";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";
import { PanelLeftMenu } from "../components/PanelLeftMenu";

interface ResourceExplorerAncestryRefs {
    panel?: PanelLeftMenu;
    viewer?: ResourceExplorerViewer;
}
interface ResourceExplorerAncestryProps extends EditorPropsBase {
    id: string;
    thumbnailsSize: ThumbnailSizes;
    onExpanded?: (panel: PanelLeftMenu) => void;
}
interface ResourceExplorerAncestryState {
    treeItemList?: Array<string>;
    treeSelectedItemId?: number;
    searchByPerson?: boolean;
    personSelectedText?: string;
    personSuggestions?: Array<PersonInfo>;
    isCoverRestricted?: boolean;
}
export class ResourceExplorerAncestry extends React.Component<ResourceExplorerAncestryProps, ResourceExplorerAncestryState> {
    objs: ResourceExplorerAncestryRefs = { panel: null };
    autosuggestWaitingValue: string;
    autosuggestWaitingHandler: number;
    constructor() {
        super();
        this.state = {
            treeItemList: null,
            treeSelectedItemId: null,
            searchByPerson: true,
            personSelectedText: "",
            personSuggestions: [],
            isCoverRestricted: false
        };
        Subscribers.AddSubscriber("ResourceExplorerAncestry", EvenType.CoverPagesLoaded, this, this.handleCoverPage.bind(this));
    }
    handleCoverPage() {
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        let isCoverRestricted = CacheManager.GetValueFromCache<boolean>("isCoverRestricted", CacheType.CoversVariables);
        this.setState({ isCoverRestricted: isCoverPage && isCoverRestricted });
        if (isCoverPage && isCoverRestricted) this.bindAssets(null);
    }
    componentDidMount() {
        this.loadTree();
    }
    loadTree() {
        Fetcher.getJson("/EditorApi/Ancestry/GetTrees")
            .then(function (treeInfoList: TreeInfo[]) {
                let treeDropDownItems: Array<string> = new Array<string>();
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
    findPerson({ value }: any) {
        Fetcher.getJson("/EditorApi/Ancestry/FindPerson", [
                ["treeId", this.state.treeSelectedItemId],
                ["searchString", value]
            ])
            .then(function (personInfoList: PersonInfo[]) {
                this.setState({ personSuggestions: personInfoList });
            }.bind(this));
    }
    findAssets(personId?: string) {
        if (personId) {
            Fetcher.getJson("/EditorApi/Ancestry/GetAllAssetsByPerson", [
                    ["treeId", this.state.treeSelectedItemId],
                    ["personId", personId],
                    ["themeId", this.props.applicationScope.projectParameters.ThemeId]
                ])
                .then(function (arrayList: Array<AssetInfo>) {
                    this.bindAssets(arrayList);
                }.bind(this));
        } else {
            Fetcher.getJson("/EditorApi/Ancestry/GetAllAssetsByTree", [
                    ["treeId", this.state.treeSelectedItemId],
                    ["themeId", this.props.applicationScope.projectParameters.ThemeId]
                ])
                .then(function (arrayList: Array<AssetInfo>) {
                    this.bindAssets(arrayList);
                }.bind(this));
        }
    }
    bindAssets(arrayList: Array<AssetInfo>) {
        // if cover is restricted, filter the images
        if (arrayList && this.state.isCoverRestricted) {
            arrayList = arrayList.filter((asset: AssetInfo) => !asset.ImageInfo);
        }
        this.objs.viewer.setFiles(arrayList);
    }
    handleTreeSelected(value: number) {
        this.setState({ treeSelectedItemId: value });

        this.bindAssets(null);

        if (this.state.searchByPerson) {
            this.setState({
                personSelectedText: ""
            });
        } else {
            this.findAssets();
        }
    }
    toogleSearchByPerson(searchByPerson: boolean) {
        this.bindAssets(null);

        this.setState({
            searchByPerson: searchByPerson,
            personSelectedText: ""
        });

        if (!searchByPerson) {
            this.findAssets();
        }
    }
    shouldRenderSuggestions(value: string) {
        // waits 500 ms before start searching so that the user can continue typing.
        if (this.autosuggestWaitingValue !== value) {
            if (this.autosuggestWaitingHandler) {
                clearInterval(this.autosuggestWaitingHandler);
            }

            this.autosuggestWaitingHandler = setTimeout(() => {
                this.autosuggestWaitingValue = value;
                let input = document.getElementsByClassName("react-autosuggest__input")[0];

                // force autosuggest component to fire search request.
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("focus", false, true);
                input.dispatchEvent(evt);
            }, 500);
        }

        if (this.autosuggestWaitingValue === value) {
            return this.state.searchByPerson && this.state.treeSelectedItemId && value.trim().length > 2;
        }
        return false;
    }
    render() {
        return (
            <PanelLeftMenu id={"pnl" + this.props.id} title="Ancestry Records" ref={(x: PanelLeftMenu) => this.objs.panel = x} onExpanded={this.props.onExpanded}>
                View images and records for:
                <div>
                    Tree
                    <DropDown options={this.state.treeItemList} onChange={this.handleTreeSelected.bind(this)} value={this.state.treeSelectedItemId}
                        width={167}/>
                </div>
                <div>
                    <label>
                        <input type="radio" checked={this.state.searchByPerson} onChange={() => this.toogleSearchByPerson(true)} />
                        Person
                    </label>
                    <Autosuggest
                        suggestions={this.state.personSuggestions}
                        onSuggestionsFetchRequested={this.findPerson.bind(this)}
                        onSuggestionsClearRequested={() => this.setState({ personSuggestions: [] })}
                        getSuggestionValue={(suggestion: PersonInfo) => {
                            this.findAssets(suggestion.Id);
                            return `${suggestion.FirstName} ${suggestion.LastName}`;
                        }}
                        renderSuggestion={(suggestion: PersonInfo) => (
                            <div>
                                <div className="caption">{suggestion.FirstName} {suggestion.LastName}</div>
                                <div className="info">
                                    Birth date: {suggestion.BirthDate ? suggestion.BirthDate : "(No birth date)"}<br />
                                    Brith place: {suggestion.BirthPlace ? suggestion.BirthPlace : "(No birth place)"}
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
                            },
                            readOnly: !this.state.searchByPerson
                        }}
                        shouldRenderSuggestions={this.shouldRenderSuggestions.bind(this)}
                    />
                </div>
                <div>
                    <label>
                        <input type="radio" checked={!this.state.searchByPerson} onChange={() => this.toogleSearchByPerson(false)} />
                        Not attached to a person
                    </label>
                </div>
                <ResourceExplorerViewer ref={(x: ResourceExplorerViewer) => this.objs.viewer = x} applicationScope={this.props.applicationScope}
                    isBackground={false} thumbnailsSize={this.props.thumbnailsSize} />
            </PanelLeftMenu>);
    }
}
