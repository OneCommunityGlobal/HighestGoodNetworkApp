const userTableDataPermissions = (authRole, roleSearchText) => {
   return ((
    authRole !== "Owner" && 
    roleSearchText !== "Owner") || 
    authRole === "Owner"
    )
}

export default userTableDataPermissions;