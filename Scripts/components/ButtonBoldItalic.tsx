// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { FontManager, IFont, IFontState, FontStyle } from "../FontManager";
import { Subscribers, EvenType } from "../Subscribers";
import { Button, ButtonTitle, ButtonIcon } from "./Button";

interface IProps extends EditorPropsBase { style?: any; title?: any; icon?: any; noborder?: boolean; }
interface IStates { current?: IFont; enabled?: boolean; active?: boolean; }

export class ButtonBold extends React.Component<IProps, {}> {
    constructor() {
        super();
        Subscribers.AddSubscriber("ButtonBold", EvenType.ApplyFont, this);
    }

    render() {
        return <ButtonBoldItalic applicationScope={this.props.applicationScope} title={ButtonTitle.Bold} icon={ButtonIcon.Bold} style={FontStyle.Bold} noborder={this.props.noborder}/>;
    }
}

export class ButtonItalic extends React.Component<IProps, {}> {
    constructor() {
        super();
        Subscribers.AddSubscriber("ButtonItalic", EvenType.ApplyFont, this);
    }

    render() {
        return <ButtonBoldItalic applicationScope={this.props.applicationScope} title={ButtonTitle.Italic} icon={ButtonIcon.Italic} style={FontStyle.Italic} noborder={this.props.noborder}/>;
    }
}

class ButtonBoldItalic extends React.Component<IProps, IStates> {
    constructor() {
        super();
        this.state = { current: FontManager.FontDefault, enabled: false, active: false };
    }

    componentDidMount(): void {
        let state = this.getState();
        this.setState({ current: state.font, active: state.active, enabled: state.enabled });
    }

    componentWillUpdate(nextProps: IProps, nextState: IStates, nextContext: any): void {
        if (!nextState.current) nextState.current = FontManager.FontDefault;

        let state = this.getState();
        if (state.id !== nextState.current.id || state.enabled !== nextState.enabled) {
            this.setState({ current: state.font, active: state.active, enabled: state.enabled });
        }
    }

    onClick() {
        let state = this.getState();
        this.props.applicationScope.myCanvasEditor.setSelectedTextFont(state.nextfont);
        this.setState({ current: state.nextfont, active: state.nextactive });
    }

    getState(): IFontState {
        let id: string = this.props.applicationScope.myCanvasEditor.getSelectedTextFont();
        return FontManager.GetFontState(id, this.props.style);
    }

    render() {
        return <Button icon={this.props.icon} title={this.props.title} active={this.state.active} enabled={this.state.enabled} onClick={this.onClick.bind(this)} noborder={this.props.noborder}/>;
    }
}
