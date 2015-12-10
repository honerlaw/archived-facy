import { Action } from "./Action";

export interface ActionListener {
    performed: (action: Action) => any;
}
