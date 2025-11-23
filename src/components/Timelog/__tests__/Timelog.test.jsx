// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { screen, fireEvent, waitFor } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import userEvent from '@testing-library/user-event';
// eslint-disable-next-line no-unused-vars
import thunk from 'redux-thunk';
// eslint-disable-next-line no-unused-vars
import { Route } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import configureMockStore from 'redux-mock-store';
// eslint-disable-next-line no-unused-vars
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../../../__tests__/mockStates';
// eslint-disable-next-line no-unused-vars
import { renderWithRouterMatch } from '../../../__tests__/utils';
// eslint-disable-next-line no-unused-vars
import Timelog from '../Timelog';
// eslint-disable-next-line no-unused-vars
import * as actions from '../../../actions/timeEntries';

/* const mockStore = configureMockStore([thunk]);
vi.mock('../../actions/timeEntries.js');
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('<Timelog/>', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      timeEntries: timeEntryMock,
      userProjects: userProjectMock,
    });
    store.dispatch = vi.fn();
    renderWithRouterMatch(
      <Route path="/timelog/:userId">{(props) => <Timelog {...props} />}</Route>,
      {
        route: '/timelog/5edf141c78f1380017b829a6',
        store,
      },
    );
  });
  it('should render Timelog without crashing', () => {});
  it('should render <TimeEntryForm /> after click `Add Time Entry` button', async () => {
    const button = screen.getByRole('button', { name: /add. */ /* i  });
     /* expect(button).toBeInTheDocument();
    userEvent.click(button);
    await waitFor(() => screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should switching between tabs after the user clicks the tab', async () => {
    const currentWeek = screen.getByRole('link', { name: /current week/i });
    const lastWeek = screen.getByRole('link', { name: /last week/i });
    const weekBeforeLast = screen.getByRole('link', { name: /week before last/i });
    const dateRange = screen.getByRole('link', { name: /search by date range/i });
    userEvent.click(currentWeek);
    await sleep(100);
    expect(currentWeek).toHaveClass('active');
    expect(lastWeek).not.toHaveClass('active');
    expect(weekBeforeLast).not.toHaveClass('active');
    expect(dateRange).not.toHaveClass('active');
    userEvent.click(lastWeek);
    await sleep(100);
    expect(lastWeek).toHaveClass('active');
    expect(currentWeek).not.toHaveClass('active');
    expect(weekBeforeLast).not.toHaveClass('active');
    expect(dateRange).not.toHaveClass('active');
    userEvent.click(weekBeforeLast);
    await sleep(100);
    expect(weekBeforeLast).toHaveClass('active');
    expect(lastWeek).not.toHaveClass('active');
    expect(currentWeek).not.toHaveClass('active');
    expect(dateRange).not.toHaveClass('active');
    userEvent.click(dateRange);
    await sleep(100);
    expect(dateRange).toHaveClass('active');
    expect(lastWeek).not.toHaveClass('active');
    expect(currentWeek).not.toHaveClass('active');
    expect(weekBeforeLast).not.toHaveClass('active');
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });
  it('should dispatch getTimeEntriesForPeriod the user tried to search the timeentries by date range', async () => {
    const dateRange = screen.getByRole('link', { name: /search by date range/i });
    userEvent.click(dateRange);
    await userEvent.type(screen.getByLabelText(/from/i), '2020-08-01', { allAtOnce: false });
    await userEvent.type(screen.getByLabelText('To'), '2020-08-03', { allAtOnce: false });
    userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(actions.getTimeEntriesForPeriod).toHaveBeenCalled();
    expect(actions.getTimeEntriesForPeriod).toHaveBeenCalledWith(
      '5edf141c78f1380017b829a6',
      '2020-08-01',
      '2020-08-03',
    );
  });

  it('should render filtered project with <select> and show number of heading project base on selection', async () => {
    const projectSelect = screen.getByLabelText(/filter entries by project/i);
    expect(projectSelect.value).toBe('all');
    fireEvent.change(projectSelect, { target: { value: userProjectMock.projects[1].projectId } });
    expect(screen.getAllByRole('heading', { name: /mock project \d/i })).toHaveLength(2);
    fireEvent.change(projectSelect, { target: { value: userProjectMock.projects[2].projectId } });
    expect(screen.getAllByRole('heading', { name: /mock project \d/i })).toHaveLength(1);
    fireEvent.change(projectSelect, { target: { value: userProjectMock.projects[3].projectId } });
    expect(screen.getAllByRole('heading', { name: /mock project \d/i })).toHaveLength(3);
  });
}); */
