const mapMemberToChartData = (member, projectName, totalHoursCalculated) => ({
  name: `${member.personId.firstName}`,
  value: member.totalSeconds / 3600,
  projectName,
  totalHoursCalculated,
  lastName: member.personId.lastName,
});

export const calculateTotalHours = mergedProjectUsersArray =>
  mergedProjectUsersArray.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 3600;

export const buildAllMembersChartData = (mergedProjectUsersArray, projectName, totalHours) => {
  const arrData = mergedProjectUsersArray.map(member =>
    mapMemberToChartData(member, projectName, totalHours),
  );
  return arrData.sort((a, b) => a.name.localeCompare(b.name));
};

export const buildInactiveMembersChartData = (
  mergedProjectUsersArray,
  projectName,
  noDataPlaceholder,
) => {
  const inactiveUsers = mergedProjectUsersArray.filter(member => !member.personId.isActive);
  if (inactiveUsers.length === 0) {
    return { userData: noDataPlaceholder, inactiveHours: 0, inactiveUsers };
  }

  const inactiveHours =
    inactiveUsers.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 3600;
  const inactiveArr = inactiveUsers.map(member =>
    mapMemberToChartData(member, projectName, inactiveHours),
  );

  return {
    userData: inactiveArr.sort((a, b) => a.name.localeCompare(b.name)),
    inactiveHours,
    inactiveUsers,
  };
};

export const buildActiveMembersChartData = (mergedProjectUsersArray, projectName) => {
  const activeUsers = mergedProjectUsersArray.filter(member => member.personId.isActive);
  const activeHours = activeUsers.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 3600;
  const activeArr = activeUsers.map(member =>
    mapMemberToChartData(member, projectName, activeHours),
  );

  return {
    userData: activeArr.sort((a, b) => a.name.localeCompare(b.name)),
    activeHours,
    activeUsers,
  };
};

export const resolvePieChartUserData = ({
  mergedProjectUsersArray,
  projectName,
  showMembers,
  noDataPlaceholder,
}) => {
  const totalHours = calculateTotalHours(mergedProjectUsersArray);
  const activeResult = buildActiveMembersChartData(mergedProjectUsersArray, projectName);
  const base = {
    totalHours,
    activeData: activeResult.activeUsers,
    globalactiveHours: activeResult.activeHours,
    globalInactiveHours: 0,
    inactiveData: [],
    userData: buildAllMembersChartData(mergedProjectUsersArray, projectName, totalHours),
  };

  if (showMembers === false) {
    const inactiveResult = buildInactiveMembersChartData(
      mergedProjectUsersArray,
      projectName,
      noDataPlaceholder,
    );
    return {
      ...base,
      inactiveData: inactiveResult.inactiveUsers,
      globalInactiveHours: inactiveResult.inactiveHours,
      userData: inactiveResult.userData,
    };
  }

  if (showMembers === true) {
    return {
      ...base,
      userData: activeResult.userData,
    };
  }

  return base;
};
