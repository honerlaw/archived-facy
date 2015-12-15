
import { Action } from "../Action";

import { User } from "../../data/model/User";
import { Friend } from "../../data/model/Friend";
import { FriendRequest } from "../../data/model/FriendRequest";

export class SearchResultAction extends Action {

    constructor(friends: Array<Friend>, requests: Array<FriendRequest>, invites: Array<FriendRequest>, users: Array<User>) {
        super({
            friends: friends,
            requests: requests,
            invites: invites,
            users: users
        });
    }

    public process(): any {
        return this.getData();
    }

}
