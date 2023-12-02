import { get_task_by_wbsId, getTasksTableData } from '../../components/Reports/TasksTable/selectors';

describe('get_task_by_wbsId', () => {
  it('returns the correct tasks based on WbsTasksID', () => {
    const mockTasks = {
      fetched: true,
      taskItems: [
        { id: 1, wbsId: 'A' },
        { id: 2, wbsId: 'B' },
        { id: 3, wbsId: 'A' }
      ]
    };
    const WbsTasksID = ['A','B'];
    const result = get_task_by_wbsId(WbsTasksID, mockTasks);
    expect(result).toEqual([{ id: 2, wbsId: 'B' }]);
  });

  it('returns the correct tasks based on WbsTasksID', () => {
    const mockTasks = {
      fetched: true,
      taskItems: [
        { id: 1, wbsId: 'A' },
        { id: 2, wbsId: 'B' },
        { id: 3, wbsId: 'A' }
      ]
    };
    const WbsTasksID = ['A'];
    const result = get_task_by_wbsId(WbsTasksID, mockTasks);
    expect(result).toEqual(undefined);
  });
});

