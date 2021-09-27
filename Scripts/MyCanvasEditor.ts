import { Subscribers, EvenType } from "./Subscribers";
import { ApplicationScope } from "./ApplicationScope";
import { ImageUsage } from "./ImageUsage";

export interface EditorPropsBase {
    applicationScope: ApplicationScope;
}

enum ChiliObjectTypes {
    Unknown,
    TextFrame,
    ImageFrame,
    LineFrame,
    RectangleFrame,
    TextSelection
}

/**
 * MyCanvasEditor is the chili editor wrapper with functions that simplifies chili editor calls, strings descriptors and so on.
 * Every user-level single action that requires multiple calls to chili editor should be included here as a single function as simple to the caller as posible.
 */
class MyCanvasEditor {

    /////// CONSTANTS

    readonly backgroundFrameName = "mycanvas_backgroundFrame";
    private readonly documentSelector = "document";
    private readonly selectedFrameSelector = "document.selectedFrame";
    private readonly selectedTextSelector = "document.selectedText";
    private readonly documentPagesSelector = "document.pages";
    private readonly documentPageFramesSelector = "document.pages[0].frames";
    private readonly backgroundFrameSelector = `${this.documentPageFramesSelector}[${this.backgroundFrameName}]`;
    private readonly defaultResolution = 300;

    /////// PROPERTIES

    /**
     * Chili editor. This is actually the one loaded from the chili iframe. The interface just let us know which methods and properties are exposed.
     */
    private editor: ChiliEditor;

    private editorWorkspaceid: string;

    /////// PUBLIC

    /**
     * Applies a shape to the selected image frame
     * @param item: index shape
     * @param frameid: frame id
     */
    applyShape(item: string, frameid: string) {
        if (this.editor) {
            let shapePath = this.editor.GetObject(`document.workSpace.defaultShapes[${item}]`);
            let selector = `document.allFrames[${frameid}]`;
            let frame = this.editor.GetObject(selector);
            this.editor.ExecuteFunction(selector, "SetPaths", shapePath.paths);
            this.editor.SetProperty(selector, "width", this.parseInchesValue(frame.width));
            this.editor.SetProperty(selector, "height", this.parseInchesValue(frame.height));
        }
    }

    /**
     * Use the mouse cursor when hovering over text frames
     * @param value
     */
    autoTextCursor(value: boolean) {
        if (this.editor) {
            this.editor.SetProperty("document.viewPreferences", "autoTextCursor", value);
        }
    }

    /**
     * Begings or undo changes group.
     * @param name name of the action that is visible for the user
     */
    beginUndoableOperations(name: string) {
        this.editor.ExecuteFunction("document.undoManager", "BeginUndoableOperations", name);
    }

