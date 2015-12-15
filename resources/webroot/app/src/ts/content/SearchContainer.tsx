
import { Action } from "../action/Action";
import { ActionListener } from "../action/ActionListener";
import { ActionDispatcher } from "../action/ActionDispatcher";
import { SearchResultAction } from "../action/impl/SearchResultAction";

import { ISearchContainerState } from "./ISearchContainerState";

import { UserBox } from "./search/box/UserBox";

export class SearchContainer extends React.Component<any, ISearchContainerState> implements ActionListener {

    constructor(props: any) {
        super(props);
        this.state = {
            friends: [],
            requests: [],
            invites: [],
            users: []
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
    }

    public componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    private close(event) {
        event.preventDefault();
        this.setState({
            friends: [],
            requests: [],
            invites: [],
            users: []
        });
    }

    public render() {
        var resultLabel;
        if(this.state.users.length > 0 || this.state.requests.length > 0 || this.state.invites.length > 0 || this.state.users.length > 0) {
            resultLabel = <label id="search-result-label">Search Results<div onClick={ e => this.close(e) }>hide</div></label>;
        }
        return (<div>
            <div id="search-result-container">
                { resultLabel }
                { this.getLabel('users', this.state.users) }
                { this.state.users.map(function(user) {
                    return <UserBox type="user" id={user.getID()} username={user.getUsername()} profileImage={user.getProfileImage()} />
                }) }
                <div style={ { clear: "both" } }></div>
                { this.getLabel('invites', this.state.invites) }
                { this.state.invites.map(function(invite) {
                    return <UserBox type="friend" id={invite.getRequestee().getID()} username={invite.getRequestee().getUsername()} profileImage={invite.getRequestee().getProfileImage()} />
                }) }
                <div style={ { clear: "both" } }></div>
                { this.getLabel('requests', this.state.requests) }
                { this.state.requests.map(function(request) {
                    return <UserBox type="friend" id={request.getRequestor().getID()} username={request.getRequestor().getUsername()} profileImage={request.getRequestor().getProfileImage()} />
                }) }
                <div style={ { clear: "both" } }></div>
                { this.getLabel('friends', this.state.friends) }
                { this.state.friends.map(function(friend) {
                    return <UserBox type="friend" id={friend.getUser().getID()} username={friend.getUser().getUsername()} profileImage={friend.getUser().getProfileImage()} />
                }) }
            </div>
        </div>);
    }

    public getLabel(label: string, data: Array<any>) {
        if(data.length > 0) {
            return <label>{label}</label>;
        }
        return null;
    }

    public performed(action: Action, result: any): void {
        if(action instanceof SearchResultAction) {
            this.setState(result);
        }
    }

}
