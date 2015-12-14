
import { AppData } from "./data/AppData";
import { ApiRequest } from "./data/ApiRequest";

import { ProfileData } from "./nav/ProfileData";

import { ActionDispatcher } from "./action/ActionDispatcher";
import { ActionListener } from "./action/ActionListener";
import { Action } from "./action/Action";
import { LogoutAction } from "./action/impl/LogoutAction";
import { RefreshFriendsAction } from "./action/impl/RefreshFriendsAction";
import { RefreshFriendRequestsAction} from "./action/impl/RefreshFriendRequestsAction";

import { INavState } from "./INavState";

/**
 * Handles navigation of the application (as well as requesting data / dispatching
 * actions when needed)
 */
export class Nav extends React.Component<any, INavState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            friends: [],
            invites: [],
            requests: []
        };
    }

    /**
     * Load any of the data that we need to display before the component
     * mounts
     */
    private componentWillMount() {
        ActionDispatcher.register(this);
        AppData.getUser().getFriends();
        AppData.getUser().getFriendRequests();
    }

    /**
     * Deregister the action listener from the action dispatcher
     */
    private componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    /**
     * Do a search request
     */
    private search(event) {
        ApiRequest.search(event.target.value);
    }

    /**
     * Load friends list
     */
    private friends(event) {
        event.preventDefault();
        AppData.getUser().getFriends();
    }

    /**
     * Sends request to reload friend requests
     */
    private invites(event) {
        event.preventDefault();
        AppData.getUser().getFriendRequests();
    }

    /**
     * Sends request to reload friend invites
     */
    private requests(event) {
        event.preventDefault();
        AppData.getUser().getFriendRequests();
    }

    /**
     * Sends request to log user out of the application
     */
    private logout(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new LogoutAction());
    }

    /**
     * Intercept dispatched actions and handle them appropriately
     */
    public performed(action: Action, result: any) {
        if(action instanceof RefreshFriendsAction || action instanceof RefreshFriendRequestsAction) {
            this.setState(result);
        }
    }

    /**
     * Render the view for the navigation menu
     */
    public render() {
        return (<div id="app-nav">
            <input type="text" placeholder="Search" onKeyUp={ e => this.search(e) } />
            <ProfileData />
            <div id="nav-links">
                <label>Friends</label>
                <a href="#" onClick={ e => this.friends(e) }>All <i>{ this.state.friends.length }</i></a>
                <a href="#" onClick={ e => this.invites(e) }>Invites <i>{ this.state.invites.length }</i></a>
                <a href="#" onClick={ e => this.requests(e) }>Requests <i>{ this.state.requests.length }</i></a>
                <label>Circles</label>
                <label>Settings</label>
                <a href="#" onClick={ e => this.logout(e) }>Logout</a>
            </div>
        </div>);
    }

}
