
import { ActionDispatcher } from "../action/ActionDispatcher";
import { User } from "../data/model/User";
import { LoginAction } from "../action/impl/LoginAction";
import { IRegisterState } from "./IRegisterState";

export class Register extends React.Component<any, IRegisterState> {

    constructor(props : any) {
        super(props);
        this.state = {
            username: '',
            password: '',
            verifyPassword: ''
        };
    }

    private onSubmit(event) {
        event.preventDefault();
        var self = this;
        User.create(this.state.username, this.state.password, this.state.verifyPassword, function() {
            ActionDispatcher.dispatch(new LoginAction());
        });
    }

    private changeUsername(event) {
        this.setState({ username: event.target.value });
    }

    private changePassword(event) {
        this.setState({ password: event.target.value });
    }

    private changeVerifyPassword(event) {
        this.setState({ verifyPassword: event.target.value });
    }

    public render() {
        return (<div id="register-form">
            <form onSubmit={ e => this.onSubmit(e) }>
                <h1>Register</h1>
                <label>username</label>
                <input type="text" value={this.state.username} onChange={e => this.changeUsername(e) } />
                <label>password</label>
                <input type="password" value={this.state.password} onChange={ e => this.changePassword(e) } />
                <label>verify password</label>
                <input type="password" value={this.state.verifyPassword} onChange={ e => this.changeVerifyPassword(e) } />
                <input type="submit" value="register" />
            </form>
        </div>);
    }

}
