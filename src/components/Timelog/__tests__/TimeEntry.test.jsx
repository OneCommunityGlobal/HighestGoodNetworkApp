import React from 'react';
import { screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import moment from 'moment-timezone';
// eslint-disable-next-line import/named
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  rolesMock,
} from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import TimeEntry from '../TimeEntry';

const mockStore = configureMockStore([thunk]);
const weekDayRegex = /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i;
const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d?/i;

const server = setupServer(
  rest.get('*', (req, res, ctx) => res(ctx.status(200)))
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('<TimeEntry />', () => {
  let store;
  const data = timeEntryMock.weeks[0][0];

  const renderComponent = (entry = data) => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: { darkMode: false },
    });

    renderWithProvider(
      <TimeEntry
        data={entry}
        displayYear
        from="WeeklyTab"
        timeEntryUserProfile={userProfileMock}
        tab={0}
      />,
      { store }
    );
  };

  it('shows who edited the entry, and nothing for an entry never edited', () => {
    renderComponent();
    expect(screen.queryByText(/This time log was edited on/)).not.toBeInTheDocument();

    renderComponent({
      ...data,
      lastModifiedDateTime: '2026-10-09T12:00:00.000Z',
      lastModifiedBy: { firstName: 'Jane', lastName: 'Doe', role: 'Administrator' },
    });
    expect(
      screen.getByText('This time log was edited on Oct 9, 2026 by Administrator: Jane Doe'),
    ).toBeInTheDocument();
  });

  it('shows who added the entry only when it was logged by someone else', () => {
    const creator = { _id: 'admin1', firstName: 'Sam', lastName: 'Lee', role: 'Owner' };
    renderComponent({ ...data, personId: 'user1', createdBy: { ...creator, _id: 'user1' } });
    expect(screen.queryByText(/This time log was added on/)).not.toBeInTheDocument();

    renderComponent({
      ...data,
      personId: 'user1',
      createdDateTime: '2026-10-08T12:00:00.000Z',
      createdBy: creator,
    });
    expect(
      screen.getByText('This time log was added on Oct 8, 2026 by Owner: Sam Lee'),
    ).toBeInTheDocument();
  });

  it('should render <TimeEntry /> without crashing', () => {
    renderComponent();
  });

  it('should render the correct date, year, and the day of the week', () => {
    renderComponent();
    const date = screen.getByRole('heading', { name: dateRegex });
    expect(date.textContent).toMatch(moment(data.dateOfWork).format('MMM D'));

    const dayOfWeek = screen.getByRole('heading', { name: weekDayRegex });
    expect(dayOfWeek.textContent).toMatch(moment(data.dateOfWork).format('dddd'));

    const year = screen.getByRole('heading', { name: /20\d\d/ });
    expect(year.textContent).toMatch(moment(data.dateOfWork).format('YYYY'));
  });

  it('should render the correct project time length', () => {
    renderComponent();
    const projectLength = screen.getByRole('heading', { name: /\d*h \d*m/i });
    expect(projectLength.textContent).toMatch(`${data.hours}h ${data.minutes}m`);
  });

  it('should render the correct project title with notes', () => {
    renderComponent();
    const projectNotes = screen.getByText(data.notes.split(/<p>|<\/p>/)[1]);
    expect(projectNotes).toBeInTheDocument();
  });

  it('should display tangible status text', () => {
    renderComponent();
    const statusText = data.isTangible ? 'Tangible' : 'Intangible';
    expect(screen.getByText(statusText)).toBeInTheDocument();
  });

  it('should not render DeleteModal button when no permission', () => {
    renderComponent();
    const deleteButton = screen.queryByRole('button', { name: /DeleteModal/i });
    expect(deleteButton).toBeNull();
  });

  it('should not render edit button when no permission', () => {
    renderComponent();
    const editButton = screen.queryByRole('button', { name: /FAEdit/i });
    expect(editButton).toBeNull();
  });
});