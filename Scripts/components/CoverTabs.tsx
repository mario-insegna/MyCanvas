// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { Subscribers, EvenType } from "../Subscribers";
import { ClassicButton } from "./ClassicButton";

interface ITabsProps {
    currentCoverId: number;
    getTabs: () => ITab[];
    applyCoverType: (coverId: number) => void;
}

interface ITabsStates {
    tabs?: ITab[];
    content?: HTMLDivElement[];
    menukey?: number;
}

export class CoverTabs extends React.Component<ITabsProps, ITabsStates> {
    constructor() {
        super();
        this.state = { tabs: [], content: [], menukey: 0};
    }

    getTabs() {
        let tabs = this.props.getTabs();
        this.setState({ tabs:  tabs});

        if (this.state.content.length) {
            let index = tabs.findIndex((tab : ICover) => tab.CoverId === this.props.currentCoverId);
            this.handleClick(index === -1 ? 0 : index);
        }
    }

    handleClick(key: number) {
        this.showContent(key);
        this.setState({ menukey: key});
    }

    showContent(index: number) {
        this.state.content.forEach((x) => x.style.display = "none");
        this.state.content[index].style.display = "";
    }

    setDivToDivs(div: HTMLDivElement) {
        if (div === null) return;
        let index = this.state.content.findIndex((d) => d.id === div.id);
        if (index === -1) {
            this.state.content.push(div);
        } else {
            this.state.content[index] = div;
        }
    }

    applyCoverType(coverId: number) {
        this.props.applyCoverType(coverId);
    }

    render() {
        const clearingdiv = { clear: `both` };
        const allwidth = { width: `100%` };
        return (
            <div className="covers-modal-main">
                <div className="covers-modal-left-content">
                    <label>Standard Covers & Bindings</label>
                    <p style={allwidth}></p>
                    {this.state.tabs.map((v, i) =>
                        <div className="menu-item-left" key={i}>
                            {this.state.menukey === i
                                ? <label>{v.title}</label>
                                : <a href="#" id={`${i}`} key={i} onClick={() => this.handleClick(i)} >{v.title}</a>
                            }
                        </div>)}
                </div>
                <div className="covers-modal-right-content">
                    {this.state.tabs.map((v, i) =>
                        <div id={`${i}`} ref={(x: HTMLDivElement) => this.setDivToDivs(x)} key={i}>
                            <Viewer tab={v} currentCoverId={this.props.currentCoverId} applyCoverType={() => this.applyCoverType(v.CoverId)} />
                        </div>)}
                </div>
                <div style={clearingdiv}></div>
            </div>
        );
    }
}

interface IViewerProps {
    tab: ITab;
    applyCoverType: () => void;
    currentCoverId: number;
}
interface IViewerStates {
    outside?: boolean;
}

class Viewer extends React.Component<IViewerProps, IViewerStates> {
    constructor() {
        super();
        this.state = { outside: false }
    }

    img: HTMLImageElement = null;
    private nbsp = "\u00A0";
    private labelOutside = "Outside";
    private labelInside = "Inside";

    componentDidMount(): void {
        if (this.img) this.img.onload = () => this.setState({ outside: !this.state.outside });
        this.handleOutside();
    }

    handleOutside() {
        if (this.img && this.props.tab.Colors[0]) { this.img.src = this.props.tab.Colors[0].CoverPageOutsidePreview; }
    }

    handleInside() {
        if (this.img && this.props.tab.Colors[0]) { this.img.src = this.props.tab.Colors[0].CoverPageInsidePreview; }
    }

    handleApplyCoverType() {
        this.props.applyCoverType();
    }

