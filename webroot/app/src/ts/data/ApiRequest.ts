/// <reference path="../../typings/jquery/jquery.d.ts" />

import { ActionDispatcher } from "../action/ActionDispatcher";
import { SearchResultAction } from "../action/impl/SearchResultAction";

import { AppData } from "./AppData";

import { User } from "../data/model/User";
import { Friend } from "../data/model/Friend";
import { FriendRequest } from "../data/model/FriendRequest";

/**
 * Handles sending out api requests
 */
export class ApiRequest {

    public static search(query: string): void {
        if(query.length === 0) {
            return;
        }
        ApiRequest.request('/api/search', 'get', { query : query}, function(data, textStatus, xhr) {
            var friends: Array<Friend> = [];
            data.friends.forEach(function(friend) {
                friends.push(new Friend(friend.friend_id, User.parse(friend)));
            });
            var requests: Array<FriendRequest> = [];
            data.requests.forEach(function(request) {
                requests.push(new FriendRequest(request.friend_request_id, User.parse(request), AppData.getUser()));
            });
            var invites: Array<FriendRequest> = [];
            data.invites.forEach(function(invite) {
                invites.push(new FriendRequest(invite.friend_request_id, AppData.getUser(), User.parse(invite)));
            });
            var users: Array<User> = [];
            data.users.forEach(function(user) {
                users.push(User.parse(user));
            });
            ActionDispatcher.dispatch(new SearchResultAction(friends, requests, invites, users));
        });
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
                if(AppData.getToken().isValid()) {
                    request.setRequestHeader("Authorization", "Bearer " + AppData.getToken().getValue());
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

    public static fileUpload(url: string, data: FormData, success?: (data: any, textStatus?: string, xhr?: JQueryXHR) => any, error?: (xhr: JQueryXHR, textStatus?: string, errorThrown?: string) => any) {
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(request) {
                if(AppData.getToken().isValid()) {
                    request.setRequestHeader("Authorization", "Bearer " + AppData.getToken().getValue());
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
