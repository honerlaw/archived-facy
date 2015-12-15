
import { User } from "../../data/model/User";
import { Friend } from "../../data/model/Friend";
import { FriendRequest } from "../../data/model/FriendRequest";

export interface ISearchContainerState {
    friends: Array<Friend>,
    requests: Array<FriendRequest>,
    invites: Array<FriendRequest>,
    users: Array<User>
}
