import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import moment from 'moment-timezone';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { authMock, userProfileMock, timeEntryMock, userProjectMock, rolesMock, viewingUserMock } from '../mockStates';
import { renderWithProvider } from '../utils';
import TimeEntry from '../../components/Timelog/TimeEntry';

const mockStore = configureStore([thunk]);
const weekDayRegex = /monday|tuesday|wednesday|thursday|friyday|saturday|sunday/i;
const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d?/i;

const server = setupServer(rest.get('*', (req, res, ctx) => res(ctx.status(200))));

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

xdescribe('<TimeEntry />', () => {
  let store;
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      viewingUser: viewingUserMock,
    });
    renderWithProvider(<TimeEntry data={data} displayYear />, {
      store,
    });
  });
  it('should render <TimeEntry /> without crashing', () => {});
  it('should render the correct date, year, and the day of the week', () => {
    const date = screen.getByRole('heading', { name: dateRegex });
    expect(date.textContent).toMatch(moment(timeEntryMock.weeks[0][0].dateOfWork).format('MMM D'));
    const dayOfWeek = screen.getByRole('heading', { name: weekDayRegex });
    expect(dayOfWeek.textContent).toMatch(
      moment(timeEntryMock.weeks[0][0].dateOfWork).format('dddd'),
    );
    const year = screen.getByRole('heading', { name: /20\d\d/ });
    expect(year.textContent).toMatch(moment(timeEntryMock.weeks[0][0].dateOfWork).format('YYYY'));
  });
  it('should render the correct project time length', () => {
    const projectLength = screen.getByRole('heading', { name: /\d*h \d*m/i });
    expect(projectLength.textContent).toMatch(`${data.hours}h ${data.minutes}m`);
  });
  it('should render the correct project title with notes', () => {
    // screen.debug();
    // const projectTitle = screen.getByRole('heading', { name: data.projectName });
    const projectNotes = screen.getByText(data.notes.split(/<p>|<\/p>/)[1]);
    // expect(projectTitle).toBeInTheDocument();
    expect(projectNotes).toBeInTheDocument();
  });
  it('should render the correct tangible checkbox', () => {
    const checkbox = screen.getByRole('checkbox');
    if (data.isTangible) {
      expect(checkbox).toBeChecked();
    } else {
      expect(checkbox).not.toBeChecked();
    }
  });
  // todo: test two buttons
  it('should render DeleteModal', () => {
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBe(2);
    userEvent.click(icons[1]);
    expect(screen.getByRole('document')).toHaveClass('modal-dialog');
    expect(screen.getByText(/are you sure.*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
  it('should render entryForm', () => {
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBe(2);
    userEvent.click(icons[0]);
    expect(screen.getByRole('document')).toHaveClass('modal-dialog');
    expect(screen.getByTestId('timeEntryFormModal')).toBeInTheDocument();
  });
});
