/// <reference path="../../typing/box-container-props.d.ts" />

import { UserBox } from "./box/UserBox";

export class BoxContainer extends React.Component<BoxContainerProps, {}> {

    constructor(props: BoxContainerProps) {
        super(props);
    }

    public render() {
        var title: string = this.props.title;
        var type: number = this.props.type;
        var data: Array<any> = this.props.data;
        if(data.length === 0) {
            return (<div></div>);
        }
        return (<div className="col-md-12 box-container">
            <h3>{title}</h3>
            {data.map(function(data) {
                switch(type) {
                    case 0:
                        //return <UserBox type={'user'} data={data} />;
                    case 1:
                        //return <UserBox type={'friend'} data={data} />;
                    case 2:
                        //return <UserBox type={'invite'} data={data} />;
                    case 3:
                        //return <UserBox type={'request'} data={data} />;
                        return;
                }
            })}
        </div>);
    }


}
