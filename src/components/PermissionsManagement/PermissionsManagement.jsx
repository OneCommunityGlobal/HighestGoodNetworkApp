import React from 'react';


const PermissionsManagement = () => {  
    return (
        <>
            <h1>User Roles:</h1>
            <p><a href='/permissionsmanagement/admin'>Administrator</a></p>
            <p><a href='/permissionsmanagement/owner'>Owner</a></p>
            <p><a href='/permissionsmanagement/coreteam'>Core Team</a></p>
            <p><a href='/permissionsmanagement/manager'>Manager</a></p>
            <p><a href='/permissionsmanagement/mentor'>Mentor</a></p>
            <p><a href='/permissionsmanagement/volunteer'>Volunteer</a></p>
        </>
        
    );
}

export default PermissionsManagement;