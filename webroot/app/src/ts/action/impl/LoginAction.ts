
import { Action } from "../Action";
import { AppData } from "../../data/AppData";

export class LoginAction extends Action {

    constructor() {
        super();
    }

    public process(): Object {
        return {
            isLoggedIn: true
        };
    }

}
