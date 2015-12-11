
import { ApiRequest } from "../ApiRequest";

export class Token extends ApiRequest {

    constructor(token?: string) {
        super();
        if(token !== undefined) {
            localStorage.setItem("token", token);
        }
    }

    public static new(username: string, password: string, callback: (token: Token) => any): void {
        this.request("/api/token/new", "post", { username: username, password: password }, function(data, status, xhr) {
            callback(new Token(data.token));
        });
    }

    public getToken(): string {
        var token: string = localStorage.getItem("token");
        if(token === null) {
            return undefined;
        }
        return token;
    }

    public remove() {
        localStorage.removeItem("token");
    }

}
