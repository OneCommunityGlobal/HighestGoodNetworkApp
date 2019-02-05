import { combineReducers } from "redux";
import jwtDecode from "jwt-decode";

const currentUserReducer = (user = {}, action) => {
  if (action.type === "GET_CURRENT_USER") {
    try {
      const token = action.payload;
      return jwtDecode(token);
    } catch (err) {
      return user;
    }
  }

  return user;
};

const userProfileByIdReducer = (userProfile = null, action) => {
  if (action.type === "GET_USER_PROFILE") {
    return action.payload;
  }

  if (action.type === "CLEAR_USER_PROFILE") {
    return null;
  }

  return userProfile;
};

const allUserProfilesReducer = (userProfiles = null, action) => {
  if (action.type === "GET_ALL_USER_PROFILES") {
    return action.payload;
  }

  return userProfiles;
};

const userTeamMembersReducer = (teamMembers = null, action) => {
  if (action.type === "GET_USER_TEAM_MEMBERS") {
    return action.payload;
  }

  return teamMembers;
};

const usernameReducer = (username = null, action) => {
  if (action.type === "GET_USERNAME") {
    return action.payload;
  }

  return username;
};

const userProjectMembersReducer = (projectMembers = null, action) => {
  if (action.type === "GET_USER_PROJECT_MEMBERS") {
    return action.payload;
  }

  return projectMembers;
};

const dashboardDataReducer = (dashboardData = null, action) => {
  if (action.type === "GET_DASHBOARD_DATA") {
    return action.payload;
  }

  return dashboardData;
};

const weeklyDashboardDataReducer = (weeklyDashboardData = null, action) => {
  if (action.type === "GET_WEEKLY_DASHBOARD_DATA") {
    return action.payload;
  }

  return weeklyDashboardData;
};

const monthlyDashboardDataReducer = (monthlyDashboardData = null, action) => {
  if (action.type === "GET_MONTHLY_DASHBOARD_DATA") {
    return action.payload;
  }

  return monthlyDashboardData;
};

const leaderboardDataReducer = (leaderboardData = null, action) => {
  if (action.type === "GET_LEADERBOARD_DATA") {
    return action.payload;
  }

  return leaderboardData;
};

const actionItemsReducer = (actionItems = null, action) => {
  if (action.type === "GET_ACTION_ITEMS") {
    return action.payload;
  }

  return actionItems;
};

const notificationsReducer = (notifications = null, action) => {
  if (action.type === "GET_NOTIFICATIONS") {
    return action.payload;
  }

  return notifications;
};

const allProjectsReducer = (allProjects = null, action) => {
  if (action.type === "GET_ALL_PROJECTS") {
    return action.payload;
  }

  return allProjects;
};

const projectByIdReducer = (project = null, action) => {
  if (action.type === "GET_PROJECT_BY_ID") {
    return action.payload;
  }

  return project;
};

const projectsByUserReducer = (projects = null, action) => {
  if (action.type === "GET_PROJECTS_BY_USER") {
    return action.payload;
  }

  return projects;
};

const projectMembershipReducer = (members = null, action) => {
  if (action.type === "GET_PROJECT_MEMBERSHIP") {
    return action.payload;
  }

  return members;
};

const allTeamsReducer = (allTeams = null, action) => {
  if (action.type === "GET_ALL_TEAMS") {
    return action.payload;
  }

  return allTeams;
};

const teamByIdReducer = (team = null, action) => {
  if (action.type === "GET_TEAM_BY_ID") {
    return action.payload;
  }

  return team;
};

const teamMembershipReducer = (members = null, action) => {
  if (action.type === "GET_TEAM_MEMBERSHIP") {
    return action.payload;
  }

  return members;
};

const allTimeEntriesReducer = (allTimeEntries = null, action) => {
  if (action.type === "GET_ALL_TIME_ENTRIES") {
    return action.payload;
  }

  return allTimeEntries;
};

const timeEntriesForSpecifiedPeriodReducer = (timeEntries = [], action) => {
  if (action.type === "GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD") {
    return action.payload;
  }

  return timeEntries;
};

const timeEntriesForSpecifiedProjectReducer = (timeEntries = [], action) => {
  if (action.type === "GET_TIME_ENTRY_FOR_SPECIFIED_PROJECT") {
    return action.payload;
  }
  return timeEntries;
};

const handleSuccessReducer = (status = null, action) => {
  if (action.type === "REQUEST_SUCCEEDED") {
    return action.payload;
  }

  if (action.type === "REQUEST_FAILED") {
    return action.error.response;
  }

  return status;
};

const postTimeEntry = (timeEntries = [], action) => {
  if (action.type === "POST_TIME_ENTRY") {
    return action.payload;
  }
  return timeEntries;
};

export default combineReducers({
  user: currentUserReducer,
  userProfile: userProfileByIdReducer,
  allUserProfiles: allUserProfilesReducer,
  userTeamMembers: userTeamMembersReducer,
  username: usernameReducer,
  userProjectMembers: userProjectMembersReducer,
  dashboardData: dashboardDataReducer,
  leaderboardData: leaderboardDataReducer,
  weeklyDashboardData: weeklyDashboardDataReducer,
  monthlyDashboardData: monthlyDashboardDataReducer,
  actionItems: actionItemsReducer,
  notifications: notificationsReducer,
  allProjects: allProjectsReducer,
  project: projectByIdReducer,
  userProjects: projectsByUserReducer,
  projectMembers: projectMembershipReducer,
  allTeams: allTeamsReducer,
  team: teamByIdReducer,
  teamMembers: teamMembershipReducer,
  allTimeEntries: allTimeEntriesReducer,
  userTimeEntries: timeEntriesForSpecifiedPeriodReducer,
  projectTimeEntries: timeEntriesForSpecifiedProjectReducer,
  requestStatus: handleSuccessReducer
});
