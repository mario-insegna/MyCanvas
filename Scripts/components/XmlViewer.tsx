// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { Fetcher } from "../Fetcher";
import { ClassicButton } from "./ClassicButton";

interface XmlViewerRefs {
    modal?: Modal;
    image?: HTMLImageElement;
    anchor?: HTMLAnchorElement;
}
interface XmlViewerState {
    xml?: string;
    wrap?: boolean;
}
export class XmlViewer extends React.Component<EditorPropsBase, XmlViewerState> {
    objs: XmlViewerRefs = {};
    constructor() {
        super();
        this.state = {
            xml: "",
            wrap: true
        }
    }
    componentDidMount() {
        this.refresh();
    }
    handleWrapChange() {
        this.setState({
            wrap: !this.state.wrap
        });
    }
    refresh() {
        if (this.objs.image) this.objs.image.src = "../scripts/fine-uploader/processing.gif";

        let tmpXml = this.props.applicationScope.myCanvasEditor.getTemporaryXml();
        this.setState({
            xml: tmpXml
        });

        this.getUrl(tmpXml, "jpg")
            .then((data: any) => {
                if (data.path) this.objs.image.src = `/Editor/GetFileByPath/?path=${data.path}&file=image.jpg`;
            })
            .catch((error: any) => {
                console.log(error);
            });

    }
    getUrl(xml: string, format: string) {
        return Fetcher.postJson("/Editor/CreateFilePathByXml",
        {
            xml: xml,
            url: this.props.applicationScope.projectsUrls.EditorUrl,
            format: format
        });
    }
    handleClick() {
        this.getUrl(this.state.xml, "pdf")
            .then((data: any) => {
                if (data.path) {
                    this.objs.anchor.href = `/Editor/GetFileByPath/?path=${data.path}&file=image.pdf`;
                    this.objs.anchor.click();
                }
            })
            .catch((error: any) => {
                console.log(error);
            });
    }
    render() {
        const styleImg: React.CSSProperties = {
            maxWidth: `72px`,
            maxHeight: `51px`,
            float: `right`
        };
        const styleClear: React.CSSProperties = {
            clear: `both`
        };
        return (
            <Modal dimension={Dimension.Large} useUndoRedo={false} ref={(x: Modal) => { this.objs.modal = x }} title="XML Viewer" applicationScope={this.props.applicationScope}>
                <div>
                    <input type="checkbox" checked={this.state.wrap} onChange={this.handleWrapChange.bind(this)} /> Wrap text
                    <br />
                    <textarea className={`textarea-code ${this.state.wrap ? "" : "nowrap"}`} readOnly={true} value={this.state.xml ? this.state.xml : ""} cols={111} rows={33}></textarea>
                    <br />
                    <img style={styleImg} className="panel" ref={(x: HTMLImageElement) => { this.objs.image = x }} alt="" />
                    <br />
                    <ClassicButton text={"Download PDF"} enabled={true} onClick={this.handleClick.bind(this)} />
                    <a ref={(x: HTMLAnchorElement) => { this.objs.anchor = x }}></a>
                    <div style={styleClear} />
                </div>
            </Modal>);
    }
}
