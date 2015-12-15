
import { User } from "./User";
import { Friend } from "./Friend";
import { ApiRequest } from "../ApiRequest";
import { AppData } from "../AppData";

export class FriendRequest {

    private id: number;

    private requestee: User;

    private requestor: User;

    constructor(id: number, requestee: User, requestor: User) {
        this.id = id;
        this.requestee = requestee;
        this.requestor = requestor;
    }

    public static create(userId: number, callback: (request: FriendRequest) => void) {
        ApiRequest.request("/api/friend/request/send/" + userId, "post", {}, function(data, status, xhr) {
            callback(new FriendRequest(data.request.friend_request_id, User.parse(data.request), AppData.getUser()));
        });
    }

    public revoke(callback: (user: User) => any) {
        ApiRequest.request("/api/friend/request/revoke/" + this.id, "delete", {}, function(data, status, xhr) {
            callback(this.getRequestee());
        }.bind(this));
    }

    public accept(callback: (friend: Friend) => any) {
        ApiRequest.request("/api/friend/request/accept/" + this.id, "post", {}, function(data, status, xhr) {
            callback(new Friend(data.friend.friend_id, User.parse(data.friend)));
        }.bind(this));
    }

    public deny(callback: (user: User) => any) {
        ApiRequest.request("/api/friend/request/deny/" + this.id, "delete", {}, function(data, status, xhr) {
            callback(this.getRequestor());
        }.bind(this));
    }

    public getID(): number {
        return this.id;
    }

    public getRequestee(): User {
        return this.requestee;
    }

    public getRequestor(): User {
        return this.requestor;
    }

}
