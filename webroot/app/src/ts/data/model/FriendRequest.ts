
import { User } from "./User";
import { ApiRequest } from "../ApiRequest";

export class FriendRequest {

    private id: number;

    private requestee: User;

    private requestor: User;

    constructor(id: number, requestee: User, requestor: User) {
        this.id = id;
        this.requestee = requestee;
        this.requestor = requestor;
    }

    public static send(userId: number) {
        ApiRequest.request("/api/friend/request/send/" + userId, "post", {}, function(data, status, xhr) {
            // convert the returned data into a new friend request data block
        });
    }

    public revoke(callback: () => any) {
        ApiRequest.request("/api/friend/request/revoke/" + this.id, "delete", {}, function(data, status, xhr) {
            callback();
        });
    }

    public accept(callback: () => any) {
        ApiRequest.request("/api/friend/request/accept/" + this.id, "post", {}, function(data, status, xhr) {
            callback();
        });
    }

    public deny(callback: () => any) {
        ApiRequest.request("/api/friend/request/deny/" + this.id, "delete", {}, function(data, status, xhr) {
            callback();
        });
    }



}
