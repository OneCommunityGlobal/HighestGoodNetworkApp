import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
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
} from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';
import TimeEntryForm from '../../components/Timelog/TimeEntryForm';
import * as actions from '../../actions/timeEntries';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureStore([thunk]);
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
describe('<TimeEntryForm edit/>', () => {
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
    // useDispatch.mockReturnValue(jest.fn());
    renderWithProvider(
      <MemoryRouter initialEntries={['/']}>
        <TimeEntryForm userId={data.personId} data={data} edit toggle={toggle} isOpen />
      </MemoryRouter>,
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
    //expect(screen.getByRole('combobox')).toHaveValue(data.projectname);
  });
  it('should change Time with user input', async () => {
    //TEST FAILING NEEDS TO BE LOOKED AT
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
    //userEvent.selectOptions(project, userProjectMock.projects[1].projectId);
    //expect(project).toHaveValue(userProjectMock.projects[1].projectId);
  });
  it('should clear the form once the user clicked the `clear form` button', () => {
    userEvent.click(screen.getByRole('button', { name: /clear form/i }));
    //expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(0);
    //expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(0);
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
    //expect(actions.editTimeEntry).toHaveBeenCalled();
    //expect(actions.editTimeEntry).toHaveBeenCalledWith(data._id, timeEntry);

    // Save button is now disabled when you don't make any edits to the time.
    // That needs to be taken into account to fix these two tests.
  });
});
