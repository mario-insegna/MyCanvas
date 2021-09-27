// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import * as LZString from "lz-string"
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { CacheManager, CacheType } from "../CacheManager";
import { Subscribers, EvenType } from "../Subscribers";
import { SortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";
import { ObjectAssign } from "../Polyfills";
import { Button, ButtonTitle, ButtonIcon } from "./Button";
import { DataState } from "./States";
import { ClassicButton } from "./ClassicButton";

interface IProps extends EditorPropsBase {
    onPageChanged: () => void;
}
interface IStates {
    pageId?: number;
    pages?: Page[];
    anyPageSelected?: boolean;
    isHorizontalPaneFullyOpened?: boolean;
    horizontalSplitSize?: number;
}
export class Pages extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { pages: [], pageId: 0 };
        Subscribers.AddSubscriber("Pages", EvenType.MyCanvasEditorLoaded, this, this.onEditorReady.bind(this));
        Subscribers.AddSubscriber("Pages", EvenType.EditorDocumentLoaded, this, this.autoTextCursor.bind(this));
        Subscribers.AddSubscriber("Pages", EvenType.HorizontalPaneFullyOpened, this, this.togglePanel.bind(this));
    }
    private datastate = new DataState();
    private itemTemplateRenderDivSelector = "div#ItemTemplate_Render_Div";
    private limitOfPages = 250;

    togglePanel() {
        if (this.props.applicationScope.conditions.notPreview) {
            let togglerHeight = 0;
            let desktopElements = CacheManager.GetValueFromCache<IDesktop>("desktopElements", CacheType.DesktopVariables);
            if (desktopElements) {
                let toggler = desktopElements.bottom.querySelector(".togglers");
                togglerHeight = toggler.clientHeight;
            }

            let isHorizontalPaneFullyOpened = CacheManager.GetValueFromCache<boolean>("isHorizontalPaneFullyOpened", CacheType.DesktopVariables);
            let horizontalSplitSize = CacheManager.GetValueFromCache<number>("horizontalSplitSize", CacheType.DesktopVariables);
            this.setState({ isHorizontalPaneFullyOpened: isHorizontalPaneFullyOpened, horizontalSplitSize: horizontalSplitSize - togglerHeight });
        }
    }
    componentDidMount(): void {
		if (this.props.applicationScope.conditions.previewOrEditingOrAdmin) {

            Fetcher.getJson("/EditorApi/Project/GetProjectPages", [["projectId", this.props.applicationScope.projectParameters.ProjectId]])
                .then(function (data: Page[]) {
                    this.setState({ pages: data });
                    this.loadFirstPage();
                }.bind(this));
        }
        this.togglePanel();
    }

    predicate = (item: any) => this.props.applicationScope.myCanvasEditor.getUndoManagerPredicate(item);

    savePage(id: number, forceUpdate: boolean, callback?: (message?: any, dirty?: boolean) => void) {
        // check for changes
        if (!forceUpdate) {
            let data = this.datastate.getData();
            let dirty = data.isDocumentDirty || data.isAdditionalDirty;
            if (!dirty) {
                if (callback) callback("", false);
                return;
            }
        }

		this.saveLastChanges(id);

		const item = CacheManager.GetDataFromCache(id, CacheType.MyCanvasEditorProject);

		Fetcher.postJson("/EditorApi/Project/SaveProject",
            {
                Data: [item],
                ProjectId: this.props.applicationScope.projectParameters.ProjectId,
		        PageId: id,
                Url: this.props.applicationScope.projectsUrls.EditorUrl
		    })
			.then(function (response: IHttpStatusCodeResult) {

                if (response.StatusCode === 200) {
					if (callback) {
						callback(response.StatusDescription, true);
					}
				}

				if (response.StatusCode >= 400) {
                    alert(`Error ${response.StatusCode}: ${response.StatusDescription}`);
				}

			}.bind(this))
			.catch((error: any) => {
				alert(`Network error or permission issues. (${error})`);
			});
	}

	saveProject() {
        this.savePage(this.state.pageId, true, (message) => {
            this.getThumbnailUrl(this.state.pageId, "Page", () => {
                Subscribers.UpdateSubscribers(EvenType.DocumentSaved);
                Subscribers.UpdateSubscribers(EvenType.EditorDocumentLoaded);
                Subscribers.UpdateSubscribers(EvenType.RenderChanged);
                Subscribers.UpdateSubscribers(EvenType.PagesLoaded);
            });
            if (this.props.onPageChanged) this.props.onPageChanged();
            if (message) alert(message);
		});
	}

    saveLayout() {
        var xml = this.props.applicationScope.myCanvasEditor.getTemporaryXml();

		if (this.props.applicationScope.conditions.isLayout) {
            Fetcher.postJson("/EditorApi/Layout/SaveLayout",
                { LayoutId: this.props.applicationScope.projectParameters.LayoutId, TemplateXml: xml })
                .then((data: any) => {
                    alert(data);
                });
        }
		else if (this.props.applicationScope.conditions.isCoverLayout) {
            Fetcher.postJson("/EditorApi/CoverLayout/SaveCoverLayout",
                { CoverLayoutId: this.props.applicationScope.projectParameters.CoverLayoutId, TemplateXml: xml })
                .then((data: any) => {
                    alert(data);
                });
        }
    }

    saveLayoutThumbnail() {
		if (this.props.applicationScope.conditions.isLayout) {
		    Fetcher.postJson("/EditorApi/Layout/SaveLayoutThumbnail", 
		        {
		            LayoutId: this.props.applicationScope.projectParameters.LayoutId,
		            Url: this.props.applicationScope.projectsUrls.EditorUrl,
		            Xml: this.props.applicationScope.myCanvasEditor.getTemporaryXml()
		        })
		        .then(function() {
                    this.getThumbnailUrl(this.props.applicationScope.projectParameters.LayoutId, "Layout");
		        }.bind(this));
		}
		else if (this.props.applicationScope.conditions.isCoverLayout) {
            Fetcher.postJson("/EditorApi/CoverLayout/SaveCoverLayoutThumbnail",
                {
                    CoverLayoutId: this.props.applicationScope.projectParameters.CoverLayoutId,
                    Url: this.props.applicationScope.projectsUrls.EditorUrl,
                    Xml: this.props.applicationScope.myCanvasEditor.getTemporaryXml()
                })
		        .then(function () {
                    this.getThumbnailUrl(this.props.applicationScope.projectParameters.CoverLayoutId, "CoverLayout");
		        }.bind(this));
        }
    }

    setCacheData(id: number, data: string) {
        CacheManager.SetDataToCache(id, data, CacheType.MyCanvasEditorProject);
    }

	saveLastChanges(id: number) {
		let data = LZString.compressToEncodedURIComponent(this.props.applicationScope.myCanvasEditor.getTemporaryXml());
		this.setCacheData(id, data);
	}

    getThumbnailUrl(id: number, controller: string, callback?: () => void) {
        Fetcher.getJson(`/EditorApi/${controller}/GetThumbnailUrl`, [["id", id]])
            .then(function (url: string) {
                let pageid = controller === "Page" ? id : 0;
                let currentPage = this.state.pages.filter((p: Page) => p.PageId === pageid)[0];
                currentPage.ThumnailUrl = url;
                currentPage.Milliseconds = new Date().getTime();
                if (callback) callback();
            }.bind(this));
    }

    openDocumentFromXml(xml: any) {
        this.props.applicationScope.myCanvasEditor.openDocumentFromXml(xml);
        Subscribers.UpdateSubscribers(EvenType.PagesLoaded);
    }

    getXml(id: number) {
        let currentId = this.state.pageId;

		if (currentId !== 0 && id !== currentId && this.props.applicationScope.conditions.notPreview) {
			try {
                this.savePage(currentId, false, (message, dirty) => {
                    this.changePage(id);
                    if (dirty) this.getThumbnailUrl(currentId, "Page");
                });
			}
			catch (e) {
				console.log(e);
			}
		} else {
			this.changePage(id);
		}

    }

	changePage(id: number) {
		this.getDocumentXmlById(id);

		this.setState({ pageId: id });

        let sequence = this.selectedPageNumber(id);
        let isCoverPage = sequence === 0;
		CacheManager.SetDataToCache("isCoverPage", isCoverPage, CacheType.CoversVariables);
        CacheManager.SetDataToCache("pagesCount", this.count(), CacheType.CoversVariables);
        CacheManager.SetDataToCache("currentPageId", id, CacheType.CoversVariables);
        CacheManager.SetDataToCache("currentPageSequence", sequence, CacheType.CoversVariables);
		if (this.props.onPageChanged) {
			this.props.onPageChanged();
		}
	}

	getDocumentXmlById(id: number) {
        let xml = CacheManager.GetDataFromCache(id, CacheType.MyCanvasEditorProject);

        if (xml) {
			this.openDocumentFromXml(LZString.decompressFromEncodedURIComponent(xml.Data));
        } else {
            Fetcher.getJson("/EditorApi/Project/GetDocumentXmlById", [["pageId", id]])
                .then(function (data: string) {
                    this.setCacheData(id, data);
					this.openDocumentFromXml(LZString.decompressFromEncodedURIComponent(data));
                }.bind(this));
		}
		CacheManager.TruncateByLimitAndType(10, CacheType.MyCanvasEditorProject);
    }

    setPagesState(layout: Layout) {
        this.setState({
            pages: [{
                Layout: layout,
                PageId: 0,
                PageNumber: 1,
                ThumnailUrl: layout.PreviewImageUrl,
                Milliseconds: new Date().getTime()
            }]
        });
        this.openDocumentFromXml(layout.TemplateXml);
    }

    autoTextCursor() {
        let isCoverPage = this.selectedPageNumber() === 0;
        this.props.applicationScope.myCanvasEditor.autoTextCursor(isCoverPage);
        this.setState({ anyPageSelected: (this.state.pages.filter(x => x.Selected).length !== 0) });
    }

    onEditorReady() {
		if (this.props.applicationScope.conditions.previewOrEditingOrAdmin) {
            this.loadFirstPage();
        }
		else if (this.props.applicationScope.conditions.isLayout) {
            Fetcher.getJson("/EditorApi/Layout/GetLayout", [["layoutId", this.props.applicationScope.projectParameters.LayoutId]])
                .then(function (layout: Layout) {
                    this.setPagesState(layout);
                }.bind(this));
        }
		else if (this.props.applicationScope.conditions.isCoverLayout) {
            Fetcher.getJson("/EditorApi/CoverLayout/GetCoverLayout", [["coverLayoutId", this.props.applicationScope.projectParameters.CoverLayoutId]])
                .then(function (layout: Layout) {
                    this.setPagesState(layout);
                }.bind(this));
        }
    }

    loadFirstPage() {
        if (this.state.pages.length > 0) {
            if (this.state.pageId === 0) {
                this.getXml(this.state.pages[0].PageId);
            } else {
                let xml = CacheManager.GetDataFromCache(this.state.pageId, CacheType.MyCanvasEditorProject);
				if (xml) this.openDocumentFromXml(LZString.decompressFromEncodedURIComponent(xml.Data));
            }
        }
    }

    count() {
        return this.state.pages ? this.state.pages.length : 0;
    }

    selectedPageNumber(id?: number): number {
        let selector = document.querySelector(`${this.itemTemplateRenderDivSelector}[data-pageid='${id ? id : this.state.pageId}']`);
        if (!selector) return -1;
        return +selector.getAttribute("data-pagenumber");
    }

    onSortEnd = ({ oldIndex, newIndex }: any) => {
        let pages = arrayMove(this.state.pages, oldIndex, newIndex);
        pages.forEach((x, i) => x.PageNumber = i);
        this.setState({ pages: pages });
        Fetcher.postJson("/EditorApi/Project/UpdateProjectPages",
            {
                ProjectId: this.props.applicationScope.projectParameters.ProjectId,
                PageId: pages[newIndex].PageId,
                PageNumber: newIndex
            });
    };

    selection(checkBox: HTMLInputElement, page: Page) {
        page.Selected = checkBox.checked;
        this.setState({ anyPageSelected: (this.state.pages.filter(x => x.Selected).length !== 0) });
    }

    deletePages(pages: Page[]) {
        Fetcher.postJson("/EditorApi/Page/DeletePages",
            {
                ProjectId: this.props.applicationScope.projectParameters.ProjectId,
                PageIds: pages.map(p => p.PageId)
            })
            .then(function (data: Page[]) {

                this.setState({ pages: data });
                CacheManager.RemoveArrayFromCache(pages.map(p => p.PageId), CacheType.MyCanvasEditorProject);
                this.setNewSelectedPage(pages[0].PageNumber);

            }.bind(this));
    }

    deleteSelectedPages() {
        if (confirm(`Delete selected pages?`)) {
            let pages = this.state.pages.filter(x => x.Selected);
            this.deletePages(pages);
        }
    }

    deletePage(): void {
        let selectedPageNumber = this.selectedPageNumber();
        if (confirm(`Delete page #${selectedPageNumber} ?`)) {
            let pages = this.state.pages.filter(x => x.PageId === this.state.pageId);
            this.deletePages(pages);
        }
    }

    setNewSelectedPage(number: number) {
        let newSelectedPage = this.state.pages.filter((p: Page) => p.PageNumber === number)[0];
        if (!newSelectedPage) {
            newSelectedPage = this.state.pages[this.state.pages.length - 1];
        }
        this.setState({ pageId: newSelectedPage.PageId });

        if (this.state.isHorizontalPaneFullyOpened) Subscribers.UpdateSubscribers(EvenType.NewPageSelected);

        this.getXml(newSelectedPage.PageId);
    }

    PageLimitReached() {
        let selector = document.querySelectorAll(`${this.itemTemplateRenderDivSelector}`);
        if (selector.length == this.limitOfPages) {
            alert(`You can't add more than ${this.limitOfPages} pages`);
            return true;
        }
    }

    addBlankPage(): void {
        let selectedPageNumber = this.selectedPageNumber();
        Fetcher.postJson("/EditorApi/Page/AddPages",
            {
                ProjectId: this.props.applicationScope.projectParameters.ProjectId,
                ProductId: this.props.applicationScope.projectParameters.ProductId,
                PageNumber: selectedPageNumber
            })
            .then(function (data: Page[]) {
                this.setState({ pages: data });
                this.setNewSelectedPage(selectedPageNumber + 1);
            }.bind(this));
    }

    render() {
        const SortableItem = SortableElement(({ item }: any) =>
            <ItemTemplate pageId={this.state.pageId} getXml={this.getXml.bind(this)} item={item} selection={this.selection.bind(this)} isHorizontalPaneFullyOpened={this.state.isHorizontalPaneFullyOpened} />
        );
        const SortableList = SortableContainer(({ items }: any) => {
            return (
				<div className={`page-list${this.state.isHorizontalPaneFullyOpened ? "" : " flex"}`}>
                    {items.map((page:Page, index:number) => (
						<SortableItem key={`item-${index}`} index={index} item={page} disabled={page.PageNumber === 0 || !this.props.applicationScope.conditions.notPreview } />
                    ))}
                </div>
            );
        });
        const style: any = this.state.isHorizontalPaneFullyOpened ? { "style": { height: this.state.horizontalSplitSize } } : {};
        return (
            <div className="page-wrapper" {...style}>
                {this.state.isHorizontalPaneFullyOpened
                    ? <div className="button-group">                     
                        <ClassicButton text={ButtonIcon.DeleteSelectedPages} enabled={this.state.anyPageSelected} onClick={this.deleteSelectedPages.bind(this)} />
                    </div>
                    : null
                }
                <SortableList items={this.state.pages} onSortEnd={this.onSortEnd} helperClass={"Pages_ItemTemplate_Class"} axis={"xy"} pressDelay={200} lockToContainerEdges={true} />
            </div>
        );
    }
}


