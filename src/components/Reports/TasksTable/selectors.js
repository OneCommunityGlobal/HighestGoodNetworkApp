const getTaskByWbsId = (WbsTasksID, tasks) => {
  const getTasks = [];
  if (WbsTasksID.length > 0) {
    let i = 0;
    while (i < WbsTasksID.length && tasks.fetched) {
      const currentWbsTaskID = WbsTasksID[i];
      const result = tasks.taskItems.filter(task => task.wbsId === currentWbsTaskID);
      getTasks.push(result);
      i += 1;
    }
  }

  return getTasks[1];
};

const getTasksTableData = (state, { WbsTasksID }) => ({
  getTasks: getTaskByWbsId(WbsTasksID, state.tasks) || [],
});
export default getTasksTableData;
