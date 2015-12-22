
import { IPageProps } from "./IPageProps";

interface ICreateCircleState {
    results: Array<any>
}

export class CreateCircle extends React.Component<IPageProps, ICreateCircleState> {

    constructor(props: IPageProps) {
        super(props);
        this.state = {
            results: []
        };
    }

    private search(event) {
        this.setState({
            results: [0, 1]
        });
    }

    public render() {
        return (<div id="create-circle-page">
            <label>Circle Name</label>
            <input type="text" />
            <label>Circle Description</label>
            <textarea></textarea>
            <input type="text" placeholder="Find / Add Users" onChange={e => this.search(e) } />
            <div id="circle-create-users-results">
                { this.state.results.map(function(result) {
                    return <div>Yay users found...</div>;
                }) }
            </div>
        </div>);
    }

}
