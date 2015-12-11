/// <reference path="../../typings/jquery/jquery.d.ts" />

import { AppData } from "./AppData";

/**
 * Handles sending out api requests
 */
export class ApiRequest {

    /**
     * Send a search request
     */
    public static search(query: string, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/search", "get", { query: query }, success, error);
    }

    /**
     * Wrap around the jquery ajax request so that we can inject the JWT if
     * the token is set.
     *
     * @param {string} url
     */
    public static request(url: string, type: string, data: Object, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        $.ajax({
            url: url,
            type: type,
            data: type == "get" ? data : JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            beforeSend: function(request) {
                if(AppData.getToken() !== undefined) {
                    request.setRequestHeader("Authorization", "Bearer " + AppData.getToken());
                }
            },
            success: function(data, textStatus, xhr) {
                if(success !== undefined) {
                    success(data, textStatus, xhr);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                if(error !== undefined) {
                    error(xhr, textStatus, errorThrown);
                }
                alert(errorThrown);
            }
        });
    }

}