interface IItemTemplateProps {
    item?: Page;
    pageId: number;
    getXml: (id: number) => void;
    selection: (checkBox: HTMLInputElement, page: Page) => void;
    isHorizontalPaneFullyOpened: boolean;
}

class ItemTemplate extends React.Component<IItemTemplateProps, {}> {
    private checkBox: HTMLInputElement;
    private coverName = "Cover";
    private pageCover = this.props.item.PageNumber === 0;

    selectThis() {
        if (this.checkBox) this.checkBox.click();
    }

    // just to avoid react warning
    dummy() { }

    render() {
        const styleBackground: React.CSSProperties = {
            width: this.pageCover ? `144px` : `72px`,
            height: `67px`,
            backgroundSize: this.pageCover ? `144px 51px` : `72px 51px`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center top`,
            backgroundImage: `url(${(this.props.item.ThumnailUrl
                ? this.props.item.ThumnailUrl
                : this.props.item.Layout
                    ? "https://dummyimage.com/" + (this.props.item.Layout.Width * 10) + "x" + (this.props.item.Layout.Height * 10) + "/ffffff/888888.png&text=" + (this.props.item.Layout.Width) + "+x+" + (this.props.item.Layout.Height)
                    : ""
                )}#${this.props.item.Milliseconds})`
        };

        const stylePage: React.CSSProperties = {
            display: `inline-block`,
            margin: `5px 0px`,
            backgroundColor: `#ddd`,
            position: "relative",
            height: `67px`,
            cursor: `${this.pageCover ? this.props.isHorizontalPaneFullyOpened ? "default" : "pointer" : "pointer"}`
        };
        const stylePageLeft: React.CSSProperties = { marginLeft: `5px` };
        const stylePageRihgt: React.CSSProperties = { marginRight: `5px` };
        const stylePageSelected: React.CSSProperties = { backgroundColor: `#1476c9` };
        const styleSelectNone: React.CSSProperties = {
            WebkitUserSelect: `none`,
            MozUserSelect: `-moz-none`,
            msUserSelect: `none`,
            userSelect: `none`
        };
        const styleName: React.CSSProperties = {
            position: "absolute",
            bottom: `${this.pageCover ? "2" : this.props.isHorizontalPaneFullyOpened ? "-3" : "2"}px`,
            left: `0`,
            right: `0`,
            textAlign: `center`,
            fontSize: `9px`
        };
        const styleCheckbox: React.CSSProperties = {
            float: `right`,
            borderColor: `gray`
        };
        let styleBody = ObjectAssign(
            ObjectAssign(styleBackground, stylePage),
            ObjectAssign(this.pageCover ? stylePageRihgt : this.props.item.PageNumber % 2 === 1 ? stylePageRihgt : stylePageLeft, this.props.item.PageId === this.props.pageId ? stylePageSelected : null));
        let styleCaption = ObjectAssign(styleName, styleSelectNone);

        return <div key={this.props.item.PageId}
            id={"ItemTemplate_Render_Div"}
            style={styleBody}
            data-pageid={this.props.item.PageId}
            data-pagenumber={this.props.item.PageNumber}
            title={this.pageCover ? this.coverName : `Page #${this.props.item.PageNumber}`}
            onClick={() => this.props.isHorizontalPaneFullyOpened ? this.selectThis() : this.props.getXml(this.props.item.PageId)}>
            <div style={styleCaption}>
                {this.pageCover
                    ? this.coverName
                    : this.props.item.PageNumber}
                {this.pageCover
                    ? null
                    : this.props.isHorizontalPaneFullyOpened
                        ? <input style={styleCheckbox} ref={(x: HTMLInputElement) => this.checkBox = x} type="checkbox" checked={this.props.item.Selected} onClick={(e: any) => {e.stopPropagation(); this.props.selection(this.checkBox, this.props.item);}} onChange={this.dummy.bind(this)} />
                        : null}
            </div>
        </div>;
    }
}
