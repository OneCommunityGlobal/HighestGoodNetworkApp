export const projectReportViewData = state => ({
  wbs: state.wbs,
  projectMembers: state.projectMembers,
  isActive: state.projectReport.project?.isActive,
  projectName: state.projectReport.project?.projectName,
  isLoading: state.projectReport.isLoading,
  wbsTasksID: state.wbs.WBSItems.map(item => item._id),
});
