
import { User } from "./User";
import { ApiRequest } from "../ApiRequest";

export class Friend {

    private id: number;

    private user: User;

    constructor(id: number, user: User) {
        this.id = id;
        this.user = user;
    }

    public remove() {
        ApiRequest.request("/api/friend/delete/" + this.user.getID(), "delete", {}, function(data, status, xhr) {

        });
    }

    public getID(): number {
        return this.id;
    }

    public getUser(): User {
        return this.user;
    }

}
