import { taskReducer } from '../allTasksReducer';
import * as types from '../../constants/task';

describe('Task Reducer', () => {
  it('start fetch', () => {
    const allTasks = taskReducer({}, { type: types.FETCH_TASKS_START });
    expect(allTasks).toMatchObject({
      fetched: false,
      fetching: true,
      error: 'none',
    });
  });

  it('error fetching', () => {
    const allTasks = taskReducer(
      {},
      {
        type: types.FETCH_TASKS_ERROR,
        err: 'error',
      },
    );
    expect(allTasks).toMatchObject({
      fetched: true,
      fetching: false,
      error: 'error',
    });
  });

  describe('Receive Tasks', () => {
    xit('level -1', () => {
      const allTasks = taskReducer(
        {},
        {
          level: -1,
          type: types.RECEIVE_TASKS,
        },
      );
      expect(allTasks).toMatchObject({
        taskItems: [],
        fetchedData: [],
        fetched: true,
        fetching: false,
        error: 'none',
      });
    });

    xit('level 0', () => {
      const allTasks = taskReducer(
        {},
        {
          level: 0,
          type: types.RECEIVE_TASKS,
          taskItems: [
            { level: 0, num: '2' },
            { level: 0, num: '3' },
            { level: 0, num: '1' },
          ],
        },
      );
      expect(allTasks).toMatchObject({
        taskItems: [
          { level: 0, num: '1' },
          { level: 0, num: '2' },
          { level: 0, num: '3' },
        ],
        fetched: true,
        fetching: false,
        error: 'none',
      });
    });

    xit('with mother task', () => {
      const allTasks = taskReducer(
        {
          taskItems: [
            { taskId: 5, level: 0, num: '1' },
            { taskId: 0, level: 0, num: '2', _id: 0 },
            { taskId: 1, level: 0, num: '3' },
          ],
        },
        {
          mother: 0,
          type: types.RECEIVE_TASKS,
          taskItems: [
            { taskId: 2, level: 1, num: '2.1' },
            { taskId: 6, level: 3, num: '2.2.2.1' },
            { taskId: 4, level: 2, num: '2.2.2' },
            { taskId: 3, level: 2, num: '2.2.1' },
            { taskId: 7, level: 2, num: '2.2.1' },
          ],
        },
      );
      expect(allTasks).toMatchObject({
        taskItems: [
          { taskId: 5, level: 0, num: '1' },
          { taskId: 0, level: 0, num: '2', _id: 0 },
          { taskId: 2, level: 1, num: '2.1.0.0.0', hasChildren: false },
          { taskId: 3, level: 2, num: '2.2.1.0.0', hasChildren: false },
          { taskId: 7, level: 2, num: '2.2.1.0.0', hasChildren: false },
          { taskId: 4, level: 2, num: '2.2.2.0.0', hasChildren: false },
          { taskId: 6, level: 3, num: '2.2.2.1.0', hasChildren: false },
          { taskId: 1, level: 0, num: '3' },
        ],
        fetched: true,
        fetching: false,
        error: 'none',
      });
    });
  });

  it('add task', () => {
    const allTasks = taskReducer(
      {
        taskItems: [
          { taskId: 5, level: 1, num: '1.0.0.0', _id: 1 },
          { taskId: 0, level: 1, num: '2.0.0.0', _id: 0 },
          { taskId: 1, level: 1, num: '3.0.0.0', _id: 2 },
        ],
      },
      {
        mother: 0,
        type: types.ADD_NEW_TASK,
        newTask: { taskId: 2, level: 2, num: '2.1', _id: 3, mother: 0 },
      },
    );
    expect(allTasks).toMatchObject({
      taskItems: [
        { taskId: 5, level: 1, num: '1.0.0.0', _id: 1 },
        { taskId: 0, level: 1, num: '2.0.0.0', _id: 0, hasChildren: true },
        { taskId: 2, level: 2, num: '2.1.0.0', _id: 3, hasChildren: false, mother: 0 },
        { taskId: 1, level: 1, num: '3.0.0.0', _id: 2, hasChildren: false },
      ],
      fetched: true,
      fetching: false,
      error: 'none',
    });
  });

  it('delete task', () => {
    const allTasks = taskReducer(
      {
        taskItems: [
          { num: '1' },
          { num: '2', _id: 0 },
          { num: '2.1', parentId1: 0, parentId2: 0, parentId3: 0 },
          { num: '3' },
        ],
      },
      {
        type: types.DELETE_TASK,
        taskId: 0,
      },
    );
    expect(allTasks).toMatchObject({
      taskItems: [{ num: '1' }, { num: '3' }],
      fetched: true,
      fetching: false,
      error: 'none',
    });
  });

  it('update task', () => {
    const allTasks = taskReducer(
      {
        taskItems: [{ num: '1' }, { num: '2', _id: 0 }, { num: '3' }],
      },
      {
        type: types.UPDATE_TASK,
        taskId: 0,
        updatedTask: { msg: 'msg' },
      },
    );
    expect(allTasks).toMatchObject({
      taskItems: [{ num: '1' }, { num: '2', msg: 'msg' }, { num: '3' }],
      fetched: true,
      fetching: false,
      error: 'none',
    });
  });

  it('copy task', () => {
    const allTasks = taskReducer(
      {
        taskItems: [{ num: '1' }, { num: '2', _id: 0 }, { num: '3' }],
      },
      {
        type: types.COPY_TASK,
        taskId: 0,
      },
    );
    expect(allTasks).toMatchObject({
      copiedTask: { num: '2' },
    });
  });
});
