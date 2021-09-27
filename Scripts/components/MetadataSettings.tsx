// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { EditorPropsBase } from "../MyCanvasEditor";
import { Modal, Dimension } from "./Modal";
import { DropDown } from "./DropDown";
import { Subscribers, EvenType } from "../Subscribers";

interface MetadataSettingsRefs {
    modal?: Modal;
}
interface MetadataSettingsState {
    isEmbellishment?: boolean;
    isResynchronizable?: boolean;
	isRemovable?: boolean;
    index?: string;
    assetId?: string;
    databaseId?: string;
    imageId?: string;
    eventType?: string;
    isOriginal?: boolean;
    personId?: string;
    spouseId?: string;
    type?: string;
    text?: string;
    treeId?: string;
    templateTag?: string;
}
export class MetadataSettings extends React.Component<EditorPropsBase, MetadataSettingsState> {
    objs: MetadataSettingsRefs = {};
    constructor() {
        super();
        Subscribers.AddSubscriber("MetadataSettings", EvenType.EditorDocumentLoaded, this);
        this.state = {
            isEmbellishment: false,
            isResynchronizable: false,
            isRemovable: false,
            index: "",
            assetId: "",
            databaseId: "",
            imageId: "",
            eventType: "",
            isOriginal: false,
            personId: "",
            spouseId: "",
            type: "",
            text: "",
            treeId: "",
            templateTag: ""
        }
    }
    handleIsEmbellishmentChanged(uiEvent: UIEvent) {
        this.setState({ isEmbellishment: (uiEvent.target as HTMLInputElement).checked });
        this.props.applicationScope.myCanvasEditor.toggleSelectedFrameMetadataIsEmbellishment();
    }
    handleIsResynchronizableChanged(uiEvent: UIEvent) {
        this.setState({ isResynchronizable: (uiEvent.target as HTMLInputElement).checked });
        this.props.applicationScope.myCanvasEditor.toggleSelectedFrameMetadataIsResynchronizable();
    }
	handleIsRemovableChanged(uiEvent: UIEvent) {
		this.setState({ isRemovable: (uiEvent.target as HTMLInputElement).checked });
		this.props.applicationScope.myCanvasEditor.toggleSelectedFrameMetadataIsRemovable();
	}
	handleIndexChanged(uiEvent: UIEvent) {
		let index = (uiEvent.target as HTMLInputElement).value;
		this.setState({ index: index });
		this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataIndex(index);
	}
	handleAssetIdChanged(uiEvent: UIEvent) {
        let assetId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ assetId: assetId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataAssetId(assetId);
    }
    handleDatabaseIdChanged(uiEvent: UIEvent) {
        let databaseId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ databaseId: databaseId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataDatabaseId(databaseId);
    }
    handleImageIdChanged(uiEvent: UIEvent) {
        let imageId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ imageId: imageId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataImageId(imageId);
    }
    handleEventTypeChanged(uiEvent: UIEvent) {
        let eventType = (uiEvent.target as HTMLInputElement).value;
        this.setState({ eventType: eventType });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataEventType(eventType);
    }
    handleIsOriginalChanged(uiEvent: UIEvent) {
        this.setState({ isOriginal: (uiEvent.target as HTMLInputElement).checked });
        this.props.applicationScope.myCanvasEditor.toggleSelectedFrameMetadataIsOriginal();
    }
    handlePersonIdChanged(uiEvent: UIEvent) {
        let personId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ personId: personId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataPersonId(personId);
    }
    handleSpouseIdChanged(uiEvent: UIEvent) {
        let spouseId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ spouseId: spouseId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataSpouseId(spouseId);
    }
    handleTypeChanged(value: string) {
        this.setState({ type: value });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataType(value);
    }
    handleTextChanged(uiEvent: UIEvent) {
        let text = (uiEvent.target as HTMLInputElement).value;
        this.setState({ text: text });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataText(text);
    }
    handleTreeIdChanged(uiEvent: UIEvent) {
        let treeId = (uiEvent.target as HTMLInputElement).value;
        this.setState({ treeId: treeId });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataTreeId(treeId);
    }
    handleTemplateTagChanged(uiEvent: UIEvent) {
        let templateTag = (uiEvent.target as HTMLInputElement).value;
        this.setState({ templateTag: templateTag });
        this.props.applicationScope.myCanvasEditor.setSelectedFrameMetadataTemplateTag(templateTag);
    }
    componentDidMount() {
        this.refresh();
    }
    componentWillUpdate(nextProps: EditorPropsBase, nextState: MetadataSettingsState) {
        let metadata = this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata();
        let currentIsEmbellishment = metadata.client.embellishment;
        let currentIsResynchronizable = metadata.client.sync;
		let currentIsRemovable = metadata.client.rmvbl;
        let currentIndex = this.safeString(metadata.client.ndx);
        let currentAssetId = this.safeString(metadata.src.a);
        let currentDatabaseId = this.safeString(metadata.src.db);
        let currentImageId = this.safeString(metadata.src.img);
        let currentEventType = this.safeString(metadata.src.e);
        let currentIsOriginal = metadata.src.o;
        let currentPersonId = this.safeString(metadata.src.p);
        let currentSpouseId = this.safeString(metadata.src.sp);
        let currentType = this.safeString(metadata.src.t);
        let currentText = this.safeString(metadata.src.txt);
        let currentTreeId = this.safeString(metadata.src.tr);
        let currentTemplateTag = this.safeString(metadata.tt);
        if (currentIsEmbellishment !== nextState.isEmbellishment ||
            currentIsResynchronizable !== nextState.isResynchronizable ||
			currentIsRemovable !== nextState.isRemovable ||
            currentIndex !== this.safeString(nextState.index) ||
            currentAssetId !== this.safeString(nextState.assetId) ||
            currentDatabaseId !== this.safeString(nextState.databaseId) ||
            currentImageId !== this.safeString(nextState.imageId) ||
            currentEventType !== this.safeString(nextState.eventType) ||
            currentIsOriginal !== nextState.isOriginal ||
            currentPersonId !== this.safeString(nextState.personId) ||
            currentSpouseId !== this.safeString(nextState.spouseId) ||
            currentType !== this.safeString(nextState.type) ||
            currentText !== this.safeString(nextState.text) ||
            currentTreeId !== this.safeString(nextState.treeId) ||
            currentTemplateTag !== this.safeString(nextState.templateTag)) {
            this.setState({
                isEmbellishment: currentIsEmbellishment,
                isResynchronizable: currentIsResynchronizable,
				isRemovable: currentIsRemovable,
                index: currentIndex,
                assetId: currentAssetId,
                databaseId: currentDatabaseId,
                imageId: currentImageId,
                eventType: currentEventType,
                isOriginal: currentIsOriginal,
                personId: currentPersonId,
                spouseId: currentSpouseId,
                type: currentType,
                text: currentText,
                treeId: currentTreeId,
                templateTag: currentTemplateTag
            });
        }
    }
    refresh() {
        this.setState({
            isEmbellishment: this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.embellishment,
            isResynchronizable: this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.sync,
			isRemovable: this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.rmvbl,
            index: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().client.ndx),
            assetId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.a),
            databaseId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.db),
            imageId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.img),
            eventType: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.e),
            isOriginal: this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.o,
            personId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.p),
            spouseId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.sp),
            type: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.t),
            text: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.txt),
            treeId: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().src.tr),
            templateTag: this.safeString(this.props.applicationScope.myCanvasEditor.getSelectedFrameMetadata().tt)
        });
    }
    private safeString(input: string) {
        return input ? input : "";
    }
    render() {
        return (
            <Modal dimension={Dimension.Large} useUndoRedo={true} ref={(x: Modal) => { this.objs.modal = x }} title="Metadata Settings" applicationScope={this.props.applicationScope}>
				<div className="metadata-settings">
					<strong>Client</strong>
					<div className="field-group">
						<div className="field-label">Is Embellishment</div>
						<div className="field-control">
							<input type="checkbox" onChange={this.handleIsEmbellishmentChanged.bind(this)} checked={this.state.isEmbellishment} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Is Resynchronizable</div>
						<div className="field-control">
							<input type="checkbox" onChange={this.handleIsResynchronizableChanged.bind(this)} checked={this.state.isResynchronizable} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Is Removable</div>
						<div className="field-control">
							<input type="checkbox" onChange={this.handleIsRemovableChanged.bind(this)} checked={this.state.isRemovable} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Index</div>
						<div className="field-control">
							<input type="text" onChange={this.handleIndexChanged.bind(this)} value={this.state.index} />
						</div>
					</div>
					<strong>Source Info</strong>
					<div className="field-group">
						<div className="field-label">Asset Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handleAssetIdChanged.bind(this)} value={this.state.assetId} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Database Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handleDatabaseIdChanged.bind(this)} value={this.state.databaseId} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Image Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handleImageIdChanged.bind(this)} value={this.state.imageId} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Event Type</div>
						<div className="field-control">
							<input type="text" onChange={this.handleEventTypeChanged.bind(this)} value={this.state.eventType} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">IsOriginal</div>
						<div className="field-control">
							<input type="checkbox" onChange={this.handleIsOriginalChanged.bind(this)} checked={this.state.isOriginal} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Person Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handlePersonIdChanged.bind(this)} value={this.state.personId} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Spouse Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handleSpouseIdChanged.bind(this)} value={this.state.spouseId} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Type</div>
						<div className="field-control">
							<DropDown options={this.types} onChange={this.handleTypeChanged.bind(this)} value={this.state.type} width={150} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Text</div>
						<div className="field-control">
							<input type="text" onChange={this.handleTextChanged.bind(this)} value={this.state.text} />
						</div>
					</div>
					<div className="field-group">
						<div className="field-label">Tree Id</div>
						<div className="field-control">
							<input type="text" onChange={this.handleTreeIdChanged.bind(this)} value={this.state.treeId} />
						</div>
					</div>
					<strong>Template Tag</strong>
					<div className="field-group">
						<div className="field-label">Tag</div>
						<div className="field-control">
							<input type="text" onChange={this.handleTemplateTagChanged.bind(this)} value={this.state.templateTag} />
						</div>
					</div>
                </div>
            </Modal>);
    }
    types: Array<string> = ["0|Comment", "1|Event", "2|Image", "3|ImagePerson", "4|Note", "5|Person", "6|Record", "7|Story", "8|Other"];
}
