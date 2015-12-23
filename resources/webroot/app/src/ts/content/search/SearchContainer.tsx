
import { Action } from "../../action/Action";
import { ActionListener } from "../../action/ActionListener";
import { ActionDispatcher } from "../../action/ActionDispatcher";
import { SearchResultAction } from "../../action/impl/SearchResultAction";

import { ISearchContainerState } from "./ISearchContainerState";

import { UserBox } from "./user/UserBox";

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
                <div id="inner-search-result-container">
                    { this.getLabel('users', this.state.users) }
                    { this.state.users.map(function(user) {
                        return <UserBox model={user} />
                    }) }
                    <div style={ { clear: "both" } }></div>
                    { this.getLabel('invites', this.state.invites) }
                    { this.state.invites.map(function(invite) {
                        return <UserBox model={invite} />
                    }) }
                    <div style={ { clear: "both" } }></div>
                    { this.getLabel('requests', this.state.requests) }
                    { this.state.requests.map(function(request) {
                        return <UserBox model={request} />
                    }) }
                    <div style={ { clear: "both" } }></div>
                    { this.getLabel('friends', this.state.friends) }
                    { this.state.friends.map(function(friend) {
                        return <UserBox model={friend}/>
                    }) }
                </div>
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
