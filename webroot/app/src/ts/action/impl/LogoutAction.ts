
import { Action } from "../Action";
import { AppData } from "../../data/AppData";

export class LogoutAction extends Action {

    constructor() {
        super();
    }

    public process(): Object {
        AppData.getToken().remove();
        return {
            isLoggedIn: false
        };
    }

}
