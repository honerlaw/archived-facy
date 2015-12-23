
import { Action } from "../../../action/Action";
import { ActionListener } from "../../../action/ActionListener";
import { ActionDispatcher } from "../../../action/ActionDispatcher";
import { RefreshFriendRequestsAction } from "../../../action/impl/RefreshFriendRequestsAction";

import { IPageProps } from "../IPageProps";
import { IInvitesRequestsState } from "./IInvitesRequestsState";
import { UserBox } from "../../search/user/UserBox";

export class Invites extends React.Component<IPageProps, IInvitesRequestsState> implements ActionListener {

    constructor(props: IPageProps) {
        super(props);
        this.state = {
            invites: props.data
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
            <h1>Invites</h1>
            { this.state.invites.map(function(invite) {
                return <UserBox model={invite} />;
            }) }
        </div>);
    }

}
