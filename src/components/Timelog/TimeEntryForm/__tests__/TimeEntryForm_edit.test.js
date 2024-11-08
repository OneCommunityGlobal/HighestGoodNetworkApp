import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import moment from 'moment-timezone';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  rolesMock,
} from '../../../../__tests__/mockStates';
import { renderWithProvider } from '../../../../__tests__/utils';
import TimeEntryForm from '../TimeEntryForm';
import * as actions from '../../../../actions/timeEntries';

const mockStore = configureStore([thunk]);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

xdescribe('<TimeEntryForm edit/>', () => {
  let store;
  let toggle;
  const data = timeEntryMock.weeks[0][0];

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock,
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

  it('should render TimeEntryForm without crashing', () => {});

  it('should render with the correct placeholder first', () => {
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(parseInt(data.hours, 10));
    expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(parseInt(data.minutes, 10));
    expect(screen.getByLabelText('Date')).toHaveValue(data.dateOfWork);
    // expect(screen.getByRole('combobox')).toHaveValue(data.projectname);
  });

  it('should change Time with user input', async () => {
    // TEST FAILING NEEDS TO BE LOOKED AT
    // const hours = screen.getByPlaceholderText('Hours');
    // const minutes = screen.getByPlaceholderText('Minutes');
    // fireEvent.change(hours, { target: { value: 456 } });
    // await sleep(1000);
    // fireEvent.change(minutes, { target: { value: 13 } });
    // expect(hours).toHaveValue(456);
    // expect(minutes).toHaveValue(13);
  });

  it('should change Project with user input', () => {
    const project = screen.getByRole('combobox');
    userEvent.selectOptions(project, userProjectMock.projects[1].projectId);
    expect(project).toHaveValue(userProjectMock.projects[1].projectId);
  });

  it('should clear the form once the user clicked the `clear form` button', () => {
    userEvent.click(screen.getByRole('button', { name: /clear form/i }));
    // expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(0);
    // expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(0);
    expect(screen.getByLabelText('Date')).toHaveValue(
      moment()
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
    );
    expect(screen.getByRole('combobox')).toHaveValue('');
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

  it('should generate warnings if some of the required fields are left blank', async () => {
    userEvent.click(screen.getByRole('button', { name: /clear form/i }));
    userEvent.click(screen.getByRole('button', { name: /save/i }));
    /**
     * await waitFor(() => {
        expect(screen.getByText(/time should be greater than 0/i)).toBeInTheDocument();
      });
     */
    expect(screen.getByText('Project/Task is required')).toBeInTheDocument();
  });

  it('should dispatch action when click Save', async () => {
    const save = screen.getByRole('button', { name: /save/i });

    // Use jest.spyOn to mock the editTimeEntry action
    jest.spyOn(actions, 'editTimeEntry').mockImplementation(() => Promise.resolve({ success: true }));

    const expectedPayload = {
      personId: data.personId,
      dateOfWork: data.dateOfWork,
      hours: data.hours,
      minutes: data.minutes,
      projectId: data.projectId,
      notes: `${data.notes}`,
      isTangible: data.isTangible.toString(),
    };

    userEvent.click(save);
    expect(store.dispatch).toBeCalled();
    expect(actions.editTimeEntry).toHaveBeenCalled();
    expect(actions.editTimeEntry).toHaveBeenCalledWith(data._id, expectedPayload);
  });
});

xdescribe('<TimeEntryFormEdit />', () => {
  let store;
  let toggle;
  let userProfile;
  const data = timeEntryMock.weeks[0][0];

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock,
    });
    userProfile = jest.fn();
    toggle = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <TimeEntryForm
        userId={data.personId}
        edit
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

    // Use jest.spyOn to mock the editTimeEntry action
    jest.spyOn(actions, 'editTimeEntry').mockImplementation(() => Promise.resolve({ success: true }));

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
    // userEvent.selectOptions(projectField, userProjectMock.projects[1].projectId);
    fireEvent.change(noteField, {
      target: {
        value:
          'Edit Note. This should work normally. Does this thing work? \n https://www.google.com/',
      },
    });
    expect(hours).toHaveValue(6);
    // expect(projectField).toHaveValue(userProjectMock.projects[1].projectId);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(actions.editTimeEntry).toHaveBeenCalledTimes(1);
      expect(toggle).toHaveBeenCalled();
    });
    // Uncomment the following lines to utilize expectedPayload
    expect(actions.editTimeEntry).toHaveBeenCalledWith(expectedPayload);
    await waitFor(() => {
      expect(toggle).toHaveBeenCalled();
    });
  });

  it('should populate errors if notes fields are empty or invalid', async () => {
    /*
    fireEvent.click(screen.getByRole('button', { name: /clear form/i }));
    await sleep(1000);
    userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText("Description and reference link are required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await sleep(1000);
    expect(screen.getByText('Description and reference link are require')).toBeInTheDocument();
    */
  });
});