    render() {
        return (
            <div>
                <div className={`image-container coverid-${this.props.tab.CoverId}`}>
                    <CoverOptionsPopup title={this.props.tab.title} outside={this.state.outside} coverid={this.props.tab.CoverId}/>
                    <img className="image" alt="" ref={(x: HTMLImageElement) => this.img = x} />
                </div>
                <br />
                <ul className="menu-horizontal">
                    <li>{this.state.outside ? <label>{this.labelOutside}</label> : <a onClick={this.handleOutside.bind(this)} href="#">{this.labelOutside}</a>}</li>
                    <li>{!this.state.outside ? <label>{this.labelInside}</label> : <a onClick={this.handleInside.bind(this)} href="#">{this.labelInside}</a>}</li>
                </ul>
                <p></p>
                <div className="info-colors">
                    <h3>{"Colors:"}{this.nbsp}</h3>
                    {this.props.tab.Colors.map((v, i, a) => v.DisplayName !== ""
                        ? <img key={i} src={v.ColorPreview.ThumbUrl} alt={v.DisplayName}/>
                        : null
                    )}
                </div>
                <br />
                <div>
                    {this.props.tab.content}
                </div>
                <br />
                <div className="change-option">
                    {
                        this.props.currentCoverId === this.props.tab.CoverId
                            ? <label>Current Cover Type</label>
                            : <ClassicButton text={"Apply this Cover Type"} onClick={this.handleApplyCoverType.bind(this)} enabled={true} />
                    }
                </div>
            </div>
        );
    }
}

interface ICoverOptionsPopupProps {
    title: string;
    outside: boolean;
    coverid: number;
}

interface ICoverOptionsPopupStates {
    current?: IPoints;
    isHover1: boolean;
    isHover2: boolean;
}

interface IPopup {
    top: number;
    left: number;
    message: string;
}

interface IPoints {
    point1: IPopup;
    point2: IPopup;
}

enum TabOption {
    BondedOutside,
    BondedInside,
    NubaOutside,
    NubaInside,
    CustomOutside,
    CustomInside,
    PaddedOutside,
    PaddedInside,
}

class CoverOptionsPopup extends React.Component<ICoverOptionsPopupProps, ICoverOptionsPopupStates> {
    constructor() {
        super();
        this.state = { current: { point1: { top: 0, left: 0, message: "" }, point2: { top: 0, left: 0, message: "" } }, isHover1: false, isHover2: false }
        Subscribers.AddSubscriber("CoverOptionsPopup", EvenType.RenderChanged, this, this.getPoints.bind(this));
    }

    getPointPosition(option: TabOption, msg1: string, msg2: string): IPoints {
        let conv = this.getPointsConversion(option);
        let img = document.querySelector(`.image-container.coverid-${this.props.coverid} img`) as HTMLElement;
        return img ? { point1: { top: conv[0] * img.offsetHeight, left: conv[1] * img.offsetWidth, message: msg1 }, point2: { top: conv[2] * img.offsetHeight, left: conv[3] * img.offsetWidth, message: msg2 } } : null;
    }

    getPoints() {
        this.getPointsByNameAndSide(this.props.title, this.props.outside);
    }

    getPointsConversion(option: TabOption) {
        let w = 0;
        let h = 350;
        switch (option) {
            case TabOption.BondedOutside:
                w = 412.933;
                return [120 / h, 130 / w, 270 / h, 300 / w];
            case TabOption.BondedInside:
            case TabOption.NubaInside:
            case TabOption.PaddedInside:
                w = 545.283;
                return [63 / h, 200 / w, 310 / h, 267 / w];
            case TabOption.NubaOutside:
                w = 413.433;
                return [100 / h, 125 / w, 280 / h, 300 / w];
            case TabOption.CustomOutside:
                w = 445.35;
                return [43 / h, 77 / w, 260 / h, 120 / w];
            case TabOption.CustomInside:
                w = 550;
                return [25 / h, 330 / w, 305 / h, 245 / w];
            case TabOption.PaddedOutside:
                w = 360.933;
                return [8 / h, 288 / w, 285 / h, 270 / w];
            default:
                return [0, 0, 0, 0];
        }
    }

