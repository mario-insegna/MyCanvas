// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import "./Polyfills";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Desktop } from "./components/Desktop";
import { ProjectBuilder } from "./components/ProjectBuilder";
import { ApplicationScope } from "./ApplicationScope";
import { Subscribers, EvenType } from "./Subscribers";

var projectUrls = JSON.parse(document.getElementById("main").getAttribute("data-projectUrls"));
var projectParameters = JSON.parse(document.getElementById("main").getAttribute("data-projectParameters"));
var frameWindow: any;
var editor: any;
var application: Desktop;
var applicationScope: ApplicationScope = new ApplicationScope(projectUrls, projectParameters);

// declare embeed window variable as MyWindow.
declare var window: MyWindow;

if (applicationScope.projectParameters.ProjectId === 0) {
    // Generates a new project
    ReactDOM.render(<ProjectBuilder applicationScope={applicationScope} />,
        document.getElementById("main"));

} else {
    application = (ReactDOM.render(
        <Desktop onEditorLoaded={GetEditor} applicationScope={applicationScope}/>,
        document.getElementById("main")
    ) as Desktop);
}

ApplicationScope.setDesktopApplication(application);

function GetEditor() {
    try {
        if (document.getElementsByTagName("iframe").length > 0) {
            if (document.getElementsByTagName("iframe")[0].src !== "") {
                frameWindow = document.getElementsByTagName("iframe")[0].contentWindow;
                frameWindow.GetEditor(EditorLoaded);
            }
        }
    } catch (err) {}
}

function EditorLoaded(jsInterface:any) {
    editor = frameWindow.editorObject;
    editor.AddListener("SelectedFrameChanged");
    editor.AddListener("TextSelectionChanged");
    editor.AddListener("UndoStackChanged");
    editor.AddListener("ZoomAfterChange");
    editor.AddListener("PageCanvasScrollChanged");
    editor.AddListener("FrameMoveInProgress");
    editor.AddListener("FrameMoved");
    
    applicationScope.myCanvasEditor.setEditor(editor, applicationScope.projectParameters.Editor_Workspaceid);
}

window.OnEditorEvent = function (type: string, targetID: string) {
    switch (type) {
        case "DocumentFullyLoaded":
            Subscribers.UpdateSubscribers(EvenType.EditorDocumentLoaded);
            break;
        case "SelectedFrameChanged":
            application.setSelectedFrame(targetID);
            break;
        case "TextSelectionChanged":
            application.setSelectedText(targetID);
            Subscribers.UpdateSubscribers(EvenType.TextSelectionChanged);
        case "UndoStackChanged":
            Subscribers.UpdateSubscribers(EvenType.UndoStackChanged);
            break;
        case "FrameMoveInProgress":
            Subscribers.UpdateSubscribers(EvenType.FrameMoveInProgress);
            Subscribers.UpdateSubscribers(EvenType.AdditionalDirtyStateChanged);
            break;
        case "ZoomAfterChange":
        case "PageCanvasScrollChanged":
        case "FrameMoved":
            Subscribers.UpdateSubscribers(EvenType.RenderChanged);
			break;
    }
}    

window.onresize = function() {
    Subscribers.UpdateSubscribers(EvenType.RenderChanged);
}
