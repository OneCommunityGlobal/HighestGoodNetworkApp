import axios from 'axios';
import {
  fetchTeamMembersTask,
  fetchTeamMembersTimeEntries,
  editTeamMemberTimeEntry,
  deleteTaskNotification,
} from '../task';
import {
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersDataBegin,
  fetchTeamMembersDataError,
  updateTeamMembersTimeEntrySuccess,
  deleteTaskNotificationSuccess,
} from '../../components/TeamMemberTasks/actions';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return {
    ...actualMoment,
    tz: jest.fn(() => ({
      subtract: jest.fn().mockReturnValue({
        format: jest.fn().mockReturnValue('2023-01-01'),
      }),
      format: jest.fn().mockReturnValue('2023-01-07'),
    })),
  };
});

describe('Task Actions', () => {
  const mockDispatch = jest.fn();
  const mockGetState = jest.fn(() => ({
    teamMemberTasks: {
      usersWithTasks: [{ personId: '123' }, { personId: '456' }],
    },
    auth: { user: { userid: 'testUser' } },
    tasks: { taskItems: [{ _id: 'task123', name: 'Test Task' }] },
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
  });

  describe('fetchTeamMembersTask', () => {
    it('should dispatch fetchTeamMembersTaskSuccess and fetchTeamMembersTimeEntries on success', async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ personId: '123', name: 'Test User' }],
      });

      await fetchTeamMembersTask('testUser')(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(fetchTeamMembersDataBegin());
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.TEAM_MEMBER_TASKS('testUser'));
      expect(mockDispatch).toHaveBeenCalledWith(
        fetchTeamMembersTaskSuccess({
          usersWithTasks: [{ personId: '123', name: 'Test User' }],
        }),
      );
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should dispatch fetchTeamMembersDataError on failure', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      await fetchTeamMembersTask('testUser')(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(fetchTeamMembersDataBegin());
      expect(mockDispatch).toHaveBeenCalledWith(fetchTeamMembersDataError());
    });
  });

  describe('fetchTeamMembersTimeEntries', () => {
    beforeEach(() => {
      ENDPOINTS.TIME_ENTRIES_USER_LIST = 'http://localhost:4500/api/TimeEntry/users';
    });

    it('should dispatch fetchTeamMembersDataError on failure', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      await fetchTeamMembersTimeEntries()(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(fetchTeamMembersDataBegin());
      expect(mockDispatch).toHaveBeenCalledWith(fetchTeamMembersDataError());
    });
  });

  describe('editTeamMemberTimeEntry', () => {
    it('should dispatch updateTeamMembersTimeEntrySuccess on success', async () => {
      const mockTimeEntry = { _id: 'timeEntry123', hours: 5 };
      axios.put.mockResolvedValueOnce({ data: mockTimeEntry });

      await editTeamMemberTimeEntry(mockTimeEntry)(mockDispatch);

      expect(axios.put).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRY_CHANGE('timeEntry123'),
        mockTimeEntry,
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        updateTeamMembersTimeEntrySuccess({ ...mockTimeEntry }),
      );
    });

    it('should throw an error on failure', async () => {
      const mockTimeEntry = { _id: 'timeEntry123', hours: 5 };
      axios.put.mockRejectedValueOnce(new Error('Network Error'));

      await expect(editTeamMemberTimeEntry(mockTimeEntry)(mockDispatch)).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('deleteTaskNotification', () => {
    it('should dispatch deleteTaskNotificationSuccess on success', async () => {
      const taskId = 'task123';
      const userId = 'user123';
      const taskNotificationId = 'notification123';

      axios.delete.mockResolvedValueOnce();

      await deleteTaskNotification(userId, taskId, taskNotificationId)(mockDispatch, mockGetState);

      expect(axios.delete).toHaveBeenCalledWith(
        ENDPOINTS.DELETE_TASK_NOTIFICATION_BY_USER_ID(taskId, userId),
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        deleteTaskNotificationSuccess({ userId, taskId, taskNotificationId }),
      );
    });

    it('should not dispatch deleteTaskNotificationSuccess on failure', async () => {
      axios.delete.mockRejectedValueOnce(new Error('Network Error'));

      await deleteTaskNotification(
        'user123',
        'task123',
        'notification123',
      )(mockDispatch, mockGetState);

      expect(mockDispatch).not.toHaveBeenCalledWith(
        deleteTaskNotificationSuccess(expect.anything()),
      );
    });
  });
});
