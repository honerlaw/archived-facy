/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/react/react-global.d.ts" />
/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="./typing/app-state.d.ts" />

/*

Basically we have 3 interfaces per component

Structure Interface - defines the structure / data in the interface
Properties Interface - defines the immutable properties of the component - set by parent for child
State Interface - defines the state of the component - basically things that can change

So we have 2 sections to the website.

right nav / info panel

left content panel

The content panel basically takes care of a lot of shit and is updated a lot

*/

require('../scss/index.scss');

import { Nav } from "./Nav.tsx";
import { Content } from "./Content.tsx";
import { Login } from "./auth/Login.tsx";
import { Register } from "./auth/Register.tsx";
import { AppData } from "./util/AppData";
import { Action } from "./action/Action";
import { ActionListener } from "./action/ActionListener";
import { ActionDispatcher } from "./action/ActionDispatcher";

class App extends React.Component<any, AppState> implements ActionListener {

    constructor(props : any) {
        super(props);
        this.state = {
            isLoggedIn: AppData.getToken() === undefined ? false : true
        };
    }

    public componentWillMount() {
        ActionDispatcher.register(this);
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
            <div className="col-md-2"></div>
            <Register />
            <Login />
            <div className="col-md-2"></div>
        </div>);
    }

    public performed(action: Action) {
        switch(action.getType()) {
            case "login":
                this.setState({ isLoggedIn: true });
                break;
            case "logout":
                this.setState({ isLoggedIn: false });
                break;
        }
    }

}

ReactDOM.render(<App />, document.getElementsByClassName('app')[0]);
