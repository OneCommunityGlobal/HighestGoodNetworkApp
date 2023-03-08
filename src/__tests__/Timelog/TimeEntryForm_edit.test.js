import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import moment from 'moment-timezone';
import { authMock, userProfileMock, timeEntryMock, userProjectMock, rolesMock } from '../mockStates';
import { renderWithProvider } from '../utils';
import TimeEntryForm from '../../components/Timelog/TimeEntryForm';
import * as actions from '../../actions/timeEntries';

const mockStore = configureStore([thunk]);

describe('<TimeEntryForm edit/>', () => {
  let store;
  let toggle;
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock
    });
    toggle = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <TimeEntryForm userId={data.personId} data={data} edit toggle={toggle} isOpen />,
      {
        store,
      },
    );
  });

  it('should render with the correct placeholder first', () => {
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(parseInt(data.hours, 10));
    expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(parseInt(data.minutes, 10));
    expect(screen.getByLabelText('Date')).toHaveValue(data.dateOfWork);
  });

  it('should change Notes with user input', async () => {
    const notes = screen.getByLabelText(/notes/i);
    fireEvent.change(notes, { target: { value: 'this is a test' } });
    expect(notes).toHaveValue('this is a test');
  });

  it('should change Tengible with user input', () => {
    const tengible = screen.getByRole('checkbox');
    expect(tengible).toBeChecked();
    userEvent.click(tengible);
    expect(tengible).not.toBeChecked();
  });

  it('should dispatch action when click Save', async () => {
    const save = screen.getByRole('button', { name: /save/i });
    actions.editTimeEntry = jest.fn();
    const timeEntry = {};
    timeEntry.personId = data.personId;
    timeEntry.dateOfWork = data.dateOfWork;
    timeEntry.hours = data.hours;
    timeEntry.minutes = data.minutes;
    timeEntry.projectId = data.projectId;
    timeEntry.notes = `${data.notes}`;
    timeEntry.isTangible = data.isTangible.toString();
    userEvent.click(save);
    expect(store.dispatch).toBeCalled();
  });

});
