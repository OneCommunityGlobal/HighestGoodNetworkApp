import React, { Component } from 'react';
import {getUserProfile} from '../services/profileService'
import logger from '../services/logService'
import {getCurrentUser} from '../services/loginService'

class Profile extends Component {
    state = { 
        userId : {},
        requestorId : {},
        userProfile : {}
    }

    async componentDidMount() {
        
       try{
        let {userid:requestorId} = {...getCurrentUser()}        
        let userId = this.props.match.params.userId;
        let {data:userProfile} = {...await getUserProfile(userId)}
               
        this.setState({userId, userProfile, requestorId})
        console.log(this.state);
        }
        catch(error)
        {
           if(error.response && error.response.status === 400)
           {
               alert("This is an invalid profile");

           }

        }
        
    }
    render() { 
        
        return ( 

            <div>profile page</div>
         );
    }
}
 
export default Profile;