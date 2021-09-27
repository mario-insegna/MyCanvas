import { MyCanvasEditor } from "./MyCanvasEditor";
import { Desktop } from "./components/Desktop";

class ApplicationScope {
    static desktopApplication: Desktop;
    projectsUrls: ProjectUrls;
    projectParameters: ProjectParameters;
	myCanvasEditor: MyCanvasEditor;
	conditions =  new Conditions();

	constructor(projectsUrls: ProjectUrls, projectParameters: ProjectParameters) {
		this.projectsUrls = projectsUrls;
		this.projectParameters = projectParameters;

		// General conditions
		this.conditions.isLayout = this.projectParameters.Mode === ApplicationModes.LAYOUT_EDITING;

		this.conditions.isCoverLayout = this.projectParameters.Mode === ApplicationModes.COVER_LAYOUT_EDITING;

		this.conditions.notPreview = this.projectParameters.Mode !== ApplicationModes.PROJECT_PREVIEW;

		this.conditions.notPreviewNorLayout = this.projectParameters.Mode !== ApplicationModes.PROJECT_PREVIEW &&
			this.projectParameters.Mode !== ApplicationModes.LAYOUT_EDITING;

		this.conditions.previewOrEditingOrAdmin = this.projectParameters.Mode === ApplicationModes.PROJECT_PREVIEW ||
			this.projectParameters.Mode === ApplicationModes.PROJECT_EDITING ||
			this.projectParameters.Mode === ApplicationModes.PROJECT_EDITING_ADMIN;

		this.conditions.adminOrLayoutOrCoverLayout =
			this.projectParameters.Mode === ApplicationModes.PROJECT_EDITING_ADMIN ||
			this.projectParameters.Mode === ApplicationModes.LAYOUT_EDITING ||
			this.projectParameters.Mode === ApplicationModes.COVER_LAYOUT_EDITING;

		this.conditions.editingOrAdmin = this.projectParameters.Mode === ApplicationModes.PROJECT_EDITING ||
			this.projectParameters.Mode === ApplicationModes.PROJECT_EDITING_ADMIN;

		this.conditions.layoutOrCoverLayout = this.projectParameters.Mode === ApplicationModes.LAYOUT_EDITING ||
			this.projectParameters.Mode === ApplicationModes.COVER_LAYOUT_EDITING;

        this.conditions.photoPoster = this.projectParameters.ProductTypeGroupId === ProductTypeGroups.PhotoPosters || this.projectParameters.ProductTypeGroupId === ProductTypeGroups.FamilyHistoryPosters;

		this.myCanvasEditor = new MyCanvasEditor();
	}

	static toggleSpinner(visible: boolean) {
        if (this.desktopApplication) {
            this.desktopApplication.toggleSpinner(visible);
        }
    }

    static setDesktopApplication(desktopApplication: Desktop) {
        this.desktopApplication = desktopApplication;
    }
}

class Conditions {
	isLayout: boolean;
	isCoverLayout: boolean;
	notPreview: boolean;
	notPreviewNorLayout: boolean;
	previewOrEditingOrAdmin: boolean;
	adminOrLayoutOrCoverLayout: boolean;
	editingOrAdmin: boolean;
	layoutOrCoverLayout: boolean;
	photoPoster: boolean;
}

class ProjectUrls {
    RootUrl: string;
    EditorUrl: string;
    PwsUrl: string;
}

class ProjectParameters {
    Name: string;
    Mode: ApplicationModes;
    ProjectId: number;
    ProductId: number;
    ThemeId: number;
    PartnerId: number;
    Preview: number;
    LayoutId: number;
    CoverLayoutId: number;
	CustomData: Hashtable;
    ProductTypeGroupId?: ProductTypeGroups;
    Editor_Workspaceid: string;
}

enum ApplicationModes {
    PROJECT_PREVIEW,
    PROJECT_EDITING,
    PROJECT_EDITING_ADMIN,
    LAYOUT_EDITING,
    COVER_LAYOUT_EDITING
}

enum ProductTypeGroups {
	FamilyHistoryBooks = 1,
	FamilyHistoryPosters = 2,
	PhotoBooks = 3,
	PhotoPosters = 4,
	PremiumBooks = 5,
	Calendars = 6
}

export { ApplicationScope }
export { ProductTypeGroups }