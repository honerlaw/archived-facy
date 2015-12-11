
import { User } from "./User";
import { ApiRequest } from "../ApiRequest";

export class Friend {

    private user: User;

    constructor(user: User) {
        this.user = user;
    }

    public remove() {
        ApiRequest.request("/api/friend/delete/" + this.user.getID(), "delete", {}, function(data, status, xhr) {

        });
    }

}
