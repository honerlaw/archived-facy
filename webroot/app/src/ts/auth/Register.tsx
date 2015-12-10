
import { AppData } from "../util/AppData";
import { ApiRequest } from "../util/ApiRequest";
import { Action } from "../action/Action";
import { ActionDispatcher } from "../action/ActionDispatcher";

export class Register extends React.Component<any, RegisterState> {

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
        ApiRequest.createUser(this.state, function(data) {
            if(data.token) {
                AppData.setToken(data.token);
                ActionDispatcher.dispatch(new Action("login"));
            }
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
        return (<div className="col-md-4">
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
