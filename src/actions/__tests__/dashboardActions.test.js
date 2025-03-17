import {
  incrementDashboardTaskCount,
  INCREMENT_DASHBOARD_TASK_COUNT,
} from '../dashboardActions';

describe('incrementDashboardTaskCount action creator', () => {
  it('should create an action to increment the dashboard task count', () => {
    const taskId = 123;
    const expectedAction = {
      type: INCREMENT_DASHBOARD_TASK_COUNT,
      payload: { taskId },
    };

    // Spy on console.log
    console.log = jest.fn();

    const action = incrementDashboardTaskCount(taskId);

    expect(action).toEqual(expectedAction);
    expect(console.log).toHaveBeenCalledWith(
      `Dispatching incrementDashboardTaskCount for task ID: ${taskId}`,
    );
  });
});
