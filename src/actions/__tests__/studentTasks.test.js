import httpService from '../../services/httpService';
import * as types from '../../constants/studentTasks';
import { fetchStudentTasks } from '../studentTasks';

vi.mock('../../services/httpService');

const buildGroupedResponse = task => ({
  data: {
    tasks: {
      'Unknown Subject': {
        subject: task.subject,
        colorLevels: {
          unknown: {
            color_level: 'unknown',
            difficulty_level: undefined,
            activityGroups: {
              Unassigned: {
                activity_group: 'Unassigned',
                tasks: [task],
              },
            },
          },
        },
      },
    },
  },
});

describe('fetchStudentTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the real lesson plan title instead of "Unknown Subject" when the task has no subject', async () => {
    const realTask = {
      _id: '65cf6c3706d8ac105827bb2e',
      subject: undefined,
      lessonPlan: { title: 'Algebra Fundamentals' },
      status: 'assigned',
    };
    httpService.get.mockResolvedValue(buildGroupedResponse(realTask));

    const dispatch = vi.fn();
    await fetchStudentTasks()(dispatch, () => ({}));

    const receiveAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action.type === types.RECEIVE_STUDENT_TASKS);

    expect(receiveAction.taskItems).toHaveLength(1);
    expect(receiveAction.taskItems[0].course_name).toBe('Algebra Fundamentals');
    expect(receiveAction.taskItems[0].course_name).not.toBe('Unknown Subject');
    expect(receiveAction.taskItems[0].id).toBe('65cf6c3706d8ac105827bb2e');
  });

  it('falls back to the real atom name when there is no subject and no lesson plan title', async () => {
    const realTask = {
      _id: '65cf6c3706d8ac105827bb31',
      subject: undefined,
      lessonPlan: undefined,
      atom: { name: 'Photosynthesis Basics' },
      status: 'assigned',
    };
    httpService.get.mockResolvedValue(buildGroupedResponse(realTask));

    const dispatch = vi.fn();
    await fetchStudentTasks()(dispatch, () => ({}));

    const receiveAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action.type === types.RECEIVE_STUDENT_TASKS);

    expect(receiveAction.taskItems[0].course_name).toBe('Photosynthesis Basics');
    expect(receiveAction.taskItems[0].course_name).not.toBe('Unknown Subject');
  });

  it('uses the real subject name when the API provides one', async () => {
    const realTask = {
      _id: '65cf6c3706d8ac105827bb2f',
      subject: { name: 'Mathematics' },
      lessonPlan: { title: 'Algebra Fundamentals' },
      status: 'assigned',
    };
    httpService.get.mockResolvedValue({
      data: {
        tasks: {
          Mathematics: {
            subject: { name: 'Mathematics' },
            colorLevels: {
              unknown: {
                color_level: 'unknown',
                activityGroups: {
                  Unassigned: { activity_group: 'Unassigned', tasks: [realTask] },
                },
              },
            },
          },
        },
      },
    });

    const dispatch = vi.fn();
    await fetchStudentTasks()(dispatch, () => ({}));

    const receiveAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action.type === types.RECEIVE_STUDENT_TASKS);

    expect(receiveAction.taskItems[0].course_name).toBe('Mathematics');
  });

  it('falls back to demo data when the API returns no tasks at all', async () => {
    httpService.get.mockResolvedValue({ data: { tasks: {} } });

    const dispatch = vi.fn();
    await fetchStudentTasks()(dispatch, () => ({}));

    const receiveAction = dispatch.mock.calls
      .map(call => call[0])
      .find(action => action.type === types.RECEIVE_STUDENT_TASKS);

    expect(receiveAction.taskItems.length).toBeGreaterThan(0);
  });
});
