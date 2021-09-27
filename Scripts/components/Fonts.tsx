// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { FontManager, IFont } from "../FontManager";
import { Subscribers, EvenType } from "../Subscribers";
import { DropDown } from "./DropDown";

interface IProps extends EditorPropsBase { }
interface IStates { current?: IFont }

export class DropDownFonts extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { current: FontManager.FontDefault };
    }

    componentDidMount(): void {
        let id = this.props.applicationScope.myCanvasEditor.getSelectedTextFont();
        this.setState({ current: FontManager.GetFontById(id) });
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any): void {
        if (!nextState.current) nextState.current = FontManager.FontDefault;
        
        let id = this.props.applicationScope.myCanvasEditor.getSelectedTextFont();
        let font = FontManager.GetFontById(id);
        if (font.id !== nextState.current.id) {
            this.setState({ current: font });
        }
    }

    applyFont(item: any) {
        // find same font-style if available
        let fontnew = FontManager.FontDefault;
        let id: string = this.props.applicationScope.myCanvasEditor.getSelectedTextFont();
        if (id) {
            let font = FontManager.GetFontById(id);
            fontnew = FontManager.GetFontToApply(item.id, font.style);
        }
        if (fontnew.id !== "") item = fontnew;
        
        this.props.applicationScope.myCanvasEditor.setSelectedTextFont(item);
        this.setState({ current: item });
        
        // dispatch update event
        Subscribers.UpdateSubscribers(EvenType.ApplyFont);
    }

    optionParser(source: Array<IFont>, onClick: (value: any) => void) {
        return source.map((item: IFont, i: number) =>
            <div key={i} onClick={() => onClick(item)} className={item.family === this.state.current.family ? "dropdown-option-selected" : "dropdown-option"}>
                <img src={`${this.props.applicationScope.projectsUrls.RootUrl}/content/images/fonts/${item.source}`} alt="{item.family} {item.style}"/>
            </div>);
    }

    render() {
        return (
            <DropDown
                options={FontManager.FontList.filter(option => option.source !== "")}
                optionsParser={this.optionParser.bind(this)} onChange={this.applyFont.bind(this)}
                value={this.state.current.family} />
        );
    }
}
