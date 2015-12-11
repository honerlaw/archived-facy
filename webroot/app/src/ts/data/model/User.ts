
import { Friend } from "./Friend";
import { FriendRequest } from "./FriendRequest";
import { ApiRequest } from "../ApiRequest";

export class User {

    private id: number;
    private username: string;
    private created: string;

    constructor(id: number, username: string, created: string) {
        this.id = id;
        this.username = username;
        this.created = created;
    }

    public static create(username: string, password: string, verifyPassword: string, callback: (user: User) => any): void {
        ApiRequest.request("/api/user/create", "post", { username: username, password: password, verifyPassword: verifyPassword }, function(data, status, xhr) {
            // create a new user given the data we retreived
        });
    }

    public static load(callback: (user: User) => any): void {
        ApiRequest.request("/api/user/profile", "get", {}, function(data, status, xhr) {
            // create a new user given the data we retreive back
        });
    }

    public getFriends(callback: (friends: Array<Friend>) => any) {
        ApiRequest.request("/api/friend", "get", {}, function(data, status, xhr) {
            // we get a list of friends
            // we convert this into a list of friend objects
        });
    }

    public getRequests(callback: (requests: Array<FriendRequest>, invites: Array<FriendRequest>) => any) {
        ApiRequest.request("/api/friend/request", "get", {}, function(data, status, xhr) {
            // we get a list of invites and requests
            // convert this list into two lists
            // one contains an array of friend request objects acting as the invites,
            // the other as an array of requests
        });
    }

    public getID() {
        return this.id;
    }

}
