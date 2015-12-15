
import { Friend } from "./Friend";
import { FriendRequest } from "./FriendRequest";
import { ApiRequest } from "../ApiRequest";
import { AppData } from "../AppData";
import { ActionDispatcher } from "../../action/ActionDispatcher";
import { RefreshFriendsAction } from "../../action/impl/RefreshFriendsAction";
import { RefreshFriendRequestsAction } from "../../action/impl/RefreshFriendRequestsAction";

export class User {

    private id: number;
    private username: string;
    private created: string;
    private profileImage: string;

    constructor(id: number, username: string, profileImage: string, created: string) {
        this.id = id;
        this.username = username;
        this.profileImage = profileImage;
        this.created = created;
    }

    /**
     * Parses the data into a new user object
     */
    public static parse(data: any): User {
        return new User(data.id, data.username, data.profile_image, data.created);
    }

    /**
     * Sends a request to the server to create a new user.
     */
    public static create(username: string, password: string, verifyPassword: string, callback: (user: User) => any): void {
        ApiRequest.request("/api/user/create", "post", { username: username, password: password, verifyPassword: verifyPassword }, function(data, status, xhr) {
            AppData.setUser(User.parse(data));
            AppData.getToken().setValue(data.token);
        });
    }

    /**
     * Gets a user's information given their password and username (basically login)
     */
    public static get(username: string, password: string, callback: (user: User) => any): void {
        ApiRequest.request("/api/token/new", "post", { username: username, password: password }, function(data, status, xhr) {
            AppData.getToken().setValue(data.token);
            User.load(callback);
        });
    }

    /**
     * Load the data about the current logged in user
     */
    public static load(callback: (user: User) => any) {
        if(!AppData.getToken().isValid()) {
            throw new Error("Token must be set to load user information.");
        }
        ApiRequest.request("/api/user/profile", "get", {}, function(data, status, xhr) {
            AppData.setUser(User.parse(data));
            callback(AppData.getUser());
        }, function(xhr, status, error) {
            callback(null);
        });
    }

    /**
     * Retreives a list of friends for this given user
     */
    public getFriends(callback?: (friends: Array<Friend>) => any) {
        ApiRequest.request("/api/friend", "get", {}, function(data, status, xhr) {
            var friends: Array<Friend> = [];
            data.friends.forEach(function(friend) {
                friends.push(new Friend(friend.friend_id, User.parse(friend)));
            });
            ActionDispatcher.dispatch(new RefreshFriendsAction(friends));
            if(callback !== undefined) {
                callback(friends);
            }
        });
    }

    /**
     * Retreives a list of friend requests and invites for this user
     */
    public getFriendRequests(callback?: (requests: Array<FriendRequest>, invites: Array<FriendRequest>) => any) {
        ApiRequest.request("/api/friend/request", "get", {}, function(data, status, xhr) {
            var requests: Array<FriendRequest> = [];
            var invites: Array<FriendRequest> = [];
            data.requests.forEach(function(request) {
                var requestee: User = User.parse(request);
                requests.push(new FriendRequest(request.friend_request_id, requestee, AppData.getUser()));
            });
            data.invites.forEach(function(invite) {
                var requestor: User = User.parse(invite);
                invites.push(new FriendRequest(invite.friend_request_id, AppData.getUser(), requestor));
            });
            ActionDispatcher.dispatch(new RefreshFriendRequestsAction(requests, invites));
            if(callback !== undefined) {
                callback(requests, invites);
            }
        });
    }

    public getID(): number {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getProfileImage(): string {
        return this.profileImage;
    }

    public setProfileImage(profileImage: string) {
        this.profileImage = profileImage;
    }

    public getCreated(): string {
        return this.created;
    }

}
