
import { IUserBoxOptionsProps } from "./IUserBoxOptionsProps";

export class UserBoxOptions extends React.Component<IUserBoxOptionsProps, {}> {

    constructor(props: IUserBoxOptionsProps) {
        super(props);
    }

    public render() {
        switch(this.props.type) {
            case 'friend':
                return (<div className="options">
                    <div onClick={ e => this.props.option(e) } value="remove">Remove Friend</div>
                </div>);
            case 'request':
                return (<div className="options">
                    <div onClick={ e => this.props.option(e) } value="revoke">Revoke Friend Request</div>
                </div>);
            case 'invite':
                return (<div className="options">
                    <div onClick={ e => this.props.option(e) } value="accept">Accept Friend Request</div>
                    <div onClick={ e => this.props.option(e) } value="deny">Deny Friend Request</div>
                </div>);
            default:
                return (<div className="options">
                    <div onClick={ e => this.props.option(e) } value="send">Send Friend Request</div>
                </div>);
        }
    }

}
