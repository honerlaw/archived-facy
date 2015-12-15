
import { Action } from "../action/Action";
import { ActionDispatcher } from "../action/ActionDispatcher";
import { User } from "../data/model/User";
import { LoginAction } from "../action/impl/LoginAction";
import { ILoginState } from "./ILoginState";

export class Login extends React.Component<any, ILoginState> {

    constructor(props : any) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    private onSubmit(event) {
        event.preventDefault();
        User.get(this.state.username, this.state.password, function() {
            ActionDispatcher.dispatch(new LoginAction());
        });
    }

    private changeUsername(event) {
        this.setState({ username : event.target.value });
    }

    private changePassword(event) {
        this.setState({ password : event.target.value });
    }

    public render() {
        return (<div className="col-md-3">
            <form onSubmit={ e => this.onSubmit(e) }>
            <h1>Login</h1>
            <label>username</label>
            <input type="text" value={this.state.username} onChange={ e => this.changeUsername(e) }/>
            <label>password</label>
            <input type="password" value={this.state.password} onChange={ e => this.changePassword(e) } />
            <input type="submit" value="login" />
            </form>
        </div>);
    }

}
