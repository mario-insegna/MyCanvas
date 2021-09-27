// ImageUsage.ts
import { CacheManager, CacheType } from "./CacheManager";
import { Subscribers, EvenType } from "./Subscribers";

export interface IImageUsage {
    ImageUsageId: number;
    ImageId: string;
    PageId: number;
    Sequence: number;
}

let imageUsagesContainer: IImageUsage[] = [];

class _ImageUsage {
    init(data: IImageUsage[]) {
        imageUsagesContainer = data;        
    }

    addImage(id: any) {
        let image = this.buildImage(id);
        let index = imageUsagesContainer.findIndex((i) => i.ImageId === image.ImageId && i.Sequence === image.Sequence);
        if (index === -1) {
            imageUsagesContainer.push(image);
            Subscribers.UpdateSubscribers(EvenType.MyPhotoChanged);
        }
    }

    deleteImage(id: any) {
        let image = this.buildImage(id);
        var element = imageUsagesContainer.filter((i) => i.ImageId === image.ImageId && i.Sequence === image.Sequence)[0];
        if (element) {
            var index = imageUsagesContainer.indexOf(element);
            imageUsagesContainer.splice(index, 1);
            Subscribers.UpdateSubscribers(EvenType.MyPhotoChanged);
        }
    }

    buildImage(id: any): IImageUsage {
        return {
            ImageUsageId: 0,
            ImageId: id,
            PageId: CacheManager.GetValueFromCache<number>("currentPageId", CacheType.CoversVariables),
            Sequence: CacheManager.GetValueFromCache<number>("currentPageSequence", CacheType.CoversVariables)
        }
    }

    buildTooltip(imageId: any) {
        var elements = imageUsagesContainer.filter((i) => i.ImageId === imageId);
        if (elements.length) {
            return `This photo is used on page(s): ${elements.map(x => (x.Sequence === 0 ? "Cover" : x.Sequence)).join(", ")}`;
        }
        return "";
    }

}

export const ImageUsage = new _ImageUsage();