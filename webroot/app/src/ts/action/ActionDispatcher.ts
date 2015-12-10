
import { Action } from "./Action";
import { ActionListener } from "./ActionListener";

export class ActionDispatcher {

    private static listeners: Array<ActionListener> = [];

    public static register(listener: ActionListener): number {
        return ActionDispatcher.listeners.push(listener) - 1;
    }

    public static deregister(listener: ActionListener): void {
        for(var i: number = ActionDispatcher.listeners.length - 1; i >= 0; --i) {
            var temp: ActionListener = ActionDispatcher.listeners[i];
            if(temp == listener) {
                ActionDispatcher.listeners.splice(i, 1);
            }
        }
    }

    public static dispatch(action: Action) {
        for(var i: number = 0; i < ActionDispatcher.listeners.length; ++i) {
            ActionDispatcher.listeners[i].performed(action);
        }
    }

}
