import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import Timelog from '../../components/Timelog/Timelog';
import configureStore from 'redux-mock-store';
import * as actions from '../../actions/timeEntries';
import moment from 'moment';

const mockStore = configureStore([thunk]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    store.dispatch = jest.fn();
    renderWithRouterMatch(
      <Route path="/timelog/:id">
        {props => <Timelog {...props} />}
      </Route>,
      {
        route: '/timelog/5edf141c78f1380017b829a6',
        store,
      },
    );
  });
  it('should render Timelog without crashing', () => {
  });
  it('should render <TimeEntryForm /> after click `Add Time Entry` button', async () => {
    const button = screen.getByRole('button', { name: /add.*/i });
    expect(button).toBeInTheDocument();
    userEvent.click(button);
    await waitFor(() => screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should switching between tabs after the user clicks the tab', async () => {
    const currentWeek = screen.getByRole('link', { name: /current week/i });
    const lastWeek = screen.getByRole('link', { name: /last week/i });
    const weekBeforeLast = screen.getByRole('link', { name: /week before last/i });
    userEvent.click(currentWeek);
    await sleep(100);
    expect(currentWeek).toHaveClass('active');
    expect(lastWeek).not.toHaveClass('active');
    expect(weekBeforeLast).not.toHaveClass('active');
    userEvent.click(lastWeek);
    await sleep(100);
    expect(lastWeek).toHaveClass('active');
    expect(currentWeek).not.toHaveClass('active');
    expect(weekBeforeLast).not.toHaveClass('active');
    userEvent.click(weekBeforeLast);
    await sleep(100);
    expect(weekBeforeLast).toHaveClass('active');
    expect(lastWeek).not.toHaveClass('active');
    expect(currentWeek).not.toHaveClass('active');
  });
  it('should render filtered project with <select>', async () => {
    const projectSelect = screen.getByLabelText(/filter entries by project/i);
    expect(projectSelect).toHaveValue('all');
    userEvent.selectOptions(projectSelect, userProjectMock.projects[1].projectId);
    expect(screen.getAllByRole('heading', { name: /mock project \d/i })).toHaveLength(2);
    userEvent.selectOptions(projectSelect, userProjectMock.projects[0].projectId);
    expect(screen.queryAllByRole('heading', { name: /mock project \d/i })).toHaveLength(0);
    userEvent.selectOptions(projectSelect, userProjectMock.projects[3].projectId);
    expect(screen.queryAllByRole('heading', { name: /mock project \d/i })).toHaveLength(3);
  });
});