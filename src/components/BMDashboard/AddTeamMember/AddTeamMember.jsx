import { useState } from 'react';
import Select from 'react-select';
import { MdOutlinePersonAddAlt1 } from "react-icons/md";
import './AddTeamMember.css'

function AddTeamMember() {
    const [firstName, setFirstName] = useState('');
    const optionsRole = [
        {value: 'carpenter', label: 'Carpenter'},
        {value: 'volunteer', label: 'Volunteer'},
        {value: 'role', label: 'Role'},
        {value: 'other', label: 'Other'}
    ]
    const optionsTeam = [
        {value: 'other', label: 'Other'}
    ]

    return(
        <div className = "container">
            <div className = "icon-add-person">
                <MdOutlinePersonAddAlt1 size={90}/>
                <h1 className="title-member">Create new team member</h1>
            </div>

            <div className = "name-container">
                <div className = "input-name">       
                    <label for="fname">First Name</label>        
                    <input id="fname" type="text" placeholder = "First name"/>
                </div>

                <div className = "input-name">       
                    <label for="lname">Last Name</label> 
                    <input id ="lname" type="text" placeholder = "Last name"/>
                </div>
            </div>
            
            <div className = "role-container">
                <div className = "role-input">
                    <label for ="role-options">Roles</label>
                    <Select id="role-options" options = {optionsRole}/>
                </div>
                <div className = "role-input">
                    <p>If role is not available</p>
                    <input type = "text" placeholder = "Specify"/>
                </div>
                
            </div>

            <div className = "team-container">
                <div className = "team-input">
                    <label for ="team-options">Teams</label>
                    <Select id="team-options"options = {optionsRole}/>
                </div>
                <div className = "team-input">
                    <p>If team is not available</p>
                    <input type = "text" placeholder = "Specify"/>
                </div>
            </div>
        

            <p>Email Address </p>
            <input type = "email"/>
            
            <p>Phone Number</p>
            <input type = "number"/>
        </div>
    );
}

export default AddTeamMember;