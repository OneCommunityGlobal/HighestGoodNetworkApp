const hasPermission = (role, action, roles) => {
  if (roles) {
    const roleIndex = roles?.findIndex(({roleName}) => roleName === role )
    const permissions = roles[roleIndex].permissions
    
    let isAllowed;
    if (permissions?.includes(action)){
        isAllowed = true
    }
    else{
        isAllowed = false;
    }
    return isAllowed
  }
  return false
}


export default hasPermission;


