const hasLeaderboardPermissions = (authRole) => {
    return (
        authRole === "Owner" || 
        authRole === "Administrator" || 
        authRole === "Manager" ||
        authRole === "Mentor" || 
        authRole === "Core Team"
    )
}

export default hasLeaderboardPermissions;