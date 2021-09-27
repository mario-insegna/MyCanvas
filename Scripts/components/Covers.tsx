// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";
import { Modal,Dimension } from "./Modal";
import { CoverTabs } from "./CoverTabs";
import { Subscribers, EvenType } from "../Subscribers";
import { CacheManager, CacheType } from "../CacheManager";
import { CoverTypes } from "../Common";
import { ClassicButton } from "./ClassicButton";

interface ICoversProps extends EditorPropsBase {
}

interface ICoversStates {
    cover?: ICover;
    covers?: ICover[];
    isCoverPage?: boolean;
    currentPageId: number;
}

interface ICoversRefs {
    modal?: Modal;
    typemodal?: Modal;
    covertabs?: CoverTabs;
    info?: Info;
}

export class Covers extends React.Component<ICoversProps, ICoversStates> {
    objs: ICoversRefs = {};

    constructor() {
        super();
        this.state = {
            isCoverPage: false,
            cover: {
                Name: "",
                DisplayName: "",
                CoverTypeId: CoverTypes.Custom,
                Binding: "",
                MaxPages: 0,
                CountPages: 0,
                BasePrice: 0,
                TotalCost: 0,
                CoverId: 0,
                PagePrice: 0,
                Layouts: [],
                Colors: []
            },
            covers: [],
            currentPageId: 0
        };
        Subscribers.AddSubscriber("ResourceExplorerCovers", EvenType.EditorDocumentLoaded, this, this.isCoverPage.bind(this));
    }

    componentWillMount() {
        this.getCoverData();
    }

    isCoverPage() {
        this.setState({ currentPageId: CacheManager.GetValueFromCache<number>("currentPageId", CacheType.CoversVariables) });
        let isCoverPage = CacheManager.GetValueFromCache<boolean>("isCoverPage", CacheType.CoversVariables);
        this.setState({ isCoverPage: isCoverPage });
        // cascade event
        Subscribers.UpdateSubscribers(EvenType.CoverPagesLoaded);
    }

    setCoverState(cover: ICover) {
        this.setState({ cover: cover });
        CacheManager.SetDataToCache("isCoverRestricted", cover.CoverTypeId === CoverTypes.TwoLine, CacheType.CoversVariables);
        Subscribers.UpdateSubscribers(EvenType.PagesLoaded);
        this.isCoverPage();
    }

    getCoverData() {
        let action = `${this.props.applicationScope.conditions.isCoverLayout
            ? "GetCoverByCoverLayoutId"
            : "GetCoverByProjectId"}`;

        let idParam = this.props.applicationScope.conditions.isCoverLayout
            ? this.props.applicationScope.projectParameters.CoverLayoutId
            : this.props.applicationScope.projectParameters.ProjectId;

        Fetcher.getJson(`/EditorApi/Covers/${action}`, [["id", idParam]])
            .then(function (cover: ICover) {
                this.setCoverState(cover);
            }.bind(this));
    }

    getCoversByProductId() {
        Fetcher.getJson("/EditorApi/Covers/GetCoversByProductId", [["productId", this.props.applicationScope.projectParameters.ProductId]])
            .then(function (covers: ICover[]) {
                this.setState({ covers: covers });
                if (covers[0].CoverId !== 0) this.objs.covertabs.getTabs();
            }.bind(this));
    }

    handleCoverTypes() {
        if (this.objs.typemodal) {
            this.objs.typemodal.show();
            if (this.state.covers.length === 0) {
                this.getCoversByProductId();
            }
        }
    }

    pagesCount(): number {
        let count = CacheManager.GetValueFromCache<number>("pagesCount", CacheType.CoversVariables);
        return count ? count : 0;
    }

    getTabs(): ITab[] {
        if (this.state.covers) {
            let tabs: ITab[] = this.state.covers.map((v, i) => { return {
                CoverId: v.CoverId,
                title: v.Name,
                content: <Info isPopup={true} pagesCount={this.pagesCount()} cover={v} />,
                Colors: v.Colors
            }  });
            return tabs;
        }
        return [] as ITab[];
    }

    applyColor(colorPreview: ImageInfo) {
        this.props.applicationScope.myCanvasEditor.setBackgroundFrameImage(colorPreview.ImageId,
            colorPreview.Name,
            colorPreview.Url,
            colorPreview.ThumbUrl,
            colorPreview.Url,
            colorPreview.Width,
            colorPreview.Height,
            "300 kb");
    }

    applyLayout(coverLayoutId: number) {
        Fetcher.postJson("/EditorApi/Covers/SetLayout",
                {
                    CoverLayoutId: coverLayoutId,
                    DocumentXml: this.props.applicationScope.myCanvasEditor.getTemporaryXml(),
                    Url: this.props.applicationScope.projectsUrls.EditorUrl,
                    PageId: this.state.currentPageId
                })
            .then(function (xml: string) {
                this.props.applicationScope.myCanvasEditor.openDocumentFromXml(xml);
            }.bind(this));
    }

