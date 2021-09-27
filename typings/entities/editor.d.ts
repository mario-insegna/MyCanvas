interface ICover {
    CoverId?: number;
    CoverTypeId?: number;
    Name?: string;
    DisplayName?: string;
    MaxPages?: number;
    MinPages?: number;
    CountPages?: number;
    Binding?: string;
    BasePrice?: number;
    PagePrice?: number;
    TotalCost?: number;
    Layouts?: ILayout[];
    Colors?: IColor[];
}

interface ILayout {
    CoverLayoutId?: number;
    Width?: number;
    Height?: number;
    PreviewImageUrl?: string;
}

interface IColor {
    CoverColorId: number;
    DisplayName: string;
    CoverPageInsidePreview: string;
    CoverPageOutsidePreview: string;
    TextColor: string;
    ColorPreview: ImageInfo;
}

interface ITab {
    CoverId: number;
    title: string;
    content: JSX.Element;
    Colors?: IColor[];
}

interface IHttpStatusCodeResult {
	StatusCode: number;
	StatusDescription: string;
}

interface IDesktop {
    header?: HTMLDivElement;
    bar?: HTMLDivElement;
    side?: HTMLDivElement;
    bottom?: HTMLDivElement;
}

interface IDimension {
    width: number;
    height: number;
}
