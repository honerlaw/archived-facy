/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

import { AppData } from "./AppData";

/**
 * Handles sending out api requests
 */
export class ApiRequest {

    /**
     * Sends a request to generate a new token for the given user credentials
     */
    public static newToken(data: Object, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/token/new", "post", data, success, error);
    }

    /**
     * Sends a request to create a new user
     */
    public static createUser(data: Object, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/user/create", "post", data, success, error);
    }

    /**
     * Retrieve all of the profile information for the current logged in user
     */
    public static getProfile(success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/user/profile", "get", {}, success, error);
    }

    /**
     * Get all of the friends this user has
     */
    public static getFriends(success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend", "get", {}, success, error);
    }

    /**
     * Get all of the friend requests / invites this user has
     */
    public static getFriendRequests(success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/request", "get", {}, success, error);
    }

    /**
     * Send a search request
     */
    public static search(query: string, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/search", "get", { query: query }, success, error);
    }

    /**
     * Send a friend request to the given user with the given id
     */
    public static sendFriendRequest(id: number, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/request/send/" + id, "post", {}, success, error);
    }

    /**
     * Revoke a sent friend request
     */
    public static revokeFriendRequest(id: number, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/request/revoke/" + id, "delete", {}, success, error);
    }

    /**
     * Accept a friend request from another user
     */
    public static acceptFriendRequest(id: number, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/request/accept/" + id, "post", {}, success, error);
    }

    /**
     * Deny a friend request from another user
     */
    public static denyFriendRequest(id: number, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/request/deny/" + id, "delete", {}, success, error);
    }

    /**
     * Removes a friend
     */
    public static removeFriend(id: number, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        this.request("/api/friend/delete/" + id, "delete", {}, success, error);
    }

    /**
     * Wrap around the jquery ajax request so that we can inject the JWT if
     * the token is set.
     *
     * @param {string} url
     */
    private static request(url: string, type: string, data: Object, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
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
