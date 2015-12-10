

export class Action {

    private type: string;
    private data: any;

    constructor(type: string, data?: any) {
        this.type = type;
        this.data = data;
    }

    public getType(): string {
        return this.type;
    }

    public getData(): any {
        return this.data;
    }

}
