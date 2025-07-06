const PURPLE_TIER = 1.75;
const FUCHSIA_TIER = 1.5;
const DARKGREEN_TIER = 1.25;

export const hasLeaderboardPermissions = authRole => {
  return (
    authRole === 'Owner' ||
    authRole === 'Administrator' ||
    authRole === 'Manager' ||
    authRole === 'Mentor' ||
    authRole === 'Core Team'
  );
};

export const assignStarDotColors = (hoursLogged, weeklyCommittedHours) => {
  if (hoursLogged >= weeklyCommittedHours * PURPLE_TIER) {
    return 'purple';
  }
  if (
    hoursLogged >= weeklyCommittedHours * FUCHSIA_TIER &&
    hoursLogged < weeklyCommittedHours * PURPLE_TIER
  ) {
    return 'fuchsia';
  }
  if (
    hoursLogged >= weeklyCommittedHours * DARKGREEN_TIER &&
    hoursLogged < weeklyCommittedHours * FUCHSIA_TIER
  ) {
    return 'darkgreen';
  }
  return 'green';
};

export const showStar = (hoursLogged, weeklyCommittedHours) => {
  return weeklyCommittedHours !== 0 && hoursLogged >= weeklyCommittedHours * DARKGREEN_TIER;
};

export const viewZeroHouraMembers = authRole => {
  return authRole === 'Owner' || authRole === 'Administrator' || authRole === 'Core Team';
};
