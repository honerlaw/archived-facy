
import { IPageProps } from "./IPageProps";
import { AppData } from "../../data/AppData";
import { Friend } from "../../data/model/Friend";
import { Circle } from "../../data/model/Circle";

interface ICreateCircleState {
    title?: string,
    description?: string,
    friends?: Array<Friend>
}

export class CreateCircle extends React.Component<IPageProps, ICreateCircleState> {

    constructor(props: IPageProps) {
        super(props);
        this.state = {
            title: '',
            description: '',
            friends: []
        };
    }

    public componentWillMount() {
        // send API request to retreive a list of friends
        AppData.getUser().getFriends(function(friends) {
            this.setState({
                friends: friends
            });
        }.bind(this));
    }

    private updateTitle(event) {
        this.setState({ title: event.target.value });
    }

    private updateDescription(event) {
        this.setState({ description: event.target.value });
    }

    private create(event) {
        event.preventDefault();
        var title: string = this.state.title.trim();
        var desc: string = this.state.description.trim();
        if(title.length > 0 && desc.length > 0) {
            Circle.create(title, desc, function(circle: Circle) {
                console.log(circle);
            });
        }
    }

    public render() {
        return (<div id="create-circle-page">
            <h1>Create a Circle</h1>
            <label>Circle Title</label>
            <input type="text" value={this.state.title} onChange={ e => this.updateTitle(e) }/>
            <label>Circle Description (optional)</label>
            <textarea onChange={ e => this.updateDescription(e) }></textarea>
            <input type="button" value="Create" onClick={ e => this.create(e) }/>
            { this.showFriends() }
        </div>);
    }

    private showFriends() {
        if(this.state.friends.length > 0) {
            return (<div>
                <label>Select Friends</label>
                <div id="circle-create-users-friends">
                    { this.state.friends.map(function(result: Friend) {
                        return <div>{result.getUser().getUsername()}</div>;
                    }) }
                </div>
            </div>);
        }
    }

}
