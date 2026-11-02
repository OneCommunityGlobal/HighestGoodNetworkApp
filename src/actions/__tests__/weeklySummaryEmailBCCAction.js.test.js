import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as types from '../../constants/WeeklySummaryEmailBccConstants';
import { updateWeeklySummaryEmailAssignment } from '../weeklySummaryEmailBCCAction';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

describe('updateWeeklySummaryEmailAssignment action creator', () => {
  it('dispatches updated assignment when API returns wrapped assignment payload', async () => {
    const store = mockStore({});
    const updatedAssignment = {
      _id: 'assignment-id',
      email: 'updated@example.com',
      assignedTo: { _id: 'user-id', firstName: 'Updated', lastName: 'User' },
    };

    axios.put.mockResolvedValue({
      status: 200,
      data: { assignment: updatedAssignment },
    });

    await store.dispatch(updateWeeklySummaryEmailAssignment('assignment-id', 'updated@example.com'));

    expect(store.getActions()).toContainEqual({
      type: types.UPDATE_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT,
      payload: updatedAssignment,
    });
  });

  it('dispatches updated assignment when API returns assignment directly', async () => {
    const store = mockStore({});
    const updatedAssignment = {
      _id: 'assignment-id',
      email: 'updated@example.com',
    };

    axios.put.mockResolvedValue({
      status: 200,
      data: updatedAssignment,
    });

    await store.dispatch(updateWeeklySummaryEmailAssignment('assignment-id', 'updated@example.com'));

    expect(store.getActions()).toContainEqual({
      type: types.UPDATE_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT,
      payload: updatedAssignment,
    });
  });

  it('dispatches error action when update fails', async () => {
    const store = mockStore({});
    const error = new Error('Network Error');

    axios.put.mockRejectedValue(error);

    await store.dispatch(updateWeeklySummaryEmailAssignment('assignment-id', 'updated@example.com'));

    expect(store.getActions()).toContainEqual({
      type: types.WEEKLY_SUMMARY_EMAIL_ASSIGNMENT_ERROR,
      payload: error,
    });
  });
});
