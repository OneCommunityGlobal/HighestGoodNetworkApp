// import whatever file I need to pull the information of a given role's permissions
// import whatever file I need to pull the information of a specific user's permissions

function PermissionChangeModal({ userProfile }) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  // create variable for user
  const user = userProfile;
  // create variable for old role
  // create variable for new role
  // const currentUserPermissions = user.permissions; // import user permissions from wherever
  // const oldRolePermissions = oldRole.permissions; // import old role permissions from wherever
  // difference between old role permissions and user permissions
  // permissions that were added to user (user permissions - old role permissions)
  // const customAddedPermissions = currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission));
  // permissions that were removed from user (old role permissions - user permissions)
  // const customRemovedPermissions = oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission));
  // const newRolePermissions = newRole.permissions; // import new role permissions from wherever
  // permissions that were removed from user but are in new role (newRolePermissions - customRemovedPermissions)
  // const newRolePermissionsToAdd = newRolePermissions.filter(permission => customRemovedPermissions.includes(permission));
  // permissions that were added to user but are not in new role (newRolePermissions + customAddedPermissions)
  // const newRolePermissionsToRemove = customAddedPermissions.filter(permission => !newRolePermissions.includes(permission));

  function testUser() {
    console.log(user);
  }

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Change User Role</h2>
        <button className="close-button" /* onClick={closeModal} */ type="button">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {/* {rolename} */} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        {/* <ul>
          {newRolePermissionsToAdd.map(permission => (
            <li key={permission}>
              <input type="checkbox" id={permission} name={permission} value={permission} />
              <label htmlFor={permission}>{permission}</label>
            </li>
          ))}
          {newRolePermissionsToRemove.map(permission => (
            <li key={permission}>
              <input type="checkbox" id={permission} name={permission} value={permission} />
              <label htmlFor={permission}>{permission}</label>
            </li>
          ))}
        </ul> */}
        <div className="modal-footer">
          <button className="cancel-button" 
          /* onClick={closeModal} */ 
          onClick={testUser} 
          type="button"
          >
            Cancel
          </button>
          <button className="confirm-button" /* onClick={confirmModal} */ type="submit">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionChangeModal;
