

/**
 * Maintains global applicaiton data that changes throughout the use of the
 * application
 */
export class AppData {

    public static setToken(token: string) {
        if(token === null) {
            localStorage.removeItem("token");
        } else {
            localStorage.setItem("token", token);
        }
    }

    public static getToken() {
        var token = localStorage.getItem("token");
        if(token === null) {
            return undefined;
        }
        return token;
    }

}
