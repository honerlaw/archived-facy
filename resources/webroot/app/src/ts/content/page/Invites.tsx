
import { Action } from "../../action/Action";
import { ActionListener } from "../../action/ActionListener";
import { ActionDispatcher } from "../../action/ActionDispatcher";
import { RefreshFriendRequestsAction } from "../../action/impl/RefreshFriendRequestsAction";

import { IPageProps } from "./IPageProps";
import { IInvitesRequestsState } from "./IInvitesRequestsState";

export class Invites extends React.Component<IPageProps, IInvitesRequestsState> implements ActionListener {

    constructor(props: IPageProps) {
        super(props);
        this.state = {
            requests: [],
            invites: []
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
    }

    public componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    public performed(action: Action, results: any) {
        if(action instanceof RefreshFriendRequestsAction) {
            this.setState(results);
        }
    }

    public render() {
        return (<div>invites page { this.state.invites.length }</div>);
    }

}
