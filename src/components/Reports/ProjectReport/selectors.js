export const projectReportViewData = (state) => ({
  wbs: state.wbs,
  projectMembers: state.projectMembers,
  tasks: state.tasks,
  isActive: state.project.isActive,
  projectName: state.project.projectName,
  // isLoading: false
});
