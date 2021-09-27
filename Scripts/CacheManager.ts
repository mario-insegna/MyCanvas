﻿// CacheManager.ts
const maxPositionValue = (obj: ICache[]) => obj.map(v => v.Position).reduce((previous, current) => Math.max(previous, current), 0);

export interface ICache {
    Key: any;
    Data: any;
    CacheType: number;
	Thumbnail: string;
	Position: number;
}

export enum CacheType {
    MyCanvasEditorProject,
    CoversVariables,
	DesktopVariables,
    DirtyStateProject,
    ColorPickers
}

let cacheDataArray: ICache[] = [];

class Cache {

    GetDataFromCache(key: any, cacheType: number) {
        return cacheDataArray.filter((c) => c.Key === key && c.CacheType === cacheType)[0];
    }

    RemoveArrayFromCache(keys: any[], cacheType: number) {
        keys.map((key) => {
            let index = cacheDataArray.findIndex((c) => c.Key === key && c.CacheType === cacheType);
            if (index !== -1) {
                cacheDataArray.splice(index, 1);
            }
        });
    }

    removeDataFromCache(key: any, cacheType: number) {
        var xml = cacheDataArray.filter((c) => c.Key === key && c.CacheType === cacheType)[0];
        if (xml) {
            var index = cacheDataArray.indexOf(xml);
            cacheDataArray.splice(index, 1);
        }
    }

    SetDataToCache(key: any, data: any, cacheType: number) {
		let index = cacheDataArray.findIndex((c) => c.Key === key && c.CacheType === cacheType);
		let position = maxPositionValue(this.GetDataByType(cacheType)) + 1;
		if (index === -1) {
			cacheDataArray.push({ Key: key, Data: data, CacheType: cacheType, Thumbnail: null, Position: position });
        } else {
			cacheDataArray[index] = { Key: key, Data: data, CacheType: cacheType, Thumbnail: null, Position: position };
        }
    }

    SetDataByType(data: any, cacheType: number) {
        let position = maxPositionValue(this.GetDataByType(cacheType)) + 1;
        cacheDataArray.push({ Key: "", Data: data, CacheType: cacheType, Thumbnail: null, Position: position });
    }

    GetDataByType(cacheType: number) {
        return cacheDataArray.filter((c) => c.CacheType === cacheType);
    }

    GetValueFromCache<T>(key: any, cacheType: number): T {
        let data = this.GetDataFromCache(key, cacheType);
        return data ? data.Data as T : null;
	}

    TruncateByLimitAndType(limit: number, cacheType: number) {
        let subset = cacheDataArray.filter((c) => c.CacheType !== cacheType);
		cacheDataArray = this.GetDataByType(cacheType).sort((a, b) => b.Position - a.Position).slice(0, limit).concat(subset);
	}
}

export const CacheManager = new Cache();
