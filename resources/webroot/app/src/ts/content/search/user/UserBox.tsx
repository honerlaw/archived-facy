
import { AppData } from "../../../data/AppData";
import { IUserBoxProps } from "./IUserBoxProps";
import { IUserBoxState } from "./IUserBoxState";
import { UserBoxOptions } from "./option/UserBoxOptions";

import { User } from "../../../data/model/User";
import { Friend } from "../../../data/model/Friend";
import { FriendRequest } from "../../../data/model/FriendRequest";

/**
 * Shows a box displaying information about a user
 *
 * Different options are available for different types of
 * users (friends, requests, invites, etc)
 */
export class UserBox extends React.Component<IUserBoxProps, IUserBoxState> {

    constructor(props: IUserBoxProps) {
        super(props);
        this.state = {
            type: this.getInitialType()
        };
    }

    /**
     * Retreives the initial type of the passed user. (friend, friend request, user)
     */
    private getInitialType(): string {
        if(this.props.model instanceof Friend) {
            return 'friend';
        } else if(this.props.model instanceof FriendRequest) {
            if(this.props.model.getRequestor() === AppData.getUser()) {
                return 'request';
            } else {
                return 'invite';
            }
        }
        return 'user';
    }

    /**
     * Handles the various options for each type of user.
     */
    private option(event) {
        switch($(event.target).attr('value')) {
            case 'send': // send a friend request
                FriendRequest.create(this.props.model.getID(), function(request: FriendRequest) {
                    this.props.model = request;
                    this.setState({
                        type: 'request'
                    });
                    AppData.getUser().getFriendRequests();
                }.bind(this));
                break;
            case 'remove': // remove a friend
                this.props.model.remove(function(user: User) {
                    this.props.model = user;
                    this.setState({
                        type: 'user'
                    });
                    AppData.getUser().getFriends();
                }.bind(this));
                break;
            case 'revoke': // revoke a friend request
                this.props.model.revoke(function(user: User) {
                    this.props.model = user;
                    this.setState({
                        type: 'user'
                    });
                    AppData.getUser().getFriendRequests();
                }.bind(this));
                break;
            case 'accept': // accept a friend request
                this.props.model.accept(function(friend: Friend) {
                    this.props.model = friend;
                    this.setState({
                        type: 'friend'
                    });
                    AppData.getUser().getFriendRequests();
                }.bind(this));
                break;
            case 'deny': // deny a friend request
                this.props.model.deny(function(user: User) {
                    this.props.model = user;
                    this.setState({
                        type: 'user'
                    });
                    AppData.getUser().getFriendRequests();
                }.bind(this));
                break;
        }
    }

    /**
     * Gets the username and profile image to display for the given
     * type of user.
     */
    private getUsernameAndProfileImage(): Object {
        if(this.props.model instanceof Friend) {
            return {
                username : this.props.model.getUser().getUsername(),
                profileImage : this.props.model.getUser().getProfileImage()
            };
        } else if(this.props.model instanceof FriendRequest) {
            if(this.props.model.getRequestor() === AppData.getUser()) {
                return {
                    username : this.props.model.getRequestee().getUsername(),
                    profileImage : this.props.model.getRequestee().getProfileImage()
                };
            } else {
                return {
                    username : this.props.model.getRequestor().getUsername(),
                    profileImage : this.props.model.getRequestor().getProfileImage()
                };
            }
        }
        return {
            username : this.props.model.getUsername(),
            profileImage : this.props.model.getProfileImage()
        };
    }

    /**
     * Display the user box with the correct information / options
     */
    public render() {
        var data: any = this.getUsernameAndProfileImage();
        var style: Object;
        if(data.profileImage !== null) {
            style = { backgroundImage: 'url("' + data.profileImage + '")' };
        }
        return (<div className="col-md-12 content-user-box">
            <div className="profile-picture" style={ style }></div>
            <div className="name">{ data.username }</div>
            <div className="type">
                { this.state.type }
                <div className="option-container">
                    <i className="ion-gear-b"></i>
                    <UserBoxOptions type={this.state.type} option={ e => this.option(e) }/>
                </div>
            </div>
        </div>);
    }

}