    getPointsByNameAndSide(name: string, outside: boolean): IPoints {
        switch (true) {
            case name.startsWith("Bonded Leather") && outside:
                return this.getPointPosition(TabOption.BondedOutside, "2-line gold foil custom title stamping", "Offers a rich, textured look similar to genuine leather");
            case name.startsWith("Nuba") && outside:
                return this.getPointPosition(TabOption.NubaOutside, "2-line gold foil custom title stamping", "Paper-based nuba material has smooth matte finish");
            case name.startsWith("Custom") && outside:
                return this.getPointPosition(TabOption.CustomOutside, "It is printed in a durable matte finish", "This custom hard-cover is designed by you using backgrounds and photos you choose");
            case name.startsWith("Padded Leather") && outside:
                return this.getPointPosition(TabOption.PaddedOutside, "Bonded leather with stitching around the edges to give it a rich look and feel", "Cover is padded for a rich, substantial look and feel");
            case name.startsWith("Bonded Leather") && !outside:
                return this.getPointPosition(TabOption.BondedInside, "Add up to 250 custom pages", "Printed on 100-pound gloss, acid-free, archival paper");
            case name.startsWith("Nuba") && !outside:
                return this.getPointPosition(TabOption.NubaInside, "Add up to 250 custom pages", "Printed on 100-pound gloss, acid-free, archival paper");
            case name.startsWith("Custom") && !outside:
                return this.getPointPosition(TabOption.CustomInside, "Add up to 80 custom pages", "Printed on 100-pound gloss, acid-free, archival paper");
            case name.startsWith("Padded Leather") && !outside:
                return this.getPointPosition(TabOption.PaddedInside, "Add up to 80 custom pages", "Printed on 100-pound gloss, acid-free, archival paper");
        }
        return null;
    }

    componentDidMount(): void {
        this.setState({ current: this.getPointsByNameAndSide(this.props.title, this.props.outside) });
    }

    componentWillUpdate(nextProps: ICoverOptionsPopupProps, nextState: ICoverOptionsPopupStates, nextContext: any): void {
        let points = this.getPointsByNameAndSide(this.props.title, this.props.outside);
        if (!points) return;
        if (points.point1.message !== nextState.current.point1.message ||
            points.point2.message !== nextState.current.point2.message ||
            this.props.outside !== nextProps.outside ||
            points.point1.top !== nextState.current.point1.top ||
            points.point1.left !== nextState.current.point1.left ||
            points.point2.top !== nextState.current.point2.top ||
            points.point2.left !== nextState.current.point2.left) {
            this.setState({ current: points });
        }
    }

    onMouseOver1() {
        this.setState({ isHover1: true, isHover2: false});
    }

    onMouseOut() {
        this.setState({ isHover1: false, isHover2: false });
    }

    onMouseOver2() {
        this.setState({ isHover1: false, isHover2: true });
    }


    render() {
        if (this.state.current.point1.top === 0) return null;

        const style1: React.CSSProperties = {
            top: this.state.current.point1.top,
            left: this.state.current.point1.left,
        };

        const style2: React.CSSProperties = {
            top: this.state.current.point2.top,
            left: this.state.current.point2.left,
        };

        const style1a: React.CSSProperties = {
            top: this.state.current.point1.top,
            left: this.state.current.point1.left + 20,
        };

        const style2a: React.CSSProperties = {
            top: this.state.current.point2.top,
            left: this.state.current.point2.left + 20,
        };

        const clearStyle = { clear: "both" };

        return (
            <div className="popup">
                <div style={style1} className="point1" onMouseOver={this.onMouseOver1.bind(this)} onMouseOut={this.onMouseOut.bind(this)} />

                {this.state.isHover1
                    ? <div style={style1a} className="message1">{this.state.current.point1.message}</div>
                    : null
                }

                <div style={style2} className="point2" onMouseOver={this.onMouseOver2.bind(this)} onMouseOut={this.onMouseOut.bind(this)} />

                {this.state.isHover2
                    ? <div style={style2a} className="message2">{this.state.current.point2.message}</div>
                    : null
                }

                <div style={clearStyle}></div>
            </div>);
    }
}
