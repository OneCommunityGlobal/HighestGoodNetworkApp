const get_task_by_wbsId = (WbsTasksID, tasks) => {
  var get_tasks = [];
  if (WbsTasksID.length > 0) {
    var i = 0;
    while (i < WbsTasksID.length && tasks.fetched) {
      var result = tasks.taskItems.filter(task => task.wbsId == WbsTasksID[i]);
      get_tasks.push(result);
      i += 1;
    }
  }

  return get_tasks[1];
};

export const getTasksTableData = (state, { WbsTasksID }) => ({
  get_tasks: get_task_by_wbsId(WbsTasksID, state.tasks) || [],
});
