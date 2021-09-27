// FontManager.ts

export interface IFont {
    id: string;
    idbold: string;
    iditalic: string;
    idbolditalic: string;
    family: string;
    style: any;
    source: string;
}

export interface IFontState {
    id: string;
    font: IFont;
    active: boolean;
    enabled: boolean;
    nextfont: IFont;
    nextactive: boolean;
}

export enum FontStyle {
    Regular = ("Regular") as any,
    Bold = ("Bold") as any,
    Italic = ("Italic") as any,
    BoldItalic = ("Bold Italic") as any
}

class Manager {

    GetFontById(id: string): IFont {
        let font = id === "" ? this.FontDefault : this.FontList.filter(option => option.id === id)[0];
        return font ? font : this.FontDefault;
    }

    GetFontBoldById(id: string): IFont {
        let font = id === "" ? this.FontDefault : this.FontList.filter(option => option.idbold === id)[0];
        return font ? font : this.FontDefault;
    }

    GetFontItalicById(id: string): IFont {
        let font =  id === "" ? this.FontDefault : this.FontList.filter(option => option.iditalic === id)[0];
        return font ? font : this.FontDefault;
    }

    GetFontBoldItalicById(id: string): IFont {
        let font =  id === "" ? this.FontDefault : this.FontList.filter(option => option.idbolditalic === id)[0];
        return font ? font : this.FontDefault;
    }

    GetFontToApply(id: string, style: string): IFont {
        let font = this.GetFontById(id);
        let item = this.FontDefault;
        switch (`${style} => ${font.style}`) {
            case `${FontStyle.Bold} => ${FontStyle.Regular}`:
                item = this.GetFontById(font.idbold);
                break;
            case `${FontStyle.Bold} => ${FontStyle.Bold}`:
                item = this.GetFontBoldById(font.id);
                break;
            case `${FontStyle.Bold} => ${FontStyle.Italic}`:
                item = this.GetFontItalicById(font.id);
                item = this.GetFontById(item.idbolditalic);
                break;
            case `${FontStyle.Bold} => ${FontStyle.BoldItalic}`:
                item = this.GetFontBoldItalicById(font.id);
                item = this.GetFontById(item.iditalic);
                break;
            case `${FontStyle.Italic} => ${FontStyle.Regular}`:
                item = this.GetFontById(font.iditalic);
                break;
            case `${FontStyle.Italic} => ${FontStyle.Bold}`:
                item = this.GetFontBoldById(font.id);
                item = this.GetFontById(item.idbolditalic);
                break;
            case `${FontStyle.Italic} => ${FontStyle.Italic}`:
                item = this.GetFontItalicById(font.id);
                break;
            case `${FontStyle.Italic} => ${FontStyle.BoldItalic}`:
                item = this.GetFontBoldItalicById(font.id);
                item = this.GetFontById(item.idbold);
                break;
        }
        return item;
    }

    GetFontState(id: string, style: any): IFontState {
        let font = FontManager.GetFontById(id);
        let active = this.checkActive(font, style);
        let nextfont = FontManager.GetFontToApply(id, style);
        let enabled = nextfont.id !== "";
        let nextactive = this.checkActive(nextfont, style);
        return { id: font.id, font: font, active: active, enabled: enabled, nextfont: nextfont, nextactive: nextactive };
    }

    private checkActive(font: IFont, style: any): boolean {
        return font && font.style.includes(style);
    }

