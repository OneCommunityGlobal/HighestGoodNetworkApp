export const get_task_by_wbsId = (WbsTasksID, tasks) => {
  const get_tasks = [];
  if (WbsTasksID.length > 0) {
    let i = 0;
    while (i < WbsTasksID.length && tasks.fetched) {
      const result = tasks.taskItems.filter(task => task.wbsId === WbsTasksID[i]);
      get_tasks.push(result);
      i += 1;
    }
  }

  return get_tasks[0];
};

export const getTasksTableData = (state, { WbsTasksID }) => ({
  get_tasks: get_task_by_wbsId(WbsTasksID, state.tasks) || [],
});
