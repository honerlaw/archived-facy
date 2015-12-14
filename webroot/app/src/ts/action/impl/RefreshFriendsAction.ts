
import { Friend } from "../../data/model/Friend";
import { Action } from "../Action";

export class RefreshFriendsAction extends Action {

    constructor(friends: Array<Friend>) {
        super(friends);
    }

    public process(): Object {
        return {
            friends: this.getData()
        };
    }

}