    /**
     * Sets the frame index to its maximum.
     */
    bringSelectedFrameToFront() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            this.editor.SetProperty(this.selectedFrameSelector, "index", "9999");
        }
    }

    /**
     * Clear all selections
     */
    clearSelectedFrames() {
        if (this.editor)
            this.editor.ExecuteFunction("document.selectedFrames", "Clear");
    }

    /**
     * Clear Undo/Redo stack
     */
    clearUndoManager() {
        if (this.editor)
            this.editor.ExecuteFunction("document.undoManager", "ClearUndoStack");
    }

	/**
	 * Generates frames with metadata
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 * @param frameType
	 * @param textFlow
	 * @param person
	 */
	public createFrameOnDemand(x: string, y: string, width: string, height: string, frameType: string, textFlow: string, person: string, index?: string): any {
		let frame = this.editor.ExecuteFunction(this.documentPageFramesSelector, "Add", frameType, x, y, width, height);

		if (frameType === "line") return;

		let selector = `document.allFrames[${frame.id}]`;

		let metadata: AssetMetadata = {};
		metadata.client = {
			embellishment: false,
			sync: person !== "",
			ndx: index
		}
		metadata.src = {
			a: "",
			db: "",
			img: "",
			e: "",
			o: false,
			p: "",
			sp: "",
			t: frameType === "text" ? "5" : "3",
			txt: textFlow,
			tr: ""
		}
		metadata.tt = person;

        if (frameType === "text") this.editor.ExecuteFunction(selector, "ImportTextFlow", textFlow);

	    if (frameType === "image") this.editor.SetProperty(selector, "hasBorder", "true");

		this.setFrameMetadata(selector, metadata);
	}

	/**
	 * Creates a default image frame
	 */
    createDefaultImageFrame() {
        let bounds = new ChiliBounds();
        bounds.x = "0.2in";
        bounds.y = "0.4in";
        bounds.width = "4in";
        bounds.height = "2in";
        this.createFrame(bounds, "image");
    }

    /**
     * Creates a default line frame
     */
    createDefaultLineFrame() {
        let bounds = new ChiliBounds();
        bounds.x = "0.2in";
        bounds.y = "0.4in";
        bounds.width = "4in";
        bounds.height = "2in";
        this.createFrame(bounds, "line");
    }

    /**
     * Creates a default rectangle frame
     */
    createDefaultRectangleFrame() {
        let bounds = new ChiliBounds();
        bounds.x = "0.2in";
        bounds.y = "0.4in";
        bounds.width = "4in";
        bounds.height = "2in";
        this.createFrame(bounds, "rectangle");
    }

    /**
     * Creates a default text frame
     */
    createDefaultTextFrame() {
        let bounds = new ChiliBounds();
        bounds.x = "0.2in";
        bounds.y = "0.4in";
        bounds.width = "4in";
        bounds.height = "2in";
        this.createFrame(bounds, "text");
    }

    /**
     * Creates a new image frame.
     * @param id image id
     * @param name image name
     * @param remoteUrl image url
     * @param thumb image thumb url
     * @param highResPdfUrl image high resolution pdf url
     * @param x image x position
     * @param y image y position
     * @param width image width
     * @param height image height
     * @param resolution image resolution
     * @param fileSize image file size
     */
    createImageFrame(id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, x: number, y: number, width: number, height: number, fileSize: string, assetMetadata: AssetMetadata) {
        let chiliBounds = this.createFrameBounds(x, y, width, height);
        let replace = false;

        let frameOnDrop: any = assetMetadata.client.embellishment ? null : this.getSelectedFrameOnDrop(x, y, "image");
        if (frameOnDrop) {
            if (confirm("Replace the content?")) {
                replace = true;
            }
        }

        let imageFrame = replace ? frameOnDrop : this.createFrame(chiliBounds, "image");

        this.editor.SetProperty(`${this.documentPageFramesSelector}[${imageFrame.id}]`, "fitMode", assetMetadata.client.embellishment ? "stretch" : "proportional_outside");

        this.setSelectedFrameMetadata(assetMetadata);

        this.clearSelectedFrames();

        this.setSelectedImage(`${this.documentPageFramesSelector}[${imageFrame.id}]`, id, name, remoteUrl, thumb, highResPdfUrl, width, height, fileSize);
    }

    /**
     * Creates a new image frame.
     * @param id text id
     * @param text text content
     * @param x image x position
     * @param y image y position
     * @param isLocked text replacement for restricted covers
     */
    createTextFrame(id: string, text: string, x: number, y: number, width: number, assetMetadata: AssetMetadata, isLocked?: boolean) {
        if (isLocked) {
            let frameOnDrop = this.getSelectedFrameOnDrop(x, y, "text");
            if (frameOnDrop) {
                let textflow = this.buildTextFlowByFrame(frameOnDrop, text);
                this.setSelectedTextFrameText(textflow, frameOnDrop);
                this.setSelectedFrameMetadata(assetMetadata, frameOnDrop);
                Subscribers.UpdateSubscribers(EvenType.TextSelectionChanged);
            }
            return;
        }
        let chiliBounds = this.createFrameBounds(x, y, width, 20);
        this.createFrame(chiliBounds, "text");
        this.editor.SetProperty(this.selectedFrameSelector, "autoGrowFrame", "true");
        this.setSelectedFrameMetadata(assetMetadata);
        this.setSelectedFrameText(text);
        this.clearSelectedFrames();
    }

    /**
     * Removes the selected frame from the canvas.
     */
    deleteSelectedFrame() {
        let frame = this.getSelectedFrame();
        if (frame.externalName) {
            ImageUsage.deleteImage(frame.externalName);
        }
        this.editor.ExecuteFunction(`${this.documentPageFramesSelector}[${frame.id}]`, "Delete");
    }

    /**
     * Duplicate selected frame
     */
    duplicateSelectedFrame() {
        this.editor.ExecuteFunction("document.selectedFrames", "Copy");
        this.editor.ExecuteFunction("document.layers[New Layer]", "Select");
        this.editor.ExecuteFunction("document", "PasteFrames");
        this.clearSelectedFrames();
    }

    /**
     * Ends or undo changes group.
     */
    endUndoableOperations() {
        this.editor.ExecuteFunction("document.undoManager.currentOperationGroup", "EndOperations");
    }

    /**
     * Gets the document background color.
     */
    getBackgroundFrameFillColor() {
        if (this.editor && this.editor.GetObject(this.documentPagesSelector) !== null) {
            return this.getFrameFillColor(this.backgroundFrameSelector);
        }
    }

    /**
     * Gets the document background color.
     */
    getBackgroundFrameFitPoint() {
        if (this.editor && this.editor.GetObject(this.documentPagesSelector) !== null) {
            let backgroundFrame = this.editor.GetObject(this.backgroundFrameSelector);
            if (backgroundFrame != null) {
                return backgroundFrame.fitPoint;
            }
        }
        return "";
    }

    /**
     * Gets the document background opacity.
     */
    getBackgroundFrameOpacity() {
        if (this.editor && this.editor.GetObject(this.documentPagesSelector) !== null) {
            return this.getFrameOpacity(this.backgroundFrameSelector);
        }
    }

	/**
	 * Gets dirty state for current document
	 */
	getDirtyState(): boolean {
		return this.editor
			? this.editor.GetDirtyState()
			: false;
	}

    /**
     * Gets Chili document metrics in inches (regardless of zoom)
     */
    public getDocMetrics() {
        let metrics = { width: 0, height: 0, bleedTop: 0, bleedBottom: 0, bleedLeft: 0, bleedRight: 0 };
        let frame = this.editor.GetObject(this.documentSelector);
        if (frame) metrics = {
            width: this.parseInchesValue(frame.width),
            height: this.parseInchesValue(frame.height),
            bleedTop: this.parseInchesValue(frame.bleedTop),
            bleedBottom: this.parseInchesValue(frame.bleedBottom),
            bleedLeft: this.parseInchesValue(frame.bleedLeft),
            bleedRight: this.parseInchesValue(frame.bleedRight),
        };
        return metrics;
    }

    /**
    * Gets the background metrics in pixels. (depends on zoom)
    */
    getDocumentMetrics() {
        this.createBackgroundFrameIfNeeded();

        return this.getFrameMetrics(this.backgroundFrameSelector);
    }

    /**
     * Get zoom level of the document
     */
    getDocumentZoom() {
        return this.editor
            ? this.editor.GetObject("document.zoom")
            : 0;
    }

    /**
     * Returns the frame based on a given Id
     * @param frameId
     */
    getFrameById(frameid: string) {
        let selector = `document.allFrames[${frameid}]`;
        return this.editor.GetObject(selector);
    }

    /**
     * Return metrics from selected image frame in inches
     */
    getImageBox() {
        let box = { imgX: 0, imgY: 0, imgWidth: 0, imgHeight: 0, frameWidth: 0, frameHeight: 0, frameId: "" };
        if (this.editor) {
            let frame = this.getSelectedFrame();
            box = {
                imgX: this.parseInchesValue(frame.imgX),
                imgY: this.parseInchesValue(frame.imgY),
                imgWidth: this.parseInchesValue(frame.imgWidth),
                imgHeight: this.parseInchesValue(frame.imgHeight),
                frameWidth: this.parseInchesValue(frame.width),
                frameHeight: this.parseInchesValue(frame.height),
                frameId: frame.id
            };
        }
        return box;
    }

    /**
     * Creates a new image frame.
     * @param x image x position
     * @param y image y position
     * @param width image width
     * @param height image height
     */
    getImageFramePreviewMetrics(x: number, y: number, width: number, height: number) {
        let chiliBounds = this.createFrameBounds(x, y, width, height);

        let metrics = this.getFrameMetrics(`${this.documentPageFramesSelector}[0]`);

        if (metrics) {
            let frameInchWidth = this.parseInchesValue(this.editor.GetObject(`${this.documentPageFramesSelector}[0]`).width);

            let ratio = metrics.width / frameInchWidth;

            return { top: 0, left: 0, width: this.parseInchesValue(chiliBounds.width) * ratio, height: this.parseInchesValue(chiliBounds.height) * ratio };
        } else {
            return { top: 0, left: 0, width: 100, height: 100 };
        }
    }

    /**
     * Returns canvas coordinates based on document position
     * @param clientX 
     * @param clientY 
     */
    getMousePosition(clientX: any, clientY: any): { page: number, docX: any, docY: any } {
        let position = { page: 0, docX: "0", docY: "0" };
        let mousePosition = position;
        if (this.editor) {
            mousePosition = this.editor.ExecuteFunction("document", "GetDocumentPositionForCanvasCoordinates", clientX, clientY);
        }
        position.page = mousePosition.page;
        position.docX = this.parseInchesValue(mousePosition.docX).toString();
        position.docY = this.parseInchesValue(mousePosition.docY).toString();
        return position;
    }

	/**
	 * Gets the string-base64 image from the canvas
	 */
	getPngSnapshot(): string {
		if (this.editor) {
			return this.editor.ExecuteFunction("document.pages[0].pageControl", "GetPNGSnapshot");
		}
		return "";
	}

	/**
	 * Get border color from selected frame
	 */
    getSelectedFrameBorderColor() {
        let selectedFrame = this.editor.GetObject(this.selectedFrameSelector + ".borderColor");
        return selectedFrame ? selectedFrame.htmlValue : "";
    }

    /**
     * Get border width from selected frame
     */
    getSelectedFrameBorderWidth() {
        let frame = this.getSelectedFrame();
        let def = "0";
        if (frame) {
            return frame.hasBorder === "true" ? frame.borderWidth : def;
        }
        return def;
    }

    /**
     * Gets the selected frame fill color.
     */
    getSelectedFrameFillColor() {
        return this.getFrameFillColor(this.selectedFrameSelector);
    }

    /**
     * Gets the selected frame opacity.
     */
    getSelectedFrameOpacity() {
        return this.getFrameOpacity(this.selectedFrameSelector);
    }

    /**
     * Gets the selected frame tag.
     */
    getSelectedFrameMetadata(): AssetMetadata {
        return this.getFrameMetadata(this.selectedFrameSelector);
    }


    getAllFramesMetadata(): any {
        return this.getAllFrameMetadata();
    }

    /**
     * Get metrics from current frame as [left, top, width, height]
     */
    getSelectedFrameMetrics() {
        return this.getFrameMetrics(this.selectedFrameSelector);
    }

    /**
     * Get the text inside the current text frame
     */
    getSelectedFrameText(frame?: any) {
        let text = { plain: "", formatted: "" };
        if (this.editor) {
			let selectedFrame = frame ? frame : this.getSelectedFrame();
	        let isFrame = this.editor.GetObject(this.selectedFrameSelector) != null;
            if (selectedFrame) {
				let selector = frame ? `${this.documentPageFramesSelector}[${frame.id}]` : isFrame ? this.selectedFrameSelector : `${this.selectedTextSelector}.frame`;
				text.plain = this.editor.ExecuteFunction(selector, "GetText", false, true);
				text.formatted = this.editor.ExecuteFunction(selector, "GetText", true, true);
            }
        }
        return text;
    }

    /**
     * Gets the selected frame type. Can be text frame, image frame, line frame or rectangle frame.
     */
    getSelectedFrameType() {
		let selectedFrame = this.getSelectedFrame();
	    let isFrame = this.editor.GetObject(this.selectedFrameSelector) != null;
        let frame = { type: ChiliObjectTypes.Unknown, id: ""};
        if (selectedFrame != null) {
            frame.id = selectedFrame.id;
            switch (selectedFrame.type) {
                case "text": 
                    frame.type = isFrame ? ChiliObjectTypes.TextFrame : ChiliObjectTypes.TextSelection;
                    break;
                case "image":
                    frame.type = ChiliObjectTypes.ImageFrame;
                    break;
                case "line":
                    frame.type = ChiliObjectTypes.LineFrame;
                    break;
                case "rectangle":
                    frame.type = ChiliObjectTypes.RectangleFrame;
                    break;
            }
        }
        return frame;
    }

    /**
     * get the current alignment
     */
    getSelectedTextAlignment() {
        let selectedTextObject = this.getTextSelectorObject("textFormat");
        return selectedTextObject ? selectedTextObject.textAlign : "";
    }

    /**
     * Get the current color
     */
    getSelectedTextColor() {
        let selectedTextObject = this.getTextSelectorObject("textFormat.color");
        return selectedTextObject ? selectedTextObject.htmlValue : "";
    }

    /**
     * Get the current font
     */
    getSelectedTextFont() {
        let selectedTextObject = this.getTextSelectorObject("textFormat.font");
        return selectedTextObject ? selectedTextObject.id : "";
    }

    /**
     * Get the current font size
     */
    getSelectedTextFontSize() {
        let selectedTextObject = this.getTextSelectorObject("textFormat");
        return selectedTextObject ? selectedTextObject.fontSize : "";
    }

    /**
     * Get the current underline
     */
    getSelectedTextUnderline() {
        let selectedTextObject = this.getTextSelectorObject("textFormat");
        return selectedTextObject ? selectedTextObject.underLine : "";
    }

    /**
    * Get the XML of the document that is open in the editor
    */
    getTemporaryXml() {
        if (this.editor) {
            return this.editor.ExecuteFunction("document", "GetTempXML");
        }
        return "";
    }

    /**
     * Return default maxlength for restricted covers text-frame
     */
    getTextFlowMaxLength() {
        return 30;
    }

    getUndoRedoStack() {
        let undoList = this.getUndoManagerUndoStack();
        let redoList = this.getUndoManagerRedoStack();
        return undoList.concat(redoList).filter((item: any) => this.getUndoManagerPredicate(item));
    }

    /**
     * Gets the filter for false positive items
     */
    getUndoManagerPredicate(item: any): boolean {
        return item.name !== "Item" && item.name !== "Change  Name" && item.name !== "Change Font Name" && item.name !== "Change Font Settings" && item.name !== "Delete ";
    }

    /**
     * Gets the stack of redo actions.
     */
    getUndoManagerRedoStack() {
        if (this.editor) {
            return this.editor.GetObject("doc.undoManager.redoStack");
        }

        return [];
    }

    /**
     * Gets the stack of undo actions.
     */
    getUndoManagerUndoStack() {
        if (this.editor) {
            return this.editor.GetObject("doc.undoManager.undoStack");
        }

        return [];
    }

    /**
     * Determines wheter the document has a background frame created or not.
     */
    hasBackgroundFrame() {
        if (this.editor) {
            return this.editor.GetObject(this.backgroundFrameSelector) != null;
        }

        return false;
    }

    /**
     * Detects wether the background frame has been flipped horizontally.
     */
    hasBackgroundFrameHorizontalFlip() {
        if (this.editor && this.editor.GetObject(this.documentPagesSelector) !== null) {
            return this.hasFrameHorizontalFlip(this.backgroundFrameSelector);
        }
    }

    /**
     * Detects wether there is a selected frame.
     */
    hasSelectedFrame() {
        let selectedFrame = this.getSelectedFrame();

        return selectedFrame != null;
    }

    /**
     * Detects wether the selected frame has dropped a shadow or not.
     */
    hasSelectedFrameDropShadow() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            return selectedFrame.hasDropShadow === "true";
        }
        return false;
    }

    /**
     * Detects wether the selected frame has been flipped horizontally.
     */
    hasSelectedFrameHorizontalFlip() {
        return this.hasFrameHorizontalFlip(this.selectedFrameSelector);
    }

    /**
     * Return true if a frame is locked
     * @param index
     */
    lockedFrame(key: any): boolean {
        if (!this.editor) return false;
        if (!key) {
            let selectedFrame = this.getSelectedFrame();
            if (!selectedFrame) return false;
            key = selectedFrame.id;
        }
        let constraints = this.editor.GetObject(`${this.documentPageFramesSelector}[${key}].frameConstraints`);
        return constraints.lockMoveHorizontal === "yes" &&
            constraints.lockMoveVertical === "yes" &&
            constraints.lockResizeHorizontal === "yes" &&
            constraints.lockResizeVertical === "yes" &&
            constraints.lockRotate === "yes";
    }

	/**
	 * Locks/Unlocks the document
	 */
    lockDocument(includeDeleteAndContent: boolean) {
        let value = "yes";
		if (this.editor) {
            let selector = `${this.documentSelector}.frameConstraints`;
            if (includeDeleteAndContent) {
                this.editor.SetProperty(selector, "lockDelete", value);
                this.editor.SetProperty(selector, "lockContent", value);
            }
            this.editor.SetProperty(selector, "lockMoveHorizontal", value);
            this.editor.SetProperty(selector, "lockMoveVertical", value);
            this.editor.SetProperty(selector, "lockResizeHorizontal", value);
            this.editor.SetProperty(selector, "lockResizeVertical", value);
            this.editor.SetProperty(selector, "lockRotate", value);
        }
    }

    /**
     * Decrements the frame index in one, preventing this to be moved behind the background frame if exists.
     */
    moveSelectedFrameBackwards() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            let backgroundFrame = this.editor.GetObject(this.backgroundFrameSelector);
            this.editor.SetProperty(this.selectedFrameSelector, "index", (selectedFrame.index > 1 ? selectedFrame.index - 1 : (backgroundFrame ? 1 : 0)).toString());
        }
    }

    /**
     * Increments the frame index in one.
     */
    moveSelectedFrameForward() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            this.editor.SetProperty(this.selectedFrameSelector, "index", (+selectedFrame.index + 1).toString());
        }
    }

    /**
    * Load a document from a given XML
    * @param xml
    */
    openDocumentFromXml(xml: string) {
        this.clearSelectedFrames();
        if (this.editor)
            this.editor.ExecuteFunction("document", "OpenDocumentFromXml", xml, this.editorWorkspaceid);
    }

    /**
     * Save the document
     */
    saveDocument() {
        this.editor.ExecuteFunction("document", "Save");
    }

	/**
	 * Change cursor pointer
	 * @param pointer
	 */
	setCursor(pointer: string) {
		if (this.editor)
			this.editor.ExecuteFunction("document", "SetCursor", pointer);
	}

    /**
     * Wires loaded chili editor from iframe with the wrapper to be used in react components.
     * @param chiliEditor
     */
    setEditor(chiliEditor: any, workspaceid: string) {
        this.editor = chiliEditor;
        this.editorWorkspaceid = workspaceid;
        Subscribers.UpdateSubscribers(EvenType.MyCanvasEditorLoaded);
    }

    /**
     * Set zoom/crop of an image
     * @param box
     */
    setImageBox(box: { imgX?: number, imgY?: number, imgWidth?: number, imgHeight?: number}) {
        if (this.editor) {
            if (box.imgX !== undefined) this.editor.SetProperty(this.selectedFrameSelector, "imgX", `${box.imgX.toFixed(17)}in`);
            if (box.imgY !== undefined) this.editor.SetProperty(this.selectedFrameSelector, "imgY", `${box.imgY.toFixed(17)}in`);
            if (box.imgWidth !== undefined) this.editor.SetProperty(this.selectedFrameSelector, "imgWidth", `${box.imgWidth.toFixed(17)}in`);
            if (box.imgHeight !== undefined) this.editor.SetProperty(this.selectedFrameSelector, "imgHeight", `${box.imgHeight.toFixed(17)}in`);
        }
    }

    /**
     * Set the fitMode to a select image frame
     * @param mode
     */
    setImageFrameFitMode(mode: string) {
        if (this.editor) {
            if (this.editor.GetObject(`${this.selectedFrameSelector}.fitMode`).name !== mode)
                this.editor.SetProperty(this.selectedFrameSelector, "fitMode", mode);
        }
    }

    /**
     * Sets the frame index to 0 or 1. Just in front of the backgound frame if exists.
     */
    sendSelectedFrameToBack() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            let backgroundFrame = this.editor.GetObject(this.backgroundFrameSelector);
            this.editor.SetProperty(this.selectedFrameSelector, "index", backgroundFrame ? "1" : "0");
        }
    }

    /**
     * Creates a background frame if needed and sets a fill color to it.
     * @param r red component
     * @param g green component
     * @param b blue component
     */
    setBackgroundFrameFillColor(r: number, g: number, b: number) {
        this.createBackgroundFrameIfNeeded();
        this.editor.ExecuteFunction(this.backgroundFrameSelector, "ClearContent");
        this.setFrameFillColor(this.backgroundFrameSelector, r, g, b);
        Subscribers.UpdateSubscribers(EvenType.AdditionalDirtyStateChanged);
    }

    /**
     * Creates a background frame if needed and sets the image fit point.
     * @param fitPoint fit point
     */
    setBackgroundFrameFitPoint(fitPoint: string) {
        this.createBackgroundFrameIfNeeded();
        this.editor.SetProperty(this.backgroundFrameSelector, "fitPoint", fitPoint);
    }

    /**
     * Creates a background frame if needed and sets a image content to it.
     * @param id image id
     * @param name image name
     * @param remoteUrl image url
     * @param thumb image thumb url
     * @param highResPdfUrl image high resolution pdf url
     * @param width image width
     * @param height image height
     * @param resolution image resolution
     * @param fileSize image file size
     */
    setBackgroundFrameImage(id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, width: number, height: number, fileSize: string) {
        this.createBackgroundFrameIfNeeded();

        this.setSelectedImage(this.backgroundFrameSelector, id, name, remoteUrl, thumb, highResPdfUrl, width, height, fileSize);
        Subscribers.UpdateSubscribers(EvenType.AdditionalDirtyStateChanged);
    }

    /**
     * Sets the document background opacity.
     */
    setBackgroundFrameOpacity(opacity: number) {
        return this.setFrameOpacity(this.backgroundFrameSelector, opacity);
    }

    /**
     * Apply zoom level to the document
     * @param zoom
     */
    setDocumentZoom(zoom: number) {
        this.editor.SetProperty("document", "zoom", zoom);
    }

    /**
     * Set border color to a selected frame
     * @param r
     * @param g
     * @param b
     */
    setSelectedFrameBorderColor(r: number, g: number, b: number) {
        if (this.getSelectedFrame() != null) {
            this.editor.SetProperty(this.selectedFrameSelector, "borderColor", this.getOrCreateColorObject(r, g, b));
        }
    }

    /**
     * Set border width to a selected frame
     * @param borderWidth
     */
    setSelectedFrameBorderWidth(borderWidth: any) {
        let frame = this.getSelectedFrame();
        let def = "0";
        if (frame) {
            this.editor.SetProperty(this.selectedFrameSelector, "hasBorder", borderWidth !== def);
            this.editor.SetProperty(this.selectedFrameSelector, "borderWidth", borderWidth);
        }
    }

    /**
     * Sets a fill color to the selected frame.
     * @param r red component
     * @param g green component
     * @param b blue component
     */
    setSelectedFrameFillColor(r: number, g: number, b: number) {
        this.setFrameFillColor(this.selectedFrameSelector, r, g, b);
    }

    /**
     * Sets an image as external asset to the selected frame.
     */
    setSelectedFrameImage(id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, width: number, height: number, fileSize: string) {
        this.setSelectedImage(this.selectedFrameSelector, id, name, remoteUrl, thumb, highResPdfUrl, width, height, fileSize);
    }

    setSelectedFrameImageWithId(frameId: any, id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, width: number, height: number, fileSize: string) {
        this.setSelectedImage(`${this.documentPageFramesSelector}[${frameId}]`, id, name, remoteUrl, thumb, highResPdfUrl, width, height, fileSize);
    }

    /**
     * Sets the selected frame tag.
     */
    setSelectedFrameMetadata(assetMetadata: AssetMetadata, frame?: any) {
        let selector = frame ? `${this.documentPageFramesSelector}[${frame.id}]` : this.selectedFrameSelector;
        return this.setFrameMetadata(selector, assetMetadata);
    }

    /**
     * Sets the selected frame asset id in metadata.
     */
    setSelectedFrameMetadataAssetId(assetId: string) {
        this.setFrameMetadataAssetId(this.selectedFrameSelector, assetId);
    }

    /**
     * Sets the selected frame database id in metadata.
     */
    setSelectedFrameMetadataDatabaseId(databaseId: string) {
        this.setFrameMetadataDatabaseId(this.selectedFrameSelector, databaseId);
    }

    /**
     * Sets the selected frame event type in metadata.
     */
    setSelectedFrameMetadataEventType(eventType: string) {
        this.setFrameMetadataEventType(this.selectedFrameSelector, eventType);
    }

    /**
     * Sets the selected frame image id in metadata.
     */
    setSelectedFrameMetadataImageId(imageId: string) {
        this.setFrameMetadataImageId(this.selectedFrameSelector, imageId);
    }

	/**
	 * Sets the selected frame index in metadata.
	 */
	setSelectedFrameMetadataIndex(index: string) {
		this.setFrameMetadataIndex(this.selectedFrameSelector, index);
	}

    /**
     * Sets the selected frame person id in metadata.
     */
    setSelectedFrameMetadataPersonId(personId: string) {
        this.setFrameMetadataPersonId(this.selectedFrameSelector, personId);
    }

    /**
     * Sets the selected frame shape index in metadata.
     */
    setSelectedFrameMetadataShapeIndex(shapeindex: string) {
        this.setFrameMetadataShapeIndex(this.selectedFrameSelector, shapeindex);
    }

    /**
     * Sets the selected frame spouse id in metadata.
     */
    setSelectedFrameMetadataSpouseId(spouseId: string) {
        this.setFrameMetadataSpouseId(this.selectedFrameSelector, spouseId);
    }

    /**
     * Sets the selected frame template tag in metadata.
     */
    setSelectedFrameMetadataTemplateTag(templateTag: string) {
        this.setFrameMetadataTemplateTag(this.selectedFrameSelector, templateTag);
    }

    /**
     * Sets the selected frame text in metadata.
     */
    setSelectedFrameMetadataText(text: string) {
        this.setFrameMetadataText(this.selectedFrameSelector, text);
    }

    /**
     * Sets the selected frame tree id in metadata.
     */
    setSelectedFrameMetadataTreeId(treeId: string) {
        this.setFrameMetadataTreeId(this.selectedFrameSelector, treeId);
    }

    /**
     * Sets the selected frame type in metadata.
     */
    setSelectedFrameMetadataType(type: string) {
        this.setFrameMetadataType(this.selectedFrameSelector, type);
    }

    /**
     * Sets the selected frame opacity.
     */
    setSelectedFrameOpacity(opacity: number) {
        return this.setFrameOpacity(this.selectedFrameSelector, opacity);
    }

    /**
     * Sets the selected frame text for restricted covers.
     */
    setSelectedTextFrameText(text: string, frame?: any) {
        let maxLength = this.getTextFlowMaxLength();
        if (this.editor) {
            let selectorFrame = frame ? `document.allFrames[${frame.id}]` : `${this.selectedFrameSelector}`;
            if (!frame) this.editor.ExecuteFunction("document", "SetCursor", "pointer");
            this.editor.ExecuteFunction(selectorFrame, "ImportTextFlow", text);
            if (!frame) {
                setTimeout(function () {
                    this.editor.ExecuteFunction(`${selectorFrame}.textFlow.composer.selection`, "Select", maxLength, maxLength);
                    this.editor.ExecuteFunction(`${this.selectedTextSelector}.frame.textFlow.composer`, "SetFocus");
                }.bind(this), 100);
            }
        }
    }

    /**
     * Sets the selected frame text.
     */
    setSelectedFrameText(text: string, isRestricted?: boolean, frameId?: string) {
        if (isRestricted) {
            let selectedFrame = this.getSelectedFrame();
            let textFlow = this.buildTextFlowByFrame(selectedFrame, text);
            this.editor.ExecuteFunction(`document.allFrames[${selectedFrame.id}]`, "ImportTextFlow", textFlow);
            return;
		}
		let selector = frameId ? `document.allFrames[${frameId}]` : "document.selectedFrame";
        this.editor.ExecuteFunction(selector, "ImportTextFlow", this.textFlowGen(text).replaceAll("textflow", "TextFlow"));
    }

    /**
     * Set color to a selected text
     * @param r
     * @param g
     * @param b
     */
    setSelectedTextColor(r: number, g: number, b: number) {
        if (this.getTextSelectorObject("textFormat") != null) {
            this.editor.SetProperty(this.selectedTextSelector + ".textFormat", "color", this.getOrCreateColorObject(r, g, b));
        }
    }

    /**
     * set alignment to selected text
     * @param alignment
     */
    setSelectedTextAlignment(alignment: any) {
        if (this.getTextSelectorObject("textFormat") != null) {
            this.editor.SetProperty(this.selectedTextSelector + ".textFormat", "textAlign", alignment);
        }
    }

    /**
     * Set font to a selected text
     * @param font
     */
    setSelectedTextFont(font: any) {
        if (this.getTextSelectorObject("textFormat") != null) {

            if (this.editor.GetObject(`document.fonts[${font.id}]`) == null) {
                //adding font
                let newFont = this.editor.ExecuteFunction("document.fonts", "Add");
                this.editor.SetProperty(`document.fonts[${newFont.id}]`, "family", font.family);
                this.editor.SetProperty(`document.fonts[${newFont.id}]`, "style", font.style);
                this.editor.SetProperty(`document.fonts[${newFont.id}]`, "name", `${font.family} ${font.style}`);
                this.editor.SetProperty(`document.fonts[${newFont.id}]`, "id", font.id);
            }
            this.editor.SetProperty(this.selectedTextSelector + ".textFormat", "font", `cp_object:document.fonts[${font.id}]`);
        }
    }

    /**
     * Set font size to a selected text
     * @param size
     */
    setSelectedTextFontSize(size: any) {
        if (this.getTextSelectorObject("textFormat") != null) {
            this.editor.SetProperty(this.selectedTextSelector + ".textFormat", "fontSize", size);
        }
    }

    /**
     * Set underline to a selected text
     * @param style
     */
    setSelectedTextUnderline(underline: any) {
        if (this.getTextSelectorObject("textFormat") != null) {
            this.editor.SetProperty(this.selectedTextSelector + ".textFormat", "underLine", underline);
        }
    }

    /**
     * Undo or Redo n steps.
     * @param action
     * @param steps
     */
    setUndoManagerAction(action: string, steps: number) {
        this.editor.ExecuteFunction("doc.undoManager", action, steps);
    }

    /**
     * Toggles the background frame horizontal flip.
     */
    toggleBackgroundFrameFlipHorizontally() {
        this.toggleFrameFlipHorizontally(this.backgroundFrameSelector);
    }

    /**
     * Switch on or off the hsadow dropped of the selected frame.
     */
    toggleSelectedFrameDropShadow() {
        let selectedFrame = this.getSelectedFrame();
        if (selectedFrame != null) {
            this.editor.SetProperty(this.selectedFrameSelector, "hasDropShadow", (selectedFrame.hasDropShadow === "false").toString());
        }
    }

    /**
     * Toogles the selected frame horizontal flip.
     */
    toggleSelectedFrameFlipHorizontally() {
        this.toggleFrameFlipHorizontally(this.selectedFrameSelector);
    }

    /**
     * Toogles the selected frame metadata is embellishment flag.
     */
    toggleSelectedFrameMetadataIsEmbellishment() {
        this.toggleFrameMetadataIsEmbellishment(this.selectedFrameSelector);
    }

    /**
     * Toogles the selected frame metadata is original flag.
     */
    toggleSelectedFrameMetadataIsOriginal() {
        this.toggleFrameMetadataIsOriginal(this.selectedFrameSelector);
    }

    /**
     * Toogles the selected frame metadata is resynchronizable flag.
     */
    toggleSelectedFrameMetadataIsResynchronizable() {
        this.toggleFrameMetadataIsResynchronizable(this.selectedFrameSelector);
    }

	/**
 * Toogles the selected frame metadata is removable flag.
 */
	toggleSelectedFrameMetadataIsRemovable() {
		this.toggleFrameMetadataIsRemovable(this.selectedFrameSelector);
	}

    /**
     * Turn off editing mode in text selection
     */
    turnOffEditingMode() {
        if (this.editor) {
            this.editor.ExecuteFunction("document", "SetCursor", "pointer");
        }
    }

    /**
     * Turn on editing mode in text selection
     */
    turnOnEditingMode() {
		if (this.editor) {
			let selector = this.selectedFrameSelector;
			if (this.editor.GetObject(this.selectedFrameSelector) == null) {
				selector = `${this.selectedTextSelector}.frame`;
			}
            this.editor.ExecuteFunction(`${selector}.textFlow.composer.selection`, "SelectAll");
        }
    }

	/**
	 * Update tags for text-frames from its content.
	 */
	updateTagFromContent(frameId: string) {
		let selector = `${this.documentPageFramesSelector}[${frameId}]`;
		let frame = this.editor.GetObject(selector);
		if (!frame) return;
		if (frame.type === "text") {
			let textFormatted = this.editor.ExecuteFunction(selector, "GetText", true, true);
			this.setFrameMetadataText(selector, textFormatted);
		}
	}

    /////// PRIVATE

    /**
     * Adds two measurement, no matter the unit, returning always an inch result.
     * @param a first measurement
     * @param b second measurement
     */
    private addMeasurements(a: string, b: string) {
        return (this.parseInchesValue(a) + this.parseInchesValue(b)) + "in";
    }

    /**
     * Generate the text for restricted covers text-frame
     */
    private buildTextFlowByFrame(frame: any, text: any) {
        let maxLength = this.getTextFlowMaxLength();
        let fText = this.getSelectedFrameText(frame);
        let parser = new DOMParser();
        let spanParser = parser.parseFromString(fText.formatted, "text/html");
        let textParser = parser.parseFromString(text, "text/html");
        // check if span exists
        let span = spanParser.getElementsByTagName("span");
        if (span.length === 0) spanParser.body.innerHTML = this.textFlowGen("");
        span.item(0).innerHTML = textParser.body.innerText.trim().substring(0, maxLength);
        return spanParser.body.innerHTML.replaceAll("textflow", "TextFlow");
    }

    /**
     * Builds the expected item xml for chili
     * @param id image id
     * @param name image name
     * @param remoteUrl image url
     * @param thumb image thumb url
     * @param highResPdfUrl image high resolution pdf url
     * @param width image width
     * @param height image height
     * @param resolution image resolution
     * @param fileSize image file size
     */
    private createAssetDefinition(id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, width: number, height: number, fileSize: string) {
        return '<item id="' + id + '" ' +
                    'name="' + id + '" ' +
                    'remoteURL="' + remoteUrl + '" ' +
                    'thumb="' + thumb + '" ' +
                    'highResPdfURL="' + highResPdfUrl + "&export=application/pdf" + '" ' +
                    'keepExternal="true" ' +
                    'accessibleFromClient="true">' +
                    '<fileInfo width="' + width + '" height="' + height + '" resolution="' + this.defaultResolution + '" fileSize="' + fileSize + '" />' +
                '</item>';
    }

    /**
     * If the document does not have a background frame, then this method will create one. Otherwise, does nothing.
     */
    private createBackgroundFrameIfNeeded() {
        if (this.editor) {

            let backgroundFrame = this.editor.GetObject(this.backgroundFrameSelector);
            if (backgroundFrame == null) {
                let document = this.editor.GetObject("document");

                let bounds = new ChiliBounds();
                bounds.x = "-.125 in";
                bounds.y = "-.125 in";
                bounds.width = this.addMeasurements(document.width, "0.25in");
                bounds.height = this.addMeasurements(document.height, "0.25in");
                backgroundFrame = this.createFrame(bounds, "image");

                this.editor.SetProperty(`${this.documentPageFramesSelector}[${backgroundFrame.id}]`, "name", this.backgroundFrameName);
                this.editor.SetProperty(`${this.documentPageFramesSelector}[${backgroundFrame.id}]`, "tag", this.backgroundFrameName);
                this.editor.SetProperty(`${this.documentPageFramesSelector}[${backgroundFrame.id}]`, "index", "0");
                this.editor.SetProperty(`${this.documentPageFramesSelector}[${backgroundFrame.id}]`, "fitMode", "proportional_outside");

                let backgroundLayer = this.editor.GetObject("document.layers[Background]");
                if (backgroundLayer && backgroundLayer.id) {
                    this.editor.SetProperty(`${this.documentPageFramesSelector}[${backgroundFrame.id}]`, "layer", `cp_object:document.layers[${backgroundLayer.id}]`);
                }

                this.clearSelectedFrames();

                Subscribers.UpdateSubscribers(EvenType.BackgroundFrameCreated);
            }
        }
    }

    /**
     * Specifies a rectagle on a position relative to the document and a calucated size large than 1 inch and smaller than two thirds of the document.
     * @param x
     * @param y
     * @param width
     * @param height
     */
    private createFrameBounds(x: number, y: number, width: number, height: number) : ChiliBounds {
        let bounds = new ChiliBounds();

        // Assumes resoltion is the default one and calculate how many inches are there.
        let widthInches = width / this.defaultResolution;
        let heightInches = height / this.defaultResolution;

        // Scale up if width and height are smaller that one inch.
        if (widthInches < 1 && heightInches < 1) {
            if (widthInches > heightInches) {
                let rel = 1 / widthInches;
                widthInches = 1;
                heightInches *= rel;
            } else {
                let rel = 1 / heightInches;
                heightInches = 1;
                widthInches *= rel;
            }
        }

        let document = this.editor.GetObject("document");
        // Scales down horizontally if the frame is wider than two thirds of the document width.
        let documentWidthInches = this.parseInchesValue(document.width);
        let maxWidthInches = documentWidthInches * (2 / 3);
        if (widthInches > maxWidthInches) {
            let rel = maxWidthInches / widthInches;
            widthInches = maxWidthInches;
            heightInches *= rel;
        }

        // Scales down vertically if still the frame is higher than two thirds of the document height.
        let documentHeightInches = this.parseInchesValue(document.height);
        let maxHeightInches = documentHeightInches * (2 / 3);
        if (heightInches > maxHeightInches) {
            let rel = maxHeightInches / heightInches;
            heightInches = maxHeightInches;
            widthInches *= rel;
        }

        bounds.x = x + "in";
        bounds.y = y + "in";
        bounds.width = widthInches + "in";
        bounds.height = heightInches + "in";

        return bounds;
    }

    /**
     * Creates a text frame
     * @param bounds
     */
    private createFrame(bounds: ChiliBounds, frameType: string) {
        return this.editor.ExecuteFunction(this.documentPageFramesSelector, "Add", frameType, bounds.x, bounds.y, bounds.width, bounds.height);
    }

    /**
     * Gets a frame background color.
     */
    private getFrameFillColor(selector: string) {
        if (this.editor) {
            let frame = this.editor.GetObject(selector);
            if (frame != null && frame.hasFill) {
                let fillColor = this.editor.GetObject(`${selector}.fillColor`);
                return fillColor.htmlValue;
            }
        }

        return "";
    }

    /**
     * Retrieves the opacity property value of a frame.
     * @param selector frame selector.
     */
    private getFrameOpacity(selector: string) {
        if (this.editor) {
            let frame = this.editor.GetObject(selector);
            if (frame) {
                return frame.opacity;                
            }
        }

        return 0;
    }

    /**
     * Retrieves the tag property value of a frame.
     * @param selector frame selector.
     */
    private getFrameMetadata(selector: string): AssetMetadata {
        let metadata: AssetMetadata = {};
        if (this.editor) {
            let frame = this.editor.GetObject(selector);
            if (!frame) {
                frame = this.getTextSelectorObject("frame");
            }
            if (frame && frame.tag && frame.tag !== this.backgroundFrameName) {
                metadata = JSON.parse(frame.tag);
            }
        }

        // if no metadata, return default structure.
        if (!metadata.client) {
            metadata.client = {
                embellishment: false,
                sync: false
            }
        }
        if (!metadata.src) {
            metadata.src = {
                a: "",
                db: "",
                img: "",
                e: "",
                o: false,
                p: "",
                sp: "",
                t: "",
                txt: "",
                tr: ""
            }
        }
        if (!metadata.tt) {
            metadata.tt = "";
        }

        return metadata;
    }

    private getAllFrameMetadata(): any {
        let metadata: AssetMetadata = {};
        let dict: any = {};
        if (this.editor) {
            let numFrames = this.editor.GetObject(this.documentPageFramesSelector).length;
            for (let i = 0; i < numFrames; i++) {

                let frame = this.editor.GetObject(`${this.documentPageFramesSelector}[${i}]`);
                if (frame && frame.tag && frame.tag !== this.backgroundFrameName) {
                    metadata = JSON.parse(frame.tag);
                    if (metadata.client != null) {
                        if (metadata.client.sync && metadata.src.p && metadata.src.tr) {
                            dict[frame.id] = metadata;
                        }
                    }

                }
                
            }
            return dict;
        }
        return null;
    }

    /**
     * Get metrics from a selector as [left, top, width, height]
     */
    private getFrameMetrics(selector: string) {
        let metrics = { left: 0, top: 0, width: 0, height: 0 };
        let frame: any;
        frame = this.editor.GetObject(selector);
        if (frame) {
            if (frame.contentFrameControl) {
                let canvas = this.editor.ExecuteFunction(selector + ".contentFrameControl", "GetEditorCanvasMetrics");
                metrics = { left: +canvas.x, top: +canvas.y, width: +canvas.width, height: +canvas.height };
            }
            else if (frame.frameControl) {
                let canvas = this.editor.ExecuteFunction(selector + ".frameControl", "GetEditorCanvasMetrics");
                metrics = { left: +canvas.x, top: +canvas.y, width: +canvas.width, height: +canvas.height };
            }
        } else {
            frame = this.getTextSelectorObject("frame");
            if (frame) metrics = this.getFrameMetrics(`${this.documentPageFramesSelector}[${frame.index}]`);
        }
        return metrics;
    }

    /**
     * Gets a color from the document or creates it in the document returning the whole object string ready to be set to any object.
     * @param r red component
     * @param g green component
     * @param b blue component
     */
    private getOrCreateColorObject(r: number, g: number, b: number) {
        let name = `${r}-${g}-${b}`;
        let color = this.editor.GetObject(`document.colors[${name}]`);
        if (color == null) {
            color = this.editor.ExecuteFunction("document.colors", "Add");
            this.editor.SetProperty(`document.colors[${color.id}]`, "name", name);
            this.editor.SetProperty(`document.colors[${color.id}]`, "r", r);
            this.editor.SetProperty(`document.colors[${color.id}]`, "g", g);
            this.editor.SetProperty(`document.colors[${color.id}]`, "b", b);
        }

        return `cp_object:document.colors[${color.id}]`;
    }

    /**
     * Get the selected frame
     */
    private getSelectedFrame() {
        let selectedFrame = this.editor.GetObject(this.selectedFrameSelector);
        if (selectedFrame == null) selectedFrame = this.getTextSelectorObject("frame");
        return selectedFrame;
    }

    /**
     * Returns a selected frame based on mouse position
     * @param x
     * @param y
     */
    private getSelectedFrameOnDrop(x: any, y: any, frameType: string) {
        if (this.editor) {
            let arrayFrames: any[] = [];
            let backgroundFrame = this.editor.GetObject(this.backgroundFrameSelector);

            let numFrames = this.editor.GetObject(this.documentPageFramesSelector).length;
            for (let i = 0; i < numFrames; i++) {

                let frame = this.editor.GetObject(`${this.documentPageFramesSelector}[${i}]`);
                if (frame && frame.type === frameType && (parseFloat(frame.x) >= 0 || parseFloat(frame.y) >= 0)) {
                    if (frame.id !== backgroundFrame.id || !backgroundFrame) {

                        let top = this.parseInchesValue(frame.y);
                        let left = this.parseInchesValue(frame.x);
                        let bottom = top + this.parseInchesValue(frame.height);
                        let right = left + this.parseInchesValue(frame.width);

                        if (y >= top && y <= bottom && x >= left && x <= right) {
                            arrayFrames.push(frame);
                        }
                    }
                }
            }
            let sorted = arrayFrames.sort((a, b) => +b.index - +a.index);
            return sorted[0];
        }
        return null;
    }

    /**
     * Wrapper to invoke GetObject -> selectedTextSelector
     */
    private getTextSelectorObject(selector: string): any {
        if (this.editor.GetObject(this.selectedTextSelector) != null) {
            return this.editor.GetObject(`${this.selectedTextSelector}.${selector}`);
        }
        return null;
    }

    /**
     * Detects wether the selected frame has been flipped horizontally.
     */
    private hasFrameHorizontalFlip(selector: string) {
        if (this.editor) {
            let frame = this.editor.GetObject(selector);
            if (frame) {
                return frame.imageFlip === "horizontal";
            }
        }

        return false;
    }

    /**
     * parse the pure inch number value of a measurement, detecting the original measurement unit and making the proper conversion.
     * @param value raw measurement and unit.
     */
    private parseInchesValue(value: string) {
        switch (value.substr(value.length - 2, 2)) {
            case "cm":
                return parseFloat(value.replace("cm", "")) / 2.54;
            case "mm":
                return parseFloat(value.replace("mm", "")) / 25.4;
            case "pt":
                return parseFloat(value.replace("pt", "")) / 72;
            case "in":
                return parseFloat(value.replace("in", ""));
        }
        return parseFloat(value);
    }

    /**
     * Iterates throu objects props and delete them that are null or false.
     * @param obj
     */
    private removeObjectEmptyProps(obj: any) {
        Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === "object") {
                this.removeObjectEmptyProps(obj[key]);
                if (!Object.keys(obj[key]).find(subkey => obj[key][subkey])) {
                    delete obj[key];
                }
            }
            else if (obj[key] === null || !obj[key]) {
                delete obj[key];
            }
        });
        return obj;
    }

    /**
     * Sets a fill color to a frame.
     * @param selector object selector
     * @param r red component
     * @param g green component
     * @param b blue component
     */
    private setFrameFillColor(selector: string, r: number, g: number, b: number) {
        this.editor.SetProperty(selector, "hasFill", "true");
        this.editor.SetProperty(selector, "fillColor", this.getOrCreateColorObject(r, g, b));
    }

    /**
     * Sets an image as external asset to a frame.
     */
    private setSelectedImage(selector: string, id: string, name: string, remoteUrl: string, thumb: string, highResPdfUrl: string, width: number, height: number, fileSize: string) {
        let assetDefinitionXML = this.createAssetDefinition(id, name, remoteUrl, thumb, highResPdfUrl, width, height, fileSize);

        this.editor.ExecuteFunction(selector, "LoadContentFromExternalServerXmlString", assetDefinitionXML);
    }

    /**
     * Sets the tag value to a frame.
     * @param selector frame selector
     * @param tag should be a json tag representing AssetMetadata structure.
     * The only frame that can have a simple string value y the background frame.
     */
    private setFrameMetadata(selector: string, assetMetadata: AssetMetadata) {
        let frame = this.editor.GetObject(selector);

        // delete empty or false properties.
        this.removeObjectEmptyProps(assetMetadata);

        if (frame) {
            this.editor.SetProperty(selector, "tag", JSON.stringify(assetMetadata));
        }
    }

    /**
     * Sets src->a json property in the the tag value to a frame.
     * @param selector frame selector
     * @param assetId string.
     */
    private setFrameMetadataAssetId(selector: string, assetId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.a = assetId;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->db json property in the the tag value to a frame.
     * @param selector frame selector
     * @param databaseId string.
     */
    private setFrameMetadataDatabaseId(selector: string, databaseId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.db = databaseId;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->e json property in the the tag value to a frame.
     * @param selector frame selector
     * @param eventType string.
     */
    private setFrameMetadataEventType(selector: string, eventType: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.e = eventType;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->img json property in the the tag value to a frame.
     * @param selector frame selector
     * @param imageId string.
     */
    private setFrameMetadataImageId(selector: string, imageId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.img = imageId;

        this.setFrameMetadata(selector, metadata);
    }

	/**
	 * Sets client->ndx json property in the the tag value to a frame.
	 * @param selector frame selector
	 * @param index string.
	 */
	private setFrameMetadataIndex(selector: string, index: string) {
		let metadata: AssetMetadata = this.getFrameMetadata(selector);
		metadata.client.ndx = index;

		this.setFrameMetadata(selector, metadata);
	}

    /**
     * Sets client->shp json property in the the tag value to a frame.
     * @param selector frame selector
     * @param index string.
     */
    private setFrameMetadataShapeIndex(selector: string, shapeindex: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.client.shp = shapeindex;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->p json property in the the tag value to a frame.
     * @param selector frame selector
     * @param personIn string.
     */
    private setFrameMetadataPersonId(selector: string, personId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.p = personId;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->sp json property in the the tag value to a frame.
     * @param selector frame selector
     * @param spouseId string.
     */
    private setFrameMetadataSpouseId(selector: string, spouseId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.sp = spouseId;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets tempalte tag json property in the the tag value to a frame.
     * @param selector frame selector
     * @param templateTag string.
     */
    private setFrameMetadataTemplateTag(selector: string, templateTag: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.tt = templateTag;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->txt json property in the the tag value to a frame.
     * @param selector frame selector
     * @param text string.
     */
    private setFrameMetadataText(selector: string, text: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.txt = text;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->tr json property in the the tag value to a frame.
     * @param selector frame selector
     * @param treeId string.
     */
    private setFrameMetadataTreeId(selector: string, treeId: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.tr = treeId;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets src->t json property in the the tag value to a frame.
     * @param selector frame selector
     * @param type string.
     */
    private setFrameMetadataType(selector: string, type: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.t = type;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Sets the opacity value to a frame.
     * @param selector frame selector
     * @param opacity opacity value.
     */
    private setFrameOpacity(selector: string, opacity: number) {
        let frame = this.editor.GetObject(selector);

        if (frame) {
            this.editor.SetProperty(selector, "opacity", opacity);
        }
    }

    /**
     * Toggle an image between normal and horizontal flip
     */
    private toggleFrameFlipHorizontally(selector: string) {
        let frame = this.editor.GetObject(selector);

        if (frame) {
            let toggle = frame.imageFlip === "horizontal" ? "none" : "horizontal";
            this.editor.SetProperty(selector, "imageFlip", toggle);
        }
    }

    /**
     * Generates a textflow tag (HTML-DOM-lowercase ready) for textFrames
     * Chili uses camel-case which is not compatible with HTML-DOM
     * An explicit replacement need to be done after using.
     */
    private textFlowGen = (text: string) => `<textflow xmlns="http://ns.adobe.com/textLayout/2008"><p><span>${text}</span></p></textflow>`;

    /**
     * Toggles embellishment json property in the the tag value to a frame.
     * @param selector frame selector
     */
    private toggleFrameMetadataIsEmbellishment(selector: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.client.embellishment = !metadata.client.embellishment;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Toggles src->o json property in the the tag value to a frame.
     * @param selector frame selector
     */
    private toggleFrameMetadataIsOriginal(selector: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.src.o = !metadata.src.o;

        this.setFrameMetadata(selector, metadata);
    }

    /**
     * Toggles resynchronizable json property in the the tag value to a frame.
     * @param selector frame selector
     */
    private toggleFrameMetadataIsResynchronizable(selector: string) {
        let metadata: AssetMetadata = this.getFrameMetadata(selector);
        metadata.client.sync = !metadata.client.sync;

        this.setFrameMetadata(selector, metadata);
	}

	/**
	 * Toggles removable json property in the the tag value to a frame.
	 * @param selector frame selector
	 */
	private toggleFrameMetadataIsRemovable(selector: string) {
		let metadata: AssetMetadata = this.getFrameMetadata(selector);
		metadata.client.rmvbl = !metadata.client.rmvbl;

		this.setFrameMetadata(selector, metadata);
	}
}

/**
 * This interface represents the chili editor object definition, with its public methods.
 * Every chili editor method or property that must be called from react side, must have declared its signature here.
 */
interface ChiliEditor {
    ExecuteFunction(object: string, action: string, param1?: any, param2?: any, param3?: any, param4?: any, param5?: any): any;
    GetObject(selector: string): any;
	SetProperty(object: string, property: string, value: any): void;
	GetDirtyState(): boolean;
}
class ChiliBounds {
    x: string;
    y: string;
    width: string;
    height: string;
}

export { MyCanvasEditor };
export { ChiliObjectTypes };
