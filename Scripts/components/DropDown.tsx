// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { ObjectAssign } from "../Polyfills";

interface DropDownRefs {
    inputFocus?: HTMLInputElement;
}
interface IProps {
    options: any[];
    optionsParser?: (options: any[], onClick: (value: any) => void) => HTMLDivElement[];
    onChange: (item: any) => void;
    value?: any;
    icon?: any;
    disabled?: boolean;
    width?: number;
    selectHeight?: any;
    onlyTitle?: boolean;
    noborder?: boolean;
    optionHeight?: any;
}
interface IState {
    hidden?: boolean;
}
export class DropDown extends React.Component<IProps, IState> {
    objs: DropDownRefs = {};
    mouseOverOptions: boolean = false;

    constructor() {
        super();
        this.state = { hidden: true };
    }
    handleOptionClick(value: any) {
        this.close();
        this.props.onChange(value);
    }
    handleInputBlur() {
        if (!this.mouseOverOptions) {
            this.close();            
        }
    }
    handleLabelClick() {
        if (this.state.hidden && !this.props.disabled) {
            this.setState({ hidden: false });
            this.objs.inputFocus.focus();
        } else {
            this.close();
        }
    }
    close() {
        this.setState({ hidden: true });
    }
    private getLabelName() {
        if (this.props.value) {
            if (this.props.onlyTitle) {
                return this.props.value;
            }
            else
            if (this.props.optionsParser) {
                return this.props.value;
            } else {
                let option = this.props.options.filter((x: string) => x.split('|')[0] === ("" + this.props.value))[0];
                let keyValue = option.split('|');
                return keyValue.length > 1 ? keyValue[1] : keyValue[0];
            }
        } else {
            return "";
        }
    }
    render() {
        let text = this.getLabelName();

        let dropdownStyle: React.CSSProperties = ObjectAssign({}, this.props.width ? { width: this.props.width } : {});
        dropdownStyle = ObjectAssign(dropdownStyle, this.props.noborder ? { border: 0, borderRadius: 0 } : {});
        dropdownStyle = ObjectAssign(dropdownStyle, this.props.selectHeight ? { height: this.props.selectHeight } : {});
        
        return (
            <div tabIndex={0} title={text} className={`dropdown ${this.props.disabled ? "inactive" : ""}`} style={dropdownStyle}>
                <span className="caption">{text}</span>
                <input ref={(x: HTMLInputElement) => { this.objs.inputFocus = x } } type="text" onBlur={this.handleInputBlur.bind(this)} />
                <div className={this.props.icon ? "button-group icon" : "dropdown-label"} onClick={this.handleLabelClick.bind(this)}>
                    {this.props.icon 
                        ? this.props.icon
                        : <div className="dropdown-label-arrow">{" ▾"}</div>
                    }
                </div>
                <div tabIndex={-1} className={this.state.hidden || !this.props.options ? "dropdown-selection-hidden" : "dropdown-selection"} style={this.props.optionHeight ? { height: this.props.optionHeight } : {}}
                    onMouseOver={() => this.mouseOverOptions = true}
                    onMouseOut={() => this.mouseOverOptions = false}>
                    {
                        this.props.options
                            ? (
                                this.props.optionsParser
                                    ? this.props.optionsParser(this.props.options, this.handleOptionClick.bind(this))
                                    : this.props.options.map((item: string, i: number) => {
                                        let keyValuePair = item.split('|');
                                        let value = keyValuePair[0];
                                        let text = keyValuePair.length === 2 ? keyValuePair[1] : value;
                                        return (
                                            <div key={i} onClick={() => this.handleOptionClick(value)}
                                                className={value === this.props.value ? "dropdown-option-selected" : "dropdown-option"}>
                                                {text}
                                            </div>);
                                    })
                            )
                            : null
                    }
                </div>
            </div>);
    }
}
