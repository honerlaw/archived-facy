
import { Token } from "./model/Token";
import { User } from "./model/User";

/*
 * Handles all of the global data that can be can be accessed
 */
export class AppData {

    private static token: Token = new Token();

    private static user: User;

    public static getToken(): Token {
        return this.token;
    }

    public static setUser(user: User) {
        this.user = user;
    }

    public static getUser(): User {
        return this.user;
    }

}
