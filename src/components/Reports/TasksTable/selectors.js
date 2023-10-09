// eslint-disable-next-line camelcase
const get_task_by_wbsId = (WbsTasksID, tasks) => {
  // eslint-disable-next-line camelcase
  const get_tasks = [];
  if (WbsTasksID.length > 0) {
    let i = 0;
    while (i < WbsTasksID.length && tasks.fetched) {
      const currentWbsTaskID = WbsTasksID[i];
      const result = tasks.taskItems.filter(task => task.wbsId === currentWbsTaskID);
      get_tasks.push(result);
      i += 1;
    }
  }

  return get_tasks[1];
};

const getTasksTableData = (state, { WbsTasksID }) => ({
  get_tasks: get_task_by_wbsId(WbsTasksID, state.tasks) || [],
});
export default getTasksTableData;
