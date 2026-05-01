import React from 'react';
import { screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
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

const mockStore = configureStore([thunk]);
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

  const renderComponent = () => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: { darkMode: false },
    });

    renderWithProvider(
      <TimeEntry
        data={data}
        displayYear
        from="WeeklyTab"
        timeEntryUserProfile={userProfileMock}
        tab={0}
      />,
      { store }
    );
  };

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