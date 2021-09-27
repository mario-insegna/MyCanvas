interface MyWindow extends Window {
    OnEditorEvent: (type: string, targetID: string) => void;
    OpenUploadImageModal: (albumId: string, isBackground: boolean) => void;
    FindReact: (dom: any) => React.Component<any, any>;
}

declare module "coloreact" {
    export default class ColorPicker extends React.Component<any, any> { }
}

interface Hashtable {
    [key: string]: any;
}
