
import { Action } from "./action/Action";
import { ActionListener } from "./action/ActionListener";
import { ActionDispatcher } from "./action/ActionDispatcher";

import { SearchContainer } from "./content/SearchContainer";

import { IContentState } from "./IContentState";

/**
 * Handles displaying the different types of content correctly
 */
export class Content extends React.Component<any, IContentState> implements ActionListener {

    constructor(props : any) {
        super(props);

        // how do we handle this
        // basically we have two different things we want to do
        // notify to display a type of panel
        // display the content of that panel
        // so an action is sent to display panel friends
        // we want to keep track of the active panel
        // so we can detect changes to the data on the panel as is needed
        // through the action listener.

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
            <SearchContainer />
        </div>);
    }

    public performed(action: Action, result: any) {

    }

}