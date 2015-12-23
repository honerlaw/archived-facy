
import { Action } from "../../../action/Action";
import { ActionListener } from "../../../action/ActionListener";
import { ActionDispatcher } from "../../../action/ActionDispatcher";
import { RefreshFriendRequestsAction } from "../../../action/impl/RefreshFriendRequestsAction";

import { IPageProps } from "../IPageProps";
import { IInvitesRequestsState } from "./IInvitesRequestsState";
import { UserBox } from "../../search/user/UserBox";

export class Requests extends React.Component<IPageProps, IInvitesRequestsState> implements ActionListener {

    constructor(props: IPageProps) {
        super(props);
        this.state = {
            requests: props.data
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
        return (<div>
            <h1>Requests</h1>
            { this.state.requests.map(function(request) {
                return <UserBox model={request} />;
            }) }
        </div>);
    }

}
