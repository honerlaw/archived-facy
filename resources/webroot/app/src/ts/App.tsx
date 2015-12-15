/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/react/react-global.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />

require('../scss/index.scss');

import { Nav } from "./Nav.tsx";
import { Content } from "./Content.tsx";
import { Login } from "./auth/Login.tsx";
import { Register } from "./auth/Register.tsx";

import { User } from "./data/model/User";
import { AppData } from "./data/AppData";

import { Action } from "./action/Action";
import { ActionListener } from "./action/ActionListener";
import { ActionDispatcher } from "./action/ActionDispatcher";
import { LogoutAction } from "./action/impl/LogoutAction";
import { LoginAction } from "./action/impl/LoginAction";

import { IAppState } from "./IAppState";

class App extends React.Component<any, IAppState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            isLoggedIn: false
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
        if(AppData.getToken().isValid()) {
            User.load(function() {
                this.setState({
                    isLoggedIn: AppData.getToken().isValid()
                });
            }.bind(this));
        }
    }

    public componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    public render() {
        if(this.state.isLoggedIn) {
            return (<div className="container">
                <div className="col-md-10"><Content /></div>
                <div className="col-md-2"><Nav /></div>
            </div>);
        }
        return (<div className="container">
            <div className="col-md-12"><div id="login-page-header"></div></div>
            <div className="col-md-2"></div>
            <Register />
            <div className="col-md-2"></div>
            <Login />
            <div className="col-md-2"></div>
        </div>);
    }

    public performed(action: Action, result: any): void {
        if(action instanceof LogoutAction || action instanceof LoginAction) {
            this.setState(result);
        }
    }

}

ReactDOM.render(<App />, document.getElementsByClassName('app')[0]);
