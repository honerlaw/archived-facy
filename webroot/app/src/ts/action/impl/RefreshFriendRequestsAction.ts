
import { FriendRequest } from "../../data/model/FriendRequest";
import { Action } from "../Action";

export class RefreshFriendRequestsAction extends Action {

    constructor(requests: Array<FriendRequest>, invites: Array<FriendRequest>) {
        super({
            requests: requests,
            invites: invites
        });
    }

    public process(): Object {
        return this.getData();
    }

}
