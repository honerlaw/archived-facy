
import { Friend } from "../../../data/model/Friend";

export interface ICreateCircleState {
    title?: string,
    description?: string,
    friends?: Array<Friend>
}
