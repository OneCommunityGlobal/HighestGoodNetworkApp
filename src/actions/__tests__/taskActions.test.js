import axios from 'axios';
import moment from 'moment';
import {
  fetchTeamMembersTask,
  fetchTeamMembersTimeEntries,
  editTeamMemberTimeEntry,
  deleteTaskNotification,
} from '../task';
import {
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersTimeEntriesSuccess,
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
  });
});
