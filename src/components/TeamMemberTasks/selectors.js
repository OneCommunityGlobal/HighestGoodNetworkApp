export const getTeamMemberTasksData = (state) => ({
  isLoading: state.teamMemberTasks.isLoading,
  usersWithTasks: state.teamMemberTasks.usersWithTasks
});