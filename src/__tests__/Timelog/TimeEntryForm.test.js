import React from 'react';
import {
  screen, render, fireEvent, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import moment from 'moment';
import {
  authMock, userProfileMock, timeEntryMock, userProjectMock,
} from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';
import TimeEntryForm from '../../components/Timelog/TimeEntryForm';
import * as actions from '../../actions/timeEntries';

const mockStore = configureStore([thunk]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('<TimeEntryForm />', () => {
  let store;
  let toggle;
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
    });
    toggle = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <TimeEntryForm
        userId={data.personId}
        data={data}
        edit={false}
        toggle={toggle}
        isOpen
      />,
      {
        store,
      },
    );
  });
  it('should dispatch the right action with the right payload after add new time entry', async () => {
    const expectedPayload = {
      personId: data.personId,
      dateOfWork: moment().format('YYYY-MM-DD'),
      notes: '',
      isTangible: 'true',
      projectId: userProjectMock.projects[0].projectId,
      timeSpent: '01:0:00',
    };
    actions.postTimeEntry = jest.fn();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    userEvent.type(screen.getAllByRole('spinbutton')[0], '1');
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(1);

    fireEvent.change(screen.getByDisplayValue(/select project/i), { target: { value: userProjectMock.projects[0].projectId } });
    await sleep(100);
    userEvent.selectOptions(screen.getByRole('combobox'), userProjectMock.projects[0].projectId);
    const notes = screen.getByLabelText(/notes/i);
    fireEvent.change(notes, { target: { value: 'Test123' } });
    await sleep(1000);
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(actions.postTimeEntry).toHaveBeenCalledTimes(1);
    expect(actions.postTimeEntry).toHaveBeenCalledWith(expectedPayload);
    await waitFor(() => {
      expect(toggle).toHaveBeenCalled();
    });
  });
});
