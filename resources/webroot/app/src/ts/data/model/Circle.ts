
import { AppData } from "../AppData";
import { ApiRequest } from "../ApiRequest";
import { User } from "./User";

export class Circle {

    private id: number;
    private title: string;
    private description: string;
    private created: string;
    private creator: User;

    constructor(id: number, title: string, description: string, created: string, creator: User) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.created = created;
        this.creator = creator;
    }

    public static create(title: string, description: string, callback?: (circle: Circle) => any) {
        ApiRequest.request("/api/circle/create", "post", { title : title, description: description }, function(data, status, xhr) {
            if(callback !== undefined) {
                callback(new Circle(data.circle.id, data.circle.name, data.circle.description, data.circle.created, AppData.getUser()));
            }
        });
    }

    public remove(callback?: () => any) {
        ApiRequest.request("/api/circle/delete/" + this.getID(), "delete", {}, function(data, status, xhr) {
            if(callback !== undefined) {
                callback();
            }
        });
    }

    public getID(): number {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getCreated(): string {
        return this.created;
    }

    public getCreator(): User {
        return this.creator;
    }

}
