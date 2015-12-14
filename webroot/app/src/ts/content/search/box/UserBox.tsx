
import { Action } from "../../../action/Action";
import { ActionDispatcher } from "../../../action/ActionDispatcher";
import { ApiRequest } from "../../../data/ApiRequest";
import { UserBoxProps } from "./UserBoxProps";

/**
 * Shows a box displaying information about a user
 *
 * Different options are available for different types of
 * users (friends, requests, invites, etc)
 */
export class UserBox extends React.Component<UserBoxProps, {}> {

    constructor(props: UserBoxProps) {
        super(props);
    }

    private option(event) {
        switch(event.target.value) {
            case 'send':
                /*ApiRequest.sendFriendRequest(this.props.id, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("reloadSearch"));
                    ActionDispatcher.dispatch(new Action("reloadFriendRequests"));
                });*/
                break;
            case 'remove':
                /*ApiRequest.removeFriend(this.props.id, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("reloadSearch"));
                    ActionDispatcher.dispatch(new Action("reloadFriends"));
                });*/
                break;
            case 'revoke':
                /*ApiRequest.revokeFriendRequest(this.props.friend_request_id, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("reloadSearch"));
                    ActionDispatcher.dispatch(new Action("reloadFriendRequests"));
                });*/
                break;
            case 'accept':
                /*ApiRequest.acceptFriendRequest(this.props.friend_request_id, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("reloadSearch"));
                    ActionDispatcher.dispatch(new Action("reloadFriendRequests"));
                });*/
                break;
            case 'deny':
                /*ApiRequest.denyFriendRequest(this.props.friend_request_id, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("reloadSearch"));
                    ActionDispatcher.dispatch(new Action("reloadFriendRequests"));
                });*/
                break;
        }
    }

    public render() {
        var options = (<select onChange={ e => this.option(e) }>
            <option>Options</option>
            <option value="send">Send Friend Request</option>
        </select>);
        if(this.props.type == 'friend') {
            options = (<select onChange={ e => this.option(e) }>
                <option>Options</option>
                <option value="remove">Remove Friend</option>
            </select>);
        } else if(this.props.type == 'request') {
            options = (<select onChange={ e => this.option(e) }>
                <option>Options</option>
                <option value="revoke">Revoke Friend Request</option>
            </select>);
        } else if(this.props.type == 'invite') {
            options = (<select onChange={ e => this.option(e) }>
                <option>Options</option>
                <option value="accept">Accept Friend Request</option>
                <option value="deny">Deny Friend Request</option>
            </select>);
        }

        return (<div className="col-md-12 content-user-box">
            <div className="profile-picture" style={ { backgroundImage: 'url("' + this.props.profileImage + '")' } }></div>
            <div className="name">{ this.props.username }</div>
            <div className="options">
                { options }
            </div>
        </div>);
    }

}
