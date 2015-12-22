
import { Circle } from "../../data/model/Circle";
import { Action } from "../Action";

export class RefreshCirclesAction extends Action {

    constructor(circles: Array<Circle>) {
        super(circles);
    }

    public process(): Object {
        return {
            circles: this.getData()
        };
    }

}
