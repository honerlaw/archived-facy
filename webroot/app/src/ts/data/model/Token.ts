
import { AppData } from "../AppData";
import { ApiRequest } from "../ApiRequest";

/**
 * A simple wrapper class around localStorage that allows us to retreive /
 * set / generate a token
 */
export class Token {

    public setValue(value: string) {
        if(value !== undefined) {
            localStorage.setItem("token", value);
        }
    }

    public getValue(): string {
        var value: string = localStorage.getItem("token");
        if(value === null) {
            return undefined;
        }
        return value;
    }

    public isValid(): boolean {
        return this.getValue() !== undefined;
    }

    public remove() {
        localStorage.removeItem("token");
    }

}
