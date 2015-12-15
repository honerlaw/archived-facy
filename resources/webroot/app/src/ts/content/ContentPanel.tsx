
import { SearchContainer } from "./search/SearchContainer";

/**
 * Handles displaying the different types of content correctly
 */
export class ContentPanel extends React.Component<any, {}> {

    constructor(props : any) {
        super(props);
        this.state = {};
    }

    public render() {
        return (<div id="app-content">
            <SearchContainer />
        </div>);
    }

}
