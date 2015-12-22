

import { Action } from "../action/Action";
import { ActionListener } from "../action/ActionListener";
import { ActionDispatcher } from "../action/ActionDispatcher";
import { PageRequestAction, PageData } from "../action/impl/PageRequestAction";

import { IContentPanelState} from "./IContentPanelState";

import { SearchContainer } from "./search/SearchContainer";

import { CreateCircle } from "./page/CreateCircle";
import { Invites } from "./page/Invites";
import { Requests } from "./page/Requests";

/**
 * Handles displaying the different types of content correctly
 */
export class ContentPanel extends React.Component<any, IContentPanelState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            pageData: new PageData('')
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
    }

    public componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    public render() {
        return (<div id="app-content">
            <SearchContainer />
            { this.getPage(this.state.pageData.getName()) }
        </div>);
    }

    private getPage(pageName) {
        switch(pageName) {
            case 'createCircle':
                return <CreateCircle data={this.state.pageData.getData()} />;
            case 'invites':
                return <Invites data={this.state.pageData.getData()} />;
            case 'requests':
                return <Requests data={this.state.pageData.getData()} />;
        }
    }

    public performed(action: Action, result: any) {
        if(action instanceof PageRequestAction) {
            this.setState({
                pageData: result
            });
        }
    }

}
