import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { updateStatusNote } from '../userManagement';
import { ENDPOINTS } from '../../utils/URL';
import { USER_PROFILE_UPDATE } from '../../constants/userManagement';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);
const user = { _id: 'user-1', firstName: 'Test', statusNote: '', statusNoteHistory: [] };
const historyEntry = { action: 'added', note: 'Left for a new job' };

describe('updateStatusNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the trimmed note and returns the saved note and history', async () => {
    axios.patch.mockResolvedValueOnce({
      data: { statusNote: 'Left for a new job', statusNoteHistory: [historyEntry] },
    });
    const store = mockStore({ allUserProfiles: { userProfiles: [user] } });

    const saved = await store.dispatch(updateStatusNote(user, '  Left for a new job  '));

    expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.UPDATE_STATUS_NOTE('user-1'), {
      statusNote: 'Left for a new job',
    });
    expect(saved).toEqual({
      ...user,
      statusNote: 'Left for a new job',
      statusNoteHistory: [historyEntry],
    });
    expect(store.getActions()).toEqual([{ type: USER_PROFILE_UPDATE, user: saved }]);
  });

  it('does not touch the User Management list when the user is not in it', async () => {
    axios.patch.mockResolvedValueOnce({ data: { statusNote: '', statusNoteHistory: [] } });
    const store = mockStore({ allUserProfiles: { userProfiles: [{ _id: 'someone-else' }] } });

    const saved = await store.dispatch(updateStatusNote(user, ''));

    expect(saved.statusNote).toBe('');
    expect(store.getActions()).toEqual([]);
  });

  it('passes the error on when saving fails', async () => {
    axios.patch.mockRejectedValueOnce(new Error('Forbidden'));
    const store = mockStore({ allUserProfiles: { userProfiles: [user] } });

    await expect(store.dispatch(updateStatusNote(user, 'Note'))).rejects.toThrow('Forbidden');
    expect(store.getActions()).toEqual([]);
  });
});
