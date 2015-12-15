
import { IUserBoxOptionsProps } from "./IUserBoxOptionsProps";

export class UserBoxOptions extends React.Component<IUserBoxOptionsProps, {}> {

    constructor(props: IUserBoxOptionsProps) {
        super(props);
    }

    public render() {
        switch(this.props.type) {
            case 'friend':
                return (<select onChange={ e => this.props.option(e) }>
                    <option>Options</option>
                    <option value="remove">Remove Friend</option>
                </select>);
            case 'request':
                return (<select onChange={ e => this.props.option(e) }>
                    <option>Options</option>
                    <option value="revoke">Revoke Friend Request</option>
                </select>);
            case 'invite':
                return (<select onChange={ e => this.props.option(e) }>
                    <option>Options</option>
                    <option value="accept">Accept Friend Request</option>
                    <option value="deny">Deny Friend Request</option>
                </select>);
            default:
                return (<select onChange={ e => this.props.option(e) }>
                    <option>Options</option>
                    <option value="send">Send Friend Request</option>
                </select>);
        }
    }

}
