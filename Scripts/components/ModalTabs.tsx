// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { ModalEx } from "../ModalEx";

interface ITabsProps {
    onChange?: (title: string) => void;
}
interface ITabsStates {
    tabs: TabItem[];
    change: boolean;
    content?: HTMLDivElement[];
    activeIndex?: number;
}
export class ModalTabs extends React.Component<ITabsProps, ITabsStates> {
    constructor() {
        super();
        this.state = { tabs: [], change: false, content: [], activeIndex: 0 };
    }

    componentDidMount(): void {
        this.setItems();
    }

    setItems() {
        let items = this.props.children as TabItem[];
        items = items.filter(x => !x.props.disabled);
        this.setState({ tabs: items, change: !this.state.change });
        this.showContent(0);
        this.setDimension();
    }

    refresh() {
        this.setState({ activeIndex: 0, change: !this.state.change });
        this.setItems();
    }

    shouldComponentUpdate(nextProps: ITabsProps, nextState: ITabsStates, nextContext: any): boolean {
        let change = this.state.change !== nextState.change;
        if (change) {
            this.onChange();
            this.setDimension();
        }
        return change;
    }

    onChange() {
        if (this.props.onChange) {
            let tab = this.state.tabs.filter((v, i) => i === this.state.activeIndex)[0];
            let title = tab ? tab.props.title : "";
            this.props.onChange(title);
        }
    }

    getFirstTitle() {
        if (this.state.tabs.length > 0) {
            return this.state.tabs[0].props.title;
        }
        return "";
    }

    setDimension() {
        ModalEx.setModalDimension();
    }

    handleClick(title: string) {
        let index = this.state.tabs.findIndex(v => v.props.title === title);
        this.showContent(index);
        this.setState({ activeIndex: index, change: !this.state.change });
    }

    showContent(index: number) {
        if (this.state.content.length > 0) {
            this.state.content.forEach((x) => x.style.display = "none");
            this.state.content[index].style.display = "";
        }
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

    render() {
        if (this.state.tabs.length === 0) return null;
        return (
            <div className="mc-tabs">
                <nav className="mc-tabs-navigation">
                    <ul className="mc-tabs-menu">

                        {this.state.tabs.map((v, i) => {
                            let clickEvent = this.state.activeIndex === i ? {} : { "onClick": () => this.handleClick(v.props.title) };
                            return <li key={i} className={`mc-tabs-menu-item ${this.state.activeIndex === i ? "active" : ""}`} {...clickEvent}>
                                      <a href="#" data-tab-id={i}>{v.props.title}</a>
                                  </li>;
                        })}

                    </ul>
                </nav>
                <section className="mc-tabs-panels">
                    {this.state.tabs.map((v, i) =>
                        <div style={{ display: this.state.activeIndex === i ? "" : "none"}} id={`${i}`} ref={(x: HTMLDivElement) => this.setDivToDivs(x)} key={i}>{v}</div>
                    )}
                </section>
            </div>
        );
    }
}

interface ITabItemProps {
    title: string;
    disabled?: boolean;
}
interface ITabItemStates {
}
export class TabItem extends React.Component<ITabItemProps, ITabItemStates> {

    render() {
        return <div>{this.props.children}</div>;
    }
}
