export const NO_TEAM_LABEL = 'No Team';
export const NO_ROLE_LABEL = 'No Role';

// Members without a value for the grouping go in a fallback group, listed last
const fallbackGroup = label => ({ key: label, label, isFallback: true });

// A member on several teams belongs to each of their teams' groups
export const getTeamGroups = member => {
  const teams = (member.user?.teams || []).filter(team => team?.teamName);
  if (teams.length === 0) return [fallbackGroup(NO_TEAM_LABEL)];
  return teams.map(team => ({ key: team._id, label: team.teamName }));
};

export const getRoleGroups = member => {
  const role = member.user?.role?.trim();
  return [role ? { key: role, label: role } : fallbackGroup(NO_ROLE_LABEL)];
};

export const GROUP_BY_OPTIONS = {
  role: { label: 'Role', getGroups: getRoleGroups },
  team: { label: 'Team', getGroups: getTeamGroups },
};

// Returns [{ key, label, isFallback, members }] sorted by label, with the fallback group last
export const groupMembers = (members, getGroups) => {
  const groups = new Map();
  members.forEach(member => {
    getGroups(member).forEach(({ key, label, isFallback = false }) => {
      if (!groups.has(key)) groups.set(key, { key, label, isFallback, members: [] });
      groups.get(key).members.push(member);
    });
  });

  return [...groups.values()].sort((a, b) => {
    if (a.isFallback !== b.isFallback) return a.isFallback ? 1 : -1;
    return a.label.localeCompare(b.label);
  });
};
