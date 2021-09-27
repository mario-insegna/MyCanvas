// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import { CollapseItem } from "../components/CollapseItem";
import { EditorPropsBase } from "../MyCanvasEditor";
import * as React from "react";

interface TreePanelProps {
    source: TreePanelNode[];
    levels: number;
    editable?: boolean;
    newNodeLabel?: string;
    horizontalLayout?: boolean;
    onSelectedNodeChanged: (node: TreePanelNode, silently: boolean) => void;
}
interface TreePanelRefs {
    treePanelNodes?: TreePanelNode[];
}
export class TreePanel extends React.Component<TreePanelProps, {}> {
    objs: TreePanelRefs = { treePanelNodes: new Array<TreePanelNode>() };
    setSelectedNode(node: TreePanelNode, silently: boolean) {
        node.setSelected(true);
        if (this.props.onSelectedNodeChanged) {
            this.props.onSelectedNodeChanged(node, silently);
        }
    }
    setNodeByTheme(themeId: number) {
        let treepanel = this.objs.treePanelNodes.find((x: any) => x.props.idTheme === themeId);
        if (treepanel) {
            this.openNode(treepanel);
            this.setSelectedNode(treepanel, false);
        }
    }
    private openNode(node: TreePanelNode) {
        if (node) {
            if (node.collapseItem) node.collapseItem.collapse(false);
            if (node.props.level && node.props.parentId) {
                let treepanel: TreePanelNode = this.objs.treePanelNodes.find((x: any) => x.props.level === node.props.level - 1 && x.props.tag === node.props.parentId.toString());
                this.openNode(treepanel);
            }
        }
    }
    render() {
        return (
            <div className={this.props.horizontalLayout ? "tree-panel-horizontal" : "tree-panel"}>
                {this.props.source}
            </div>);
    }
}

interface TreePanelNodeProps extends EditorPropsBase {
    parentId?: number;
    key?: number;
    treePanel: TreePanel;
    level: number;
    name: string;
    tag: string;
    idTheme?: number;
    subNodesSource: any;
    sourceParser: (source: any, treePanel: TreePanel, level: number) => TreePanelNode[];
    onNodeAdded?: (node: VirtualTreePanelNode) => void;
    onNodeRemoved?: (node: TreePanelNode) => void;
}
interface TreePanelNodeState {
    subNodes?: TreePanelNode[];
    leavesCount?: number;
    loaded?: boolean;
    selected?: boolean;
    removed?: boolean;
    adding?: boolean;
}
export class TreePanelNode extends React.Component<TreePanelNodeProps, TreePanelNodeState> {
    public collapseItem: CollapseItem;
    constructor() {
        super();
        this.state = {
            subNodes: null,
            leavesCount: null,
            loaded: false,
            selected: false,
            removed: false,
            adding: false
        };
    }
    handleClick() {
        this.props.treePanel.setSelectedNode(this, false);
    }
    handleAddClick() {
        this.setState({ adding: true });
    }

    handleRemoveClick() {
        if (confirm(`Are you sure you want to remove all ${this.props.name} galleries from MyCanvas?`)) {
            this.setState({ removed: true });
            this.props.onNodeRemoved(this);
        }

    }
    completedAdding(node: VirtualTreePanelNode) {
        this.props.treePanel.setSelectedNode(this.props.treePanel.objs.treePanelNodes.find(x => x && x.props.name === node.state.name), true);
        this.setState({ adding: false });
    }
    setSelected(selected: boolean) {
        if (selected) {
            let selectedNode: TreePanelNode = this.props.treePanel.objs.treePanelNodes.find(x => x && x.state.selected);
            if (selectedNode) {
                selectedNode.setSelected(false);
            }
        }

        this.setState({ selected: selected });
    }
    setSubNodes(subNodes: TreePanelNode[]) {
        this.setState({ subNodes: subNodes });
    }
    setLeavesCount(leavesCount: number) {
        this.setState({ leavesCount: leavesCount });
    }
    componentDidMount() {
        this.setState({
            subNodes: this.props.sourceParser ? this.props.sourceParser(this.props.subNodesSource, this.props.treePanel, this.props.level) : null
        });
    }
    render(): JSX.Element {
        return (
            !this.state.removed
                ?
                <div className="node">
                    <CollapseItem ref={(x: CollapseItem) => this.collapseItem = x} hideToggler={!this.state.subNodes || this.state.subNodes.length === 0}
                        header={
                            <div>
                                <div className={this.state.selected ? "item selected" : "item"} onClick={this.handleClick.bind(this)}>                                  
                                    <span className="icon-folder"></span>
                                    <div className="name">{this.props.name}</div>
                                    <div className="count">{this.state.leavesCount ? "(" + this.state.leavesCount + ")" : null}</div>
                                </div>
                                <div className="actions">
                                    {this.props.treePanel.props.editable && this.props.level < this.props.treePanel.props.levels ? <button onClick={this.handleAddClick.bind(this)}>+</button> : null}
                                    {this.props.treePanel.props.editable && this.props.level > 0 ? <span style={{fontSize: "22px"}}className="icon-trash" onClick={this.handleRemoveClick.bind(this)}></span> : null}
                                </div>
                            </div>
                        }
                        body={
                            <div className="subnode-list">
                                {this.props.treePanel.props.editable && this.state.adding
                                    ? <VirtualTreePanelNode parentNode={this} onNodeRenamed={this.props.onNodeAdded} applicationScope={this.props.applicationScope} />
                                    : null}
                                {this.state.subNodes}
                            </div>
                        } />
                </div>
                : null
        );
    }
}

interface VirtualTreePanelNodeProps extends EditorPropsBase {
    parentNode: TreePanelNode;
    onNodeRenamed?: (node: VirtualTreePanelNode) => void;
}
interface VirtualTreePanelNodeState {
    editting?: boolean;
    name?: string;
}
export class VirtualTreePanelNode extends React.Component<VirtualTreePanelNodeProps, VirtualTreePanelNodeState> {
    constructor() {
        super();
        this.state = {
            editting: true,
            name: ''
        };
        this.clear = this.clear.bind(this);
    }
    clear() {
        this.props.parentNode.completedAdding(this);
        this.setState({
            editting: true,
            name: ''
        });
    }
    handleNameConfirmed() {
        this.setState({ editting: false });
        this.props.onNodeRenamed(this);
    }
    handleNameChanged(uiEvent: UIEvent) {
        this.setState({ name: (uiEvent.target as HTMLInputElement).value });
    }
    render(): JSX.Element {
        return (
            <div className="node">
                <div className="item">
                    <img src={`${this.props.applicationScope.projectsUrls.RootUrl}/content/images/folder.png`} />
                    <div className="name">
                        {this.state.editting
                            ? <input type="text" value={this.state.name} onChange={this.handleNameChanged.bind(this)} />
                            : <span>{this.state.name} <small>saving...</small></span>}
                    </div>
                </div>
                <div className="actions">
                    {this.state.editting ? <button onClick={this.handleNameConfirmed.bind(this)}>Ok</button> : null}
                </div>
            </div>
        );
    }
}
