interface Layout {
    TemplateXml: string;
    Width: number;
    Height: number;
    PreviewImageUrl: string;
}

interface Page {
    Layout: Layout;
    PageNumber: number;
    PageId: number;
    ThumnailUrl: string;
    Selected?: boolean;
    Milliseconds?: number;
}

interface FolderLayout {
    Id: number;
    Name: string;
    IdTheme: number;
    SubFolders: Array<FolderLayout>;
    Items: Array<ImageInfo>;
    ParentId?: number;
}