    applyCoverType(coverId: number) {
        this.objs.typemodal.close();
        Fetcher.postJson("/EditorApi/Covers/SetCoverType",
            {
                CoverId: coverId,
                ProjectId: this.props.applicationScope.projectParameters.ProjectId,
                DocumentXml: this.props.applicationScope.myCanvasEditor.getTemporaryXml(),
                Url: this.props.applicationScope.projectsUrls.EditorUrl,
                PageId: this.state.currentPageId
            })
            .then(function (xml: string) {
                this.props.applicationScope.myCanvasEditor.openDocumentFromXml(xml);
                this.getCoverData();
            }.bind(this));
    }

    render() {
        return (
            <Modal dimension={Dimension.Medium} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title="Covers" applicationScope={this.props.applicationScope}>
                <div className="resource-explorer-covers" style={{ maxWidth: 450}}>
                    <Modal dimension={Dimension.Large} useUndoRedo={false} ref={(x: Modal) => { this.objs.typemodal = x }} title="Choose a Cover Type" applicationScope={this.props.applicationScope}>
                        <CoverTabs ref={(x: CoverTabs) => { this.objs.covertabs = x }} getTabs={this.getTabs.bind(this)} applyCoverType={this.applyCoverType.bind(this)} currentCoverId={this.state.cover.CoverId} />
                    </Modal>                
                    <br />
                    <ClassicButton text="Change Cover Type" enabled={this.state.isCoverPage} onClick={this.handleCoverTypes.bind(this)} />
                    <br />
                    <Info ref={(x: Info) => {this.objs.info = x}} isPopup={false} pagesCount={this.pagesCount()} cover={this.state.cover} />
                    <br />
                    {this.state.isCoverPage
                        ? <div>
                            <label>{"Layouts"}</label><br />
                            {
                                this.state.cover.Layouts.map((layout: ILayout, index: number) => {
                                    return <div key={index} style={{ backgroundImage: `url(${layout.PreviewImageUrl})` }} className="wrapper-img" onClick={() => this.applyLayout(layout.CoverLayoutId)}>
                                        <div className="img-layouts">
                                            <div className="float-inner" />
                                        </div>
                                    </div>;
                                })
                            }
                        </div>
                        : null
                    }
                    {(this.state.isCoverPage || this.props.applicationScope.conditions.isCoverLayout) && this.state.cover.Colors.filter(c => c.DisplayName !== "").length > 0
                        ? <div>
                            <label>{"Colors"}</label> <br />
                            {
                            this.state.cover.Colors.map((color: IColor, index: number) => {
                                return <div key={index} className="wrapper-img">
                                    <img className="img-colors" onClick={() => this.applyColor(color.ColorPreview)} src={color.ColorPreview.ThumbUrl} alt={color.DisplayName} /><br />
                                    {color.DisplayName}
                                </div>;
                                })
                            }
                        </div>
                        : null
                    }
                </div>
            </Modal>);
    }
}

interface IInfoProps {
    pagesCount: number;
    cover: ICover;
    isPopup: boolean;
}

interface IInfoStates {
    totalCost: number;
}

class Info extends React.Component<IInfoProps, IInfoStates> {
    private nbsp = "\u00A0";

    constructor() {
        super();
        this.state = { totalCost: 0 };
        Subscribers.AddSubscriber("Info", EvenType.PagesLoaded, this, this.totalCost.bind(this));
    }

    totalCost() {
        let addl: number = 0;
        let diff: number = this.props.pagesCount - this.props.cover.MaxPages;
        if (diff > 0) {
            addl = diff * this.props.cover.PagePrice;
        }
        this.setState({ totalCost: this.props.cover.BasePrice + addl});
    }

    render() {
        return (
            <div className="modal-info-covers">
                <label>{"Cover: "}</label><span>{this.props.cover.DisplayName}</span><br />
                {this.props.isPopup ?
                    <div>
                        <label>{"Colors: "}</label>
                        {this.props.cover.Colors.filter(c => c.DisplayName !== "").length > 0
                            ? this.props.cover.Colors.map((v, i, a) => <span key={i}>{v.DisplayName}{i < a.length - 1 ? ", " : ""}</span>)
                            : <span>None</span>
                        }
                        <br />
                    </div>
                : null}
                <label>{"Binding: "}</label><span>{this.props.cover.Binding}</span><br />
                <label> {"Base Price: "}</label><span>{this.props.cover.BasePrice}{` for ${this.props.cover.MinPages} pages`}</span><br />
                <label>{"Add'l pages: "}</label><span>{this.props.cover.PagePrice}</span><br />
                <label>{"Max.Pages: "}</label><span>{this.props.cover.MaxPages}</span><br />
                {this.props.isPopup ?
                    null
                    : <div>
                        <label>{"Pages in current book: "}</label><span>{this.props.pagesCount-1}</span><br />
                        <label>{"Total Book and Cover Cost: "}</label><span>{"$"}{this.nbsp}{this.state.totalCost.toFixed(2)}</span>
                    </div>}
            </div>
        );
    }
}

