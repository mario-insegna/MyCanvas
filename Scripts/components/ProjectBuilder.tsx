// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Fetcher } from "../Fetcher";

interface IProps extends EditorPropsBase { }
interface IState {
    activeproject?: boolean;
    status?: string;
    counter?: number;
}
export class ProjectBuilder extends React.Component<IProps, IState> {
    constructor() {
        super();
        this.state = { activeproject: false, status: "", counter: 1 };
    }

    componentDidMount(): void {

        this.setState({ status: "Project is being built.." });

        Fetcher.postJson("/EditorApi/Project/BuildNewProject",
            {
                Name: this.props.applicationScope.projectParameters.Name,
                ProductId: this.props.applicationScope.projectParameters.ProductId,
                ThemeId: this.props.applicationScope.projectParameters.ThemeId,
                CustomData: this.props.applicationScope.projectParameters.CustomData
            })
            .then((projectid: any) => {
                this.checkForProject(projectid);
            });
    }

    checkForProject(projectId: any) {

        Fetcher.getJson("/EditorApi/Project/CheckForProject", [
                ["projectId", projectId],
                ["counter", this.state.counter]
            ])
            .then((active: any) => {
                this.setState({ activeproject: active, counter: this.state.counter + 1 });
                if (active) {
                    // redirect to the editor when project is ready
                    window.location.replace(`${this.props.applicationScope.projectsUrls.RootUrl}?fp=${projectId}&preview=0`);
                } else {
                    this.checkForProject(projectId);
                }
            })
            .catch((error: any) => {
                this.setState({ status: `Error: ${error}. Try number ${this.state.counter}` });
            });
    }

    render() {
        return (
            <div>{this.state.status}</div>
        );
    }
}
