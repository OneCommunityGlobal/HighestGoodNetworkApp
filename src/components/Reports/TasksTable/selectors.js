const getTaskByWbsId = (WbsTasksID, tasks) => {
  const getTasks = [];
  if (WbsTasksID.length > 0) {
    let i = 0;
    while (i < WbsTasksID.length && tasks.fetched) {
      const currentWbsId = WbsTasksID[i]; // Capture the current value of i
      const result = tasks.taskItems.filter(task => task.wbsId === currentWbsId);
      getTasks.push(result);
      i += 1;
    }
  }
  return getTasks[1];
};

// eslint-disable-next-line import/prefer-default-export
export const getTasksTableData = (state, { WbsTasksID }) => ({
  getTasks: getTaskByWbsId(WbsTasksID, state.tasks) || [],
});
