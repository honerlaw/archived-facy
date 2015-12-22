
import { Action } from "../Action";

export class PageRequestAction extends Action {

    constructor(data: PageData) {
        super(data);
    }

    public process(): Object {
        return this.getData();
    }

}

export class PageData {

    private name: string;

    private data: any;

    constructor(name: string, data?: any) {
        this.name = name;
        this.data = data;
    }

    public getName(): string {
        return this.name;
    }

    public getData(): any {
        return this.data;
    }

}
