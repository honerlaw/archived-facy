
import { AppData } from "./util/AppData";
import { ApiRequest } from "./util/ApiRequest";
import { Action } from "./action/Action";
import { ActionDispatcher } from "./action/ActionDispatcher";
import { ActionListener } from "./action/ActionListener";

/**
 * This component is all about handling the navigation system and basically
 * sending out actions when specific actions by the user are done (e.g. if
 * the user clicks on list friends then we upload the content panel with
 * a list of friends)
 */
export class Nav extends React.Component<any, NavState> implements ActionListener {

    private query: string = '';

    constructor(props : any) {
        super(props);
        this.state = {
            profileId: -1,
            username: '',
            created: '',
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
        ActionDispatcher.dispatch(new Action("reloadProfile"));
        ActionDispatcher.dispatch(new Action("reloadFriends"));
        ActionDispatcher.dispatch(new Action("reloadFriendRequests"));
    }

    private componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    private search(event) {
        this.query = event.target.value;
        ActionDispatcher.dispatch(new Action("reloadSearch"));
    }

    private friendsList(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new Action("friendList", this.state.friends));
    }

    private friendsInvite(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new Action("friendInvites", this.state.invites));
    }

    private friendsRequests(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new Action("friendRequests", this.state.requests));
    }

    private circlesCreate(event) {
        event.preventDefault();
        ActionDispatcher.dispatch(new Action("circleCreate"));
    }

    private logout(event) {
        event.preventDefault();
        AppData.setToken(null);
        ActionDispatcher.dispatch(new Action("logout"));
    }

    public performed(action: Action) {
        var self = this;
        switch(action.getType()) {
            case "reloadSearch":
                if(this.query.length == 0) {
                    return;
                }
                ApiRequest.search(this.query, function(data, textStatus, xhr) {
                    ActionDispatcher.dispatch(new Action("searchResults", data));
                });
                break;
            case "reloadFriends":
                ApiRequest.getFriends(function(data, textStatus, xhr) {
                    self.setState({
                        friends: data.friends
                    });
                });
                break;
            case "reloadFriendRequests":
                ApiRequest.getFriendRequests(function(data, textStatus, xhr) {
                    self.setState({
                        invites: data.invites,
                        requests: data.requests
                    });
                });
                break;
            case "reloadProfile":
                ApiRequest.getProfile(function(data, textStatus, xhr) {
                    self.setState({
                        profileId: data.id,
                        username: data.username,
                        created: data.created
                    });
                });
                break;
        }
    }

    public render() {
        return (<div id="app-nav">
            <input type="text" placeholder="Search" onKeyUp={ e => this.search(e) } />
            <div id="profile-picture"></div>
            <div id="name">{ this.state.username }</div>
            <div id="nav-links">
                <label>Friends</label>
                <a href="#" onClick={ e => this.friendsList(e) }>All <i>{ this.state.friends.length }</i></a>
                <a href="#" onClick={ e => this.friendsInvite(e) }>Invites <i>{ this.state.invites.length }</i></a>
                <a href="#" onClick={ e => this.friendsRequests(e) }>Requests <i>{ this.state.requests.length }</i></a>
                <label>Circles</label>
                <a href="#" onClick={ e => this.circlesCreate(e) }>Create</a>
                <label>Settings</label>
                <a href="#" onClick={ e => this.logout(e) }>Logout</a>
            </div>
        </div>);
    }

}
