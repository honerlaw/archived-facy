
import { Friend } from "../data/model/Friend";
import { FriendRequest } from "../data/model/FriendRequest";
import { Circle } from "../data/model/Circle";

export interface INavPanelState {
    friends?: Array<Friend>,
    invites?: Array<FriendRequest>,
    requests?: Array<FriendRequest>,
    circles?: Array<Circle>
}
