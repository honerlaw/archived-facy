
import { AppData } from "../data/AppData";
import { ApiRequest } from "../data/ApiRequest";
import { Circle } from "../data/model/Circle";

import { ActionDispatcher } from "../action/ActionDispatcher";
import { ActionListener } from "../action/ActionListener";
import { Action } from "../action/Action";
import { LogoutAction } from "../action/impl/LogoutAction";
import { RefreshFriendsAction } from "../action/impl/RefreshFriendsAction";
import { RefreshFriendRequestsAction} from "../action/impl/RefreshFriendRequestsAction";
import { PageRequestAction, PageData } from "../action/impl/PageRequestAction";
import { RefreshCirclesAction } from "../action/impl/RefreshCirclesAction";

import { INavPanelState } from "./INavPanelState";
import { ProfileData } from "./profile/ProfileData";

/**
 * Handles navigation of the application (as well as requesting data / dispatching
 * actions when needed)
 */
export class NavPanel extends React.Component<any, INavPanelState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            friends: [],
            invites: [],
            requests: [],
            circles: []
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
        AppData.getUser().getCircles();
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
        ActionDispatcher.dispatch(new PageRequestAction(new PageData('invites', this.state.invites)));
        AppData.getUser().getFriendRequests();
    }

    /**
     * Sends request to reload friend invites
     */
    private requests(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new PageRequestAction(new PageData('requests', this.state.requests)));
        AppData.getUser().getFriendRequests();
    }

    /**
     * Sends request to view the request circle page
     */
    private createCircle(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new PageRequestAction(new PageData('createCircle')));
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
        if(action instanceof RefreshFriendsAction || action instanceof RefreshFriendRequestsAction || action instanceof RefreshCirclesAction) {
            this.setState(result);
        }
    }

    /**
     * Render the view for the navigation menu
     */
    public render() {
        return (<div id="app-nav">
            <ProfileData />
            <input type="text" placeholder="Search" onKeyUp={ e => this.search(e) } />
            <div id="nav-links">
                <label>Requests</label>
                <a href="#" onClick={ e => this.invites(e) }>Invites <i>{ this.state.invites.length }</i></a>
                <a href="#" onClick={ e => this.requests(e) }>Requests <i>{ this.state.requests.length }</i></a>
                <label>Circles<a href="#" onClick={ e => this.createCircle(e) }>+</a></label>
                { this.showCircles() }
                <label>Settings</label>
                <a href="#" onClick={ e => this.logout(e) }>Logout</a>
            </div>
        </div>);
    }

    private showCircles() {
        var defaults;
        if(this.state.friends.length > 0 ) {
            defaults = <a href="#" onClick={ e => this.friends(e) }>Friends <i>{ this.state.friends.length }</i></a>;
        }
        return (<div>
            { defaults }
            { this.state.circles.map(function(circle: Circle) {
                return <a href="#">{ circle.getTitle() }</a>;
            })}
        </div>);

    }

}
