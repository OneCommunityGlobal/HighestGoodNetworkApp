import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { authMock, userProfileMock, timeEntryMock, userProjectMock, rolesMock } from '../mockStates';
import { renderWithProvider } from '../utils';
import TimeEntryForm from '../../components/Timelog/TimeEntryForm';
import * as actions from '../../actions/timeEntries';

const mockStore = configureStore([thunk]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('<TimeEntryForm />', () => {
  let store;
  let toggle;
  let userProfile;
  let role
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role
    });
    userProfile = jest.fn();
    role = jest.fn();

    toggle = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <TimeEntryForm
        userId={data.personId}
        edit={false}
        data={data}
        isOpen
        toggle={toggle}
        timer
        userProfile={userProfile}
        resetTimer
      />,
      {
        store,
      },
    );
  });
  it('should dispatch the right action with the right payload after add new time entry', async () => {
    actions.postTimeEntry = jest.fn();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select Project/Task')).toBeInTheDocument();
    userEvent.type(screen.getAllByRole('spinbutton')[0], '1');
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(1);

    fireEvent.change(screen.getByDisplayValue(/select project/i), {
      target: { value: userProjectMock.projects[0].projectId },
    });
    await sleep(100);
    const notes = screen.getByLabelText(/notes/i);
    fireEvent.change(notes, { target: { value: 'Test123' } });
    await sleep(1000);
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
  });
  it('should render the openInfo and the content', () => {
    const tips = screen.getByTitle('timeEntryTip');
    fireEvent.click(tips);
    expect(screen.getByText(/This is the One Community time clock*/i)).toBeInTheDocument();
  });
  it('should render the tangible tip info and the content', () => {
    const tips = screen.getByTitle('tangibleTip');
    userEvent.click(tips, 1);
    expect(screen.getByText(/Intangible time is time logged*/i)).toBeInTheDocument();
  });
  it('should render the correct tangible checkbox', () => {
    const checkbox = screen.getByRole('checkbox');
    if (data.isTangible) {
      expect(checkbox).toBeChecked();
    } else {
      expect(checkbox).not.toBeChecked();
    }
  });
  it('should populate errors if date field is empty or invalid', async () => {
    const dateField = screen.getByLabelText(/date/i);
    userEvent.clear(dateField);
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });
  it('should populate errors if time fields are empty or invalid', async () => {
    const hours = screen.getAllByRole('spinbutton')[0];
    const minutes = screen.getAllByRole('spinbutton')[1];
    userEvent.type(hours, '0');
    userEvent.type(minutes, '0');
    expect(hours).toHaveValue(0);
    expect(minutes).toHaveValue(0);
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Time should be greater than 0')).toBeInTheDocument();
  });
  it('should populate errors if project field is empty or invalid', async () => {
    const projectField = screen.getByDisplayValue(/select project/i);
    fireEvent.change(projectField, { target: { value: '' } });
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Project/Task is required')).toBeInTheDocument();
  });
});

describe('<TimeEntryFormEdit />', () => {
  let store;
  let toggle;
  let userProfile;
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock
    });
    userProfile = jest.fn();
    toggle = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <TimeEntryForm
        userId={data.personId}
        edit={true}
        data={data}
        isOpen
        toggle={toggle}
        timer
        userProfile={userProfile}
        resetTimer
      />,
      {
        store,
      },
    );
  });

  it('should dispatch the right action with the right payload after edit a time entry', async () => {
    const expectedPayload = {
      personId: '5edf141c78f1380017b829a6',
      dateOfWork: '2020-08-12',
      isTangible: 'true',
      projectId: '5a849055592ca46b43db2729',
      timeSpent: '06:43:00',
    };
    actions.editTimeEntry = jest.fn();
    const dateField = screen.getByLabelText(/date/i);
    const hours = screen.getAllByRole('spinbutton')[0];
    const minutes = screen.getAllByRole('spinbutton')[1];
    const projectField = screen.getByRole('combobox');
    const noteField = screen.getByLabelText(/notes/i);
    expect(screen.getByTestId('timeEntryFormModal')).toBeInTheDocument();
    expect(dateField).toBeInTheDocument();
    expect(hours).toBeInTheDocument();
    expect(minutes).toBeInTheDocument();
    expect(projectField).toBeInTheDocument();
    expect(noteField).toBeInTheDocument();
    fireEvent.change(hours, { target: { value: '6' } });
    await sleep(10);
    fireEvent.change(noteField, {
      target: {
        value:
          'Edit Note. This should work normally. Does this thing work? \n https://www.google.com/',
      },
    });
    expect(hours).toHaveValue(6);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(actions.editTimeEntry).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(toggle).toHaveBeenCalled();
    });
  });
});
