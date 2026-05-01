export const getTaskByWbsId = (WbsTasksID, tasks) => {
  const getTasks = [];
  if (WbsTasksID.length > 0 && tasks.fetched) {
    WbsTasksID.forEach(id => {
      const result = tasks.taskItems.filter(task => task.wbsId === id);
      getTasks.push(...result);
    });
  }

  return getTasks;
};

export const getTasksTableData = (tasks, { WbsTasksID }) => ({
  get_tasks: getTaskByWbsId(WbsTasksID, tasks) || [],
});
