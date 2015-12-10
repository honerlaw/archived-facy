/// <reference path="./typing/content-state.d.ts" />

import { Action } from "./action/Action";
import { ActionListener } from "./action/ActionListener";
import { ActionDispatcher } from "./action/ActionDispatcher";
import { BoxContainer } from "./content/search/BoxContainer";

export class Content extends React.Component<any, ContentState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            friends: [],
            invites: [],
            requests: [],
            users: []
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
    }

    public componentWillUnmount() {
        ActionDispatcher.register(this);
    }

    public render() {
        return (<div>
            <BoxContainer title={"Users"} type={0} data={this.state.users} />
            <BoxContainer title={"Friends"} type={1} data={this.state.friends} />
            <BoxContainer title={"Invites"} type={2} data={this.state.invites} />
            <BoxContainer title={"Requests"} type={3} data={this.state.requests} />
        </div>);
    }

    public performed(action: Action) {
        switch(action.getType()) {
            case "searchResults":
                this.setState({
                    friends: action.getData().friends,
                    invites: action.getData().invites,
                    requests: action.getData().requests,
                    users: action.getData().users
                });
                break;
            case "friendList":
                this.setState({
                    friends: action.getData(),
                    invites: [],
                    requests: [],
                    users: []
                });
                break;
            case "friendInvites":
                this.setState({
                    friends: [],
                    invites: action.getData(),
                    requests: [],
                    users: []
                });
                break;
            case "friendRequests":
                this.setState({
                    friends: [],
                    invites: [],
                    requests: action.getData(),
                    users: []
                });
                break;
            case "circleCreate":
                break;
        }
    }

}
