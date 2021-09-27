import "whatwg-fetch";
import {ObjectAssign} from "./Polyfills";
import { ApplicationScope } from "./ApplicationScope";

class Fetcher {

    /*
    static post(url: string, params?: any, init?: RequestInit);
    static postJson(url: string, params?: any, init?: RequestInit);
     */

    static get(url: string, data?: Array<[string, any]>, init?: RequestInit): Promise<Response> {
        return Fetcher.innerGet(Fetcher.buildFullUrl(url, data), init);
    }
    static getJson(url: string, data?: Array<[string, any]>, init?: RequestInit): Promise<Response> {
        return Fetcher.get(url, data, ObjectAssign(this.buildDefaultJsonInit(), init))
            .then(response => response.json());
    }
    static post(url: string, data?: any, init?: RequestInit): Promise<Response> {
        return Fetcher.innerPost(url, data, init);
    }
    static postJson(url: string, data?: any, init?: RequestInit): Promise<Response> {
        return Fetcher.post(url, data, ObjectAssign(this.buildDefaultJsonInit(), init))
            .then(response => response.json());
    }

    private static innerGet(url: string, init?: RequestInit): Promise<Response> {
        ApplicationScope.toggleSpinner(true);
        return fetch(url, ObjectAssign(this.buildDefaultInit(), init))
            .then(this.checkStatus);
    }
    private static innerPost(url: string, data?: any, init?: RequestInit): Promise<Response> {
        ApplicationScope.toggleSpinner(true);
        return fetch(url, ObjectAssign(ObjectAssign(this.buildDefaultInit(),
            {
                method: "POST",
                body: JSON.stringify(data)
            }), init))
            .then(this.checkStatus);
    }

    private static buildDefaultInit(): RequestInit {
        return {
            credentials: 'same-origin',
            method: "GET"
        };
    }
    private static buildDefaultJsonInit(): RequestInit {
        return {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
    }
    private static buildFullUrl(url: string, data?: Array<[string, any]>): string {
        let queryString: string = "";

        if (data && data.length > 0) {
            data.map((item: [string, any], i: number) => {
                queryString += `&${encodeURIComponent(item[0])}=${encodeURIComponent(item[1])}`;
            });

            queryString = `?${queryString.substr(1)}`;
        }

        return url + queryString;
    }
    private static checkStatus(response:Response) : Response {
        ApplicationScope.toggleSpinner(false);
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new ResponseError(response.statusText);
            error.response = response;
            throw error;
        }
    }

}

class ResponseError extends Error {
    response: Response;
}

export { Fetcher }