
import { AppData } from "../../data/AppData";
import { ApiRequest } from "../../data/ApiRequest";

import { IProfileDataState } from "./IProfileDataState";

export class ProfileData extends React.Component<any, IProfileDataState> {

    constructor(props: any) {
        super(props);
        this.state = {
            profileImage: AppData.getUser().getProfileImage()
        }
    }

    /**
     * Opens the select file menu
     */
    private selectImage(event) {
        event.preventDefault();
        $(this.refs['profileUploadInput']).click();
    }

    private upload(event) {

        // convert the files to a form data object
        var data = new FormData();
        $.each(event.target.files, function(key, value) {
            data.append(key, value);
        });

        // send file upload request
        ApiRequest.fileUpload('/api/user/profile/upload', data, function(data, status, xhr) {
            AppData.getUser().setProfileImage(data.url + "?uuid=" + Math.random());
            this.setState({
                profileImage: AppData.getUser().getProfileImage()
            });
        }.bind(this));

    }

    public render() {
        return (<div>
            { this.getProfileImage() }
            <div id="name">{ AppData.getUser().getUsername() }</div>
            <input type="file" name="upload-file" style={ { display: 'none' } } ref="profileUploadInput" onChange={ e => this.upload(e) } />
        </div>);
    }

    private getProfileImage() {
        if(this.state.profileImage !== null) {
            return (<div id="profile-picture" style={ { backgroundImage: 'url("' + this.state.profileImage + '")' }} >
                <div id="update-profile-img-button" onClick={ e => this.selectImage(e) }>update</div>
            </div>);
        }
        return (<div id="profile-picture">
            <div id="update-profile-img-button" onClick={ e => this.selectImage(e) }>update</div>
        </div>);
    }

}
