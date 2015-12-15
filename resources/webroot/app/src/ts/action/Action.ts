

/*
 * Basically we have an abstract function we need to handle
 * The response of an action gets broadcast and the state is set for whatever
 */
export abstract class Action {

    private data: any;

    constructor(data?: any) {
        this.data = data;
    }

    abstract process(): any;

    public getData(): any {
        return this.data;
    }

}
