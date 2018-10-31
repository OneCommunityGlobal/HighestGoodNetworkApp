import React, { Component } from 'react';
import {getUserProfile} from '../services/profileService'
import logger from '../services/logService'

class Profile extends Component {
    state = { 
        userId : {},
        userProfile : {}
     }
    async componentDidMount() {
        
       try{
        let userId = this.props.match.params.userId;
        let data = await getUserProfile(userId)
        console.log(data)

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