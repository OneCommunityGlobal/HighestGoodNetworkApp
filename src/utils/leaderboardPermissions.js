const PURPLE_TIER= 1.75;
const FUCHSIA_TIER = 1.5;
const DARKGREEN_TIER = 1.25;


export const hasLeaderboardPermissions = (authRole) => {
    return (
        authRole === "Owner" || 
        authRole === "Administrator" || 
        authRole === "Manager" ||
        authRole === "Mentor" || 
        authRole === "Core Team"
    )
}

export const assignStarDotColors = (hoursLogged, weeklyCommittedHours) => {
   return (hoursLogged >= weeklyCommittedHours * PURPLE_TIER) 
   ? 'purple'
   : hoursLogged >= weeklyCommittedHours * FUCHSIA_TIER &&
     hoursLogged < weeklyCommittedHours * PURPLE_TIER
   ? 'fuchsia'
   : hoursLogged >= weeklyCommittedHours * DARKGREEN_TIER &&
     hoursLogged < weeklyCommittedHours * FUCHSIA_TIER
   ? 'darkgreen'
   : 'green'
}

export const showStar = (hoursLogged, weeklyCommittedHours) => {
    return (weeklyCommittedHours !== 0 && 
        hoursLogged >= weeklyCommittedHours * DARKGREEN_TIER)
}
