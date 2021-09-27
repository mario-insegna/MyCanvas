interface AssetInfo {
    AssetMetadata?: AssetMetadata;
    ImageInfo?: ImageInfo;
    RecordInfo?: RecordInfo;
    StoryInfo?: StoryInfo;
    NoteInfo?: NoteInfo;
    CommentInfo?: CommentInfo;
    EventInfo?: EventInfo;
    Layout?: Layout;
}

interface AssetMetadata {
    client?: {
        embellishment?: boolean;
        sync?: boolean;
		rmvbl?: boolean;
        ndx?: string;
        shp?: string;
    };
    src?: {
      a?: string;
      db?: string;
      img?: string;
      e?: string;
      o?: boolean;
      p?: string;
      sp?: string;
      t?: string;
      txt?: string;
      tr?: string;
    };
    tt?: string;
}

interface CommentInfo {
    ModifiedDate: Date;
    Id: string;
    Text: string;
    Name: string;
    DisplayName: string;
}

interface Content {
    Id: number;
    Category: string;
    Subcategories: Array<Content>;
    Items: Array<ImageInfo>;
}

interface EventInfo {
    Id: string;
    Date: string;
    Place: string;
    Name: string;
    Text: string;
    ParsedDate?: Date;
}

interface ImageInfo {
    ImageId: string;
    Name: string;
    Url: string;
    ThumbUrl: string;
    PdfUrl: string;
    Date: string;
    Width: number;
    Height: number;
    Selected?: boolean;
    CustomData?: Hashtable;
}

interface NoteInfo {
    ModifiedDate: Date;
    Id: string;
    Text: string;
    Name: string;
    DisplayName: string;
}

interface PersonInfo {
    Id: string;
    FirstName: string;
    LastName: string;
    BirthDate: string;
    BirthPlace: string;
    DeathDate?: string;
}

interface RecordInfo {
    Id: string;
    DatabaseId: number;
    AncestryImageId: string;
    DisplayName: string;
    Text: string;
    Source: string;
    HasData: boolean;
    DatabaseName: string;
    Name?: string;
    Url?: string;
}

interface ResyncImageElementResult {
    problems?: boolean;
    result?: ImageInfo;
}

interface ResyncTextElementResult {
    problems?: boolean;
    result?: string;
}

interface FrameElement {
    FrameId?: any;
    ImageElement?: ImageInfo;
    TextElement?: string;
    Problems?: boolean;
}



interface StoryInfo {
    ModifiedDate: Date;
    Id: string;
    Text: string;
    Name: string;
    DisplayName: string;
}

interface TreeInfo {
    Id: string;
    Name: string;
}

interface IData {
    Type?: any;
    Id?: any;
    Name?: any;
    RemoteUrl?: any;
    Thumb?: any;
    HighResPdfUrl?: any;
    Width?: any;
    Height?: any;
    FileSize?: any;
    Text?: any;
    JsonAssetMetadata?: AssetMetadata;
}
