/// <reference path="../typing/profile-data-props.d.ts" />
/// <reference path="../typing/profile-data-state.d.ts" />

import { ApiRequest } from "../util/ApiRequest";
import { AppData } from "../util/AppData";

export class ProfileData extends React.Component<ProfileDataProps, ProfileDataState> {

    constructor(props: ProfileDataProps) {
        super(props);
        this.state = {
            profileImage: ''
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

        // send the request to the server
        $.ajax({
            url: '/api/user/profile/upload',
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(request) {
                if(AppData.getToken() !== undefined) {
                    request.setRequestHeader("Authorization", "Bearer " + AppData.getToken());
                }
            },
            success: function(data, textStatus, xhr) {
                this.setState({
                    profileImage: data.url + "?uuid=" + Math.random()
                });
            }.bind(this),
            error: function(xhr, data, status) {
                console.log(xhr, data, status);
            }
        });
    }

    public render() {
        var url = this.state.profileImage;
        if(this.state.profileImage.length === 0 && this.props.profileId !== -1) {
            url = '/file/image/profile/' + this.props.profileId;
        }
        var profileImage = {
            backgroundImage: 'url("' + url + '")'
        };
        return (<div>
            <div id="profile-picture" style={ profileImage } >
                <div id="update-profile-img-button" onClick={ e => this.selectImage(e) }>update</div>
            </div>
            <div id="name">{ this.props.username }</div>
            <input type="file" name="upload-file" style={ { display: 'none' } } ref="profileUploadInput" onChange={ e => this.upload(e) } />
        </div>);
    }

}
