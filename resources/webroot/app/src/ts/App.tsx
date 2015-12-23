/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/react/react-global.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/react-router/react-router.d.ts" />

require('../scss/index.scss');

import { NavPanel } from "./nav/NavPanel.tsx";
import { ContentPanel } from "./content/ContentPanel.tsx";
import { Login } from "./auth/Login.tsx";
import { Register } from "./auth/Register.tsx";

import { User } from "./data/model/User";
import { AppData } from "./data/AppData";

import { LogoutAction } from "./action/impl/LogoutAction";
import { LoginAction } from "./action/impl/LoginAction";

import { IAppState } from "./IAppState";
import { IAppProps } from "./IAppProps";

import { Action } from "./action/Action";
import { ActionDispatcher } from "./action/ActionDispatcher";
import { ActionListener } from "./action/ActionListener";

class App extends React.Component<IAppProps, IAppState> implements ActionListener {

    constructor(props : IAppProps) {
        super(props);
        this.state = {
            isLoggedIn: this.props.isLoggedIn
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
    }

    public componentWillUnmount() {
        ActionDispatcher.deregister(this);
    }

    private openNav(event) {
        event.preventDefault();
        if(parseInt($('#app-nav').css('right')) === 0) {
            $('#app-nav').css({ right : '-100%' });
        } else {
            $('#app-nav').css({ right : '0px' });
        }
    }

    public render() {
        if(this.state.isLoggedIn) {
            return (<div id="app-page">
                <i id="nav-button" className="ion-android-menu" onClick={ e => this.openNav(e) }></i>
                <ContentPanel />
                <NavPanel />
                <footer>{ '\u00A9 2015 honerlaw.io' }</footer>
            </div>);
        }
        return (<div id="login-register-page">
            <div id="login-page-header"></div>
            <Register />
            <Login />
            <div style={{clear: "both"}}></div>
            <footer>{ '\u00A9 2015 honerlaw.io' }</footer>
        </div>);
    }

    public performed(action: Action, result: any): void {
        if(action instanceof LogoutAction || action instanceof LoginAction) {
            this.setState(result);
        }
    }


}

if(AppData.getToken().isValid()) {
    User.load(function(user: User) {
        ReactDOM.render(<App isLoggedIn={ user === null ? false : true } />, document.getElementsByClassName('app')[0]);
    });
} else {
    ReactDOM.render(<App isLoggedIn={false} />, document.getElementsByClassName('app')[0]);
}