    FontList: IFont[] = [
        { id: "d7308f85-14df-4c7c-8654-2bc2e7db5b50", idbolditalic: "", idbold: "", iditalic: "", family: "Abilene", style: FontStyle.Regular, source: "Abilene.png" },
        { id: "2e5be9b5-e651-496f-b548-e8689c8d379e", idbolditalic: "", idbold: "", iditalic: "", family: "Baskerville Old Face FS", style: FontStyle.Regular, source: "Baskerville.png" },
        { id: "9bddee7d-7dab-42b8-8da6-cfe0c23fd5a8", idbolditalic: "", idbold: "1486ecee-6fd5-40af-bcf8-200bbb801dab", iditalic: "", family: "Adelon", style: FontStyle.Regular, source: "AdelonBook.png" },
        { id: "f29d7322-8218-4740-a179-9dbaf62b56f7", idbolditalic: "", idbold: "", iditalic: "", family: "Calligraph Script", style: FontStyle.Regular, source: "CalligraphScript.png" },
        { id: "6fd54df3-b572-4bc8-9ebd-338d31a5988a", idbolditalic: "", idbold: "", iditalic: "", family: "Allstar", style: FontStyle.Regular, source: "Allstar.png" },
        { id: "c97148d4-d681-4c40-83a8-50db6d8ea522", idbolditalic: "", idbold: "", iditalic: "", family: "Arnold Boecklin FS", style: FontStyle.Regular, source: "ArnoldBoecklin.png" },
        { id: "132176fa-6d69-43c7-b986-97d7de4b12dd", idbolditalic: "", idbold: "", iditalic: "", family: "Bergamo Caps", style: "Bold", source: "BergamoCaps.png" },
        { id: "16994e7f-2d2e-4a27-8a97-ddd97505d343", idbolditalic: "", idbold: "", iditalic: "", family: "Abbot Old Style", style: FontStyle.Regular, source: "AbbotOldStyle.png" },
        { id: "1781598d-5328-4993-a03a-f91067bf2915", idbolditalic: "", idbold: "", iditalic: "", family: "Calligraph Script Swash", style: FontStyle.Regular, source: "CalligraphScriptSwash.png" },
        { id: "80ec0e9c-36ec-4777-9ea4-d0c86ab17906", idbolditalic: "", idbold: "ccd5cdb6-3395-4179-9a7e-5f1e0555cd02", iditalic: "", family: "Clarendon FS", style: FontStyle.Regular, source: "Clarendon.png" },
        { id: "e132eaa2-a166-41f4-8b4f-9541801233fa", idbolditalic: "", idbold: "", iditalic: "", family: "Casual Hand", style: FontStyle.Regular, source: "CasualHand.png" },
        { id: "a85e4457-7c57-49ef-832d-af804775f1ec", idbolditalic: "233ddcc9-95ca-498e-a480-a2ba543c51a4", idbold: "31cdd33a-3fd2-4ac1-92c2-a4b869380acf", iditalic: "b2368aa9-844d-4603-a768-f7c919f7672e", family: "Cheltenham FS Cond", style: FontStyle.Regular, source: "CheltenhamCond.png" },
        { id: "27fa6fff-aa64-4321-b909-4dd47144e8d3", idbolditalic: "", idbold: "", iditalic: "", family: "Daisy Script", style: FontStyle.Regular, source: "Daisy.png" },
        { id: "b6dac6cb-e5ab-4b2d-b6b7-6659029e309b", idbolditalic: "", idbold: "2d25170c-6241-4bb1-8da1-a5dddcfe349b", iditalic: "", family: "FS Engravers Gothic", style: FontStyle.Regular, source: "Engravers Gothic.png" },
        { id: "25083c4d-6691-4bcf-80f4-b09141b87145", idbolditalic: "", idbold: "", iditalic: "", family: "Deanna Script", style: FontStyle.Regular, source: "Deanna Script.png" },
        { id: "f973930a-7c6f-4c75-934c-55488170c3a0", idbolditalic: "", idbold: "c2e85f74-a028-42ac-bbfb-afa85e84568f", iditalic: "", family: "FS Engravers Old English", style: FontStyle.Regular, source: "Engravers Old English.png" },
        { id: "be1ad98e-d5c4-4066-974f-0cd125689486", idbolditalic: "", idbold: "", iditalic: "a9f4aa1e-e513-4950-88cc-1355e34cf99e", family: "FS Franklin Gothic Book", style: FontStyle.Regular, source: "Franklin Gothic.png" },
        { id: "bd364a9f-895e-4575-89c3-3c06c3e8ac06", idbolditalic: "5347525d-696f-4bd7-bc6f-f2b79b7944d9", idbold: "7515a3b4-5fdb-4b3f-9b51-9ab4139a0c18", iditalic: "daced3f9-a1b7-4af3-8010-73c2bed2ca68", family: "FS Barbedor", style: FontStyle.Regular, source: "FS Barbedor.png" },
        { id: "0bf3e691-dca6-49a9-85ef-440887b424f2", idbolditalic: "5b4836a0-ab9a-4f3b-b763-366dc37cab6c", idbold: "c04995dd-7586-48f1-a573-7cb0f25d63f4", iditalic: "51f5720e-b754-404d-97e9-2d1934f3cdc3", family: "FS Bodoni", style: FontStyle.Regular, source: "FS Bodoni.png" },
        { id: "d9badee9-0cb0-4671-b42e-e1c0502deb45", idbolditalic: "6b0a68b8-7301-4c64-bb0b-5fbd1d897f8b", idbold: "807266ea-be7c-45d8-98e0-893a417e63b3", iditalic: "801ef97c-16ed-48da-801d-239e776e14ea", family: "FS Garamond", style: FontStyle.Regular, source: "FS Garamond.png" },
        { id: "920f5ceb-f14c-4605-8339-54e69aa23b56", idbolditalic: "16db25d5-915d-4751-9a3a-951ef496a3c7", idbold: "d379b710-cca1-466e-bf68-fd2c60529c84", iditalic: "de16c00d-bfd9-4ea7-9f80-0bd0f21386f5", family: "Garamond Modern FS", style: FontStyle.Regular, source: "GaramondModern.png" },
        { id: "f7502a90-b6eb-4dcc-9d8d-0ce96a8e1a4d", idbolditalic: "", idbold: "", iditalic: "", family: "Hudson", style: FontStyle.Regular, source: "Hudson.png" },
        { id: "66e8dfca-1d51-441c-b4ec-1f61963bb276", idbolditalic: "", idbold: "", iditalic: "", family: "Mistral FS", style: FontStyle.Regular, source: "Mistral.png" },
        { id: "dbdeed5b-4163-44b8-8f85-96569c82a685", idbolditalic: "", idbold: "", iditalic: "", family: "FS Mona Lisa", style: FontStyle.Regular, source: "Mona Lisa.png" },
        { id: "785692ee-b7c7-47d5-adeb-d845d1ea1654", idbolditalic: "", idbold: "", iditalic: "", family: "Old Script", style: FontStyle.Regular, source: "OldScript.png" },
        { id: "0eadb7ed-d0ec-4afc-ad37-41a186fda1c9", idbolditalic: "b78c94c8-f32d-458d-ac4c-ebd4719227fe", idbold: "51b4f62a-3ac9-4068-9f76-3a88ada2e5c6", iditalic: "f40a3536-220e-48d4-a111-e21870985555", family: "Opus", style: FontStyle.Regular, source: "Opus.png" },
        { id: "679bb8a2-3ffc-4475-ad9e-cf28760339ad", idbolditalic: "", idbold: "", iditalic: "", family: "Typo Upright FS", style: FontStyle.Regular, source: "TypoUpright.png" },
        { id: "235b998f-49bb-4b5d-a0ad-553ad2b5bb0b", idbolditalic: "", idbold: "", iditalic: "", family: "Unitus", style: FontStyle.Regular, source: "Unitus.png" },
        { id: "8e821ba7-5eeb-4a99-9976-8becdfb25526", idbolditalic: "53ea1724-4b22-484e-a46c-6857265c431f", idbold: "5f1ed8a6-4c11-4eb7-918c-ffb1e5a3b514", iditalic: "ac2d8a9a-ebd7-4bf5-b5cf-c4988058ff12", family: "Unitus Cond", style: FontStyle.Regular, source: "UnitusCond.png" },
        { id: "998d50d1-4a44-44d2-b4b3-99632ac310eb", idbolditalic: "", idbold: "", iditalic: "", family: "Unitus Light", style: FontStyle.Regular, source: "UnitusLight.png" },
        { id: "53ea1724-4b22-484e-a46c-6857265c431f", idbolditalic: "", idbold: "", iditalic: "", family: "Unitus Cond", style: FontStyle.BoldItalic, source: "" },
        { id: "5f1ed8a6-4c11-4eb7-918c-ffb1e5a3b514", idbolditalic: "", idbold: "", iditalic: "", family: "Unitus Cond", style: FontStyle.Bold, source: "" },
        { id: "ac2d8a9a-ebd7-4bf5-b5cf-c4988058ff12", idbolditalic: "", idbold: "", iditalic: "", family: "Unitus Cond", style: FontStyle.Italic, source: "" },
        { id: "b78c94c8-f32d-458d-ac4c-ebd4719227fe", idbolditalic: "", idbold: "", iditalic: "", family: "Opus", style: FontStyle.BoldItalic, source: "" },
        { id: "51b4f62a-3ac9-4068-9f76-3a88ada2e5c6", idbolditalic: "", idbold: "", iditalic: "", family: "Opus", style: FontStyle.Bold, source: "" },
        { id: "f40a3536-220e-48d4-a111-e21870985555", idbolditalic: "", idbold: "", iditalic: "", family: "Opus", style: FontStyle.Italic, source: "" },
        { id: "16db25d5-915d-4751-9a3a-951ef496a3c7", idbolditalic: "", idbold: "", iditalic: "", family: "Garamond Modern FS", style: FontStyle.BoldItalic, source: "" },
        { id: "d379b710-cca1-466e-bf68-fd2c60529c84", idbolditalic: "", idbold: "", iditalic: "", family: "Garamond Modern FS", style: FontStyle.Bold, source: "" },
        { id: "de16c00d-bfd9-4ea7-9f80-0bd0f21386f5", idbolditalic: "", idbold: "", iditalic: "", family: "Garamond Modern FS", style: FontStyle.Italic, source: "" },
        { id: "6b0a68b8-7301-4c64-bb0b-5fbd1d897f8b", idbolditalic: "", idbold: "", iditalic: "", family: "FS Garamond", style: FontStyle.BoldItalic, source: "" },
        { id: "807266ea-be7c-45d8-98e0-893a417e63b3", idbolditalic: "", idbold: "", iditalic: "", family: "FS Garamond", style: FontStyle.Bold, source: "" },
        { id: "801ef97c-16ed-48da-801d-239e776e14ea", idbolditalic: "", idbold: "", iditalic: "", family: "FS Garamond", style: FontStyle.Italic, source: "" },
        { id: "5b4836a0-ab9a-4f3b-b763-366dc37cab6c", idbolditalic: "", idbold: "", iditalic: "", family: "FS Bodoni", style: FontStyle.BoldItalic, source: "" },
        { id: "c04995dd-7586-48f1-a573-7cb0f25d63f4", idbolditalic: "", idbold: "", iditalic: "", family: "FS Bodoni", style: FontStyle.Bold, source: "" },
        { id: "51f5720e-b754-404d-97e9-2d1934f3cdc3", idbolditalic: "", idbold: "", iditalic: "", family: "FS Bodoni", style: FontStyle.Italic, source: "" },
        { id: "5347525d-696f-4bd7-bc6f-f2b79b7944d9", idbolditalic: "", idbold: "", iditalic: "", family: "FS Barbedor", style: FontStyle.BoldItalic, source: "" },
        { id: "7515a3b4-5fdb-4b3f-9b51-9ab4139a0c18", idbolditalic: "", idbold: "", iditalic: "", family: "FS Barbedor", style: FontStyle.Bold, source: "" },
        { id: "daced3f9-a1b7-4af3-8010-73c2bed2ca68", idbolditalic: "", idbold: "", iditalic: "", family: "FS Barbedor", style: FontStyle.Italic, source: "" },
        { id: "a9f4aa1e-e513-4950-88cc-1355e34cf99e", idbolditalic: "", idbold: "", iditalic: "", family: "FS Franklin Gothic Book", style: FontStyle.Italic, source: "" },
        { id: "c2e85f74-a028-42ac-bbfb-afa85e84568f", idbolditalic: "", idbold: "", iditalic: "", family: "FS Engravers Old English", style: FontStyle.Bold, source: "" },
        { id: "2d25170c-6241-4bb1-8da1-a5dddcfe349b", idbolditalic: "", idbold: "", iditalic: "", family: "FS Engravers Gothic", style: FontStyle.Bold, source: "" },
        { id: "233ddcc9-95ca-498e-a480-a2ba543c51a4", idbolditalic: "", idbold: "", iditalic: "", family: "Cheltenham FS Cond", style: FontStyle.BoldItalic, source: "" },
        { id: "31cdd33a-3fd2-4ac1-92c2-a4b869380acf", idbolditalic: "", idbold: "", iditalic: "", family: "Cheltenham FS Cond", style: FontStyle.Bold, source: "" },
        { id: "b2368aa9-844d-4603-a768-f7c919f7672e", idbolditalic: "", idbold: "", iditalic: "", family: "Cheltenham FS Cond", style: FontStyle.Italic, source: "" },
        { id: "ccd5cdb6-3395-4179-9a7e-5f1e0555cd02", idbolditalic: "", idbold: "", iditalic: "", family: "Clarendon FS", style: FontStyle.Bold, source: "" },
        { id: "1486ecee-6fd5-40af-bcf8-200bbb801dab", idbolditalic: "", idbold: "", iditalic: "", family: "Adelon", style: FontStyle.Bold, source: "" }];

    FontDefault: IFont = { id: "", idbold: "", iditalic: "", idbolditalic: "", family: "Arial", style: FontStyle.Regular, source: "" };
}

export const FontManager = new Manager();
