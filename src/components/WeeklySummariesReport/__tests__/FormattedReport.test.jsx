import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import moment from 'moment';
import momentTz from 'moment-timezone';
import FormattedReport from '../FormattedReport';
import '@testing-library/jest-dom/extend-expect';

vi.mock('../../../utils/permissions', () => ({
  __esModule: true,
  default: () => () => true,
  cantUpdateDevAdminDetails: () => false,
}));

vi.mock('~/actions/weeklySummariesReport', () => ({
  updateOneSummaryReport: () => () => Promise.resolve({ status: 200 }),
}));

vi.mock('components/UserProfile/EditableModal/RoleInfoModal', () => {
  function RoleInfoModalMock() {
    return <div data-testid="role-info-modal">RoleInfoModal</div>;
  }
  RoleInfoModalMock.displayName = 'RoleInfoModalMock';
  return RoleInfoModalMock;
});

vi.mock('axios', () => {
  const mAxios = {
    defaults: { headers: { post: {} } },
    patch: vi.fn(() => Promise.resolve({ status: 200 })),
  };
  return {
    __esModule: true,
    default: mAxios,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const initialState = { theme: { darkMode: false } };
const store = createStore(state => state, initialState, applyMiddleware(thunk));

const dummySummary = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  totalSeconds: [3600],
  promisedHoursByWeek: [2],
  weeklySummaries: [
    {
      summary: '<p>Test summary</p>',
      uploadDate: moment().toISOString(),
    },
  ],
  weeklySummariesCount: 10,
  teamCode: 'ABC123',
  mediaUrl: 'http://example.com/media',
  adminLinks: [{ Name: 'Media Folder', Link: 'http://example.com/folder' }],
  badgeCollection: [],
  timeOffFrom: moment()
    .subtract(1, 'days')
    .format(),
  timeOffTill: moment()
    .add(1, 'days')
    .format(),
  totalTangibleHrs: 100,
  bioPosted: 'default',
  weeklySummaryOption: 'Default',
};

const dummyAuthAdmin = {
  user: {
    email: 'admin@example.com',
    role: 'Administrator',
  },
};

const defaultProps = {
  summaries: [dummySummary],
  weekIndex: 0,
  bioCanEdit: true,
  allRoleInfo: [],
  badges: [],
  loadBadges: false,
  canEditTeamCode: true,
  auth: dummyAuthAdmin,
  canSeeBioHighlight: true,
  handleTeamCodeChange: vi.fn(),
  handleSpecialColorDotClick: vi.fn(),
};

describe('FormattedReport minimal test', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={defaultProps.summaries}
            weekIndex={defaultProps.weekIndex}
            bioCanEdit={defaultProps.bioCanEdit}
            allRoleInfo={defaultProps.allRoleInfo}
            badges={defaultProps.badges}
            loadBadges={defaultProps.loadBadges}
            canEditTeamCode={defaultProps.canEditTeamCode}
            auth={defaultProps.auth}
            canSeeBioHighlight={defaultProps.canSeeBioHighlight}
            handleTeamCodeChange={defaultProps.handleTeamCodeChange}
            handleSpecialColorDotClick={defaultProps.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });

  it('does not render the Emails section for non-admin users', () => {
    const nonAdminAuth = { user: { email: 'user@example.com', role: 'Volunteer' } };
    const props = { ...defaultProps, auth: nonAdminAuth };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={props.summaries}
            weekIndex={props.weekIndex}
            bioCanEdit={props.bioCanEdit}
            allRoleInfo={props.allRoleInfo}
            badges={props.badges}
            loadBadges={props.loadBadges}
            canEditTeamCode={props.canEditTeamCode}
            auth={props.auth}
            canSeeBioHighlight={props.canSeeBioHighlight}
            handleTeamCodeChange={props.handleTeamCodeChange}
            handleSpecialColorDotClick={props.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText('Emails')).toBeNull();
  });

  it('renders fallback text when weekly summary text is missing', () => {
    const summaryNoText = {
      ...dummySummary,
      weeklySummaries: [{}], // Missing the 'summary' property.
      weeklySummaryOption: 'Default',
    };
    const props = { ...defaultProps, summaries: [summaryNoText] };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={props.summaries}
            weekIndex={props.weekIndex}
            bioCanEdit={props.bioCanEdit}
            allRoleInfo={props.allRoleInfo}
            badges={props.badges}
            loadBadges={props.loadBadges}
            canEditTeamCode={props.canEditTeamCode}
            auth={props.auth}
            canSeeBioHighlight={props.canSeeBioHighlight}
            handleTeamCodeChange={props.handleTeamCodeChange}
            handleSpecialColorDotClick={props.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText(/Not provided!/)).toBeInTheDocument();
  });

  it('renders media URL link using adminLinks when mediaUrl is not provided', () => {
    const summaryNoMedia = {
      ...dummySummary,
      mediaUrl: null,
    };
    const props = { ...defaultProps, summaries: [summaryNoMedia] };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={props.summaries}
            weekIndex={props.weekIndex}
            bioCanEdit={props.bioCanEdit}
            allRoleInfo={props.allRoleInfo}
            badges={props.badges}
            loadBadges={props.loadBadges}
            canEditTeamCode={props.canEditTeamCode}
            auth={props.auth}
            canSeeBioHighlight={props.canSeeBioHighlight}
            handleTeamCodeChange={props.handleTeamCodeChange}
            handleSpecialColorDotClick={props.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );
    const mediaLink = screen.getByText(/Open link to media files/);
    expect(mediaLink).toBeInTheDocument();
    expect(mediaLink).toHaveAttribute('href', 'http://example.com/folder');
  });

  it('displays team code as text when editing is disabled', () => {
    const props = { ...defaultProps, canEditTeamCode: false };
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={props.summaries}
            weekIndex={props.weekIndex}
            bioCanEdit={props.bioCanEdit}
            allRoleInfo={props.allRoleInfo}
            badges={props.badges}
            loadBadges={props.loadBadges}
            canEditTeamCode={props.canEditTeamCode}
            auth={props.auth}
            canSeeBioHighlight={props.canSeeBioHighlight}
            handleTeamCodeChange={props.handleTeamCodeChange}
            handleSpecialColorDotClick={props.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByPlaceholderText('X-XXX')).toBeNull();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('renders a badge when any earnedDate falls within the selected week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T12:00:00-07:00'));

    const historicalBadgeId = '67919bab07b2a31a54e59265';

    const summaryWithHistoricalBadge = {
      ...dummySummary,
      badgeCollection: [
        {
          count: 1,
          earnedDate: ['Sep-12-26', 'Sep-19-26'],
          badge: historicalBadgeId,
        },
      ],
    };

    const badgeData = [
      {
        _id: historicalBadgeId,
        badgeName: '90 FOR 6 WEEK streak',
        imageUrl: 'https://example.com/test-badge.png',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={[summaryWithHistoricalBadge]}
            weekIndex={1}
            bioCanEdit={defaultProps.bioCanEdit}
            allRoleInfo={defaultProps.allRoleInfo}
            badges={badgeData}
            loadBadges
            canEditTeamCode={defaultProps.canEditTeamCode}
            auth={defaultProps.auth}
            canSeeBioHighlight={defaultProps.canSeeBioHighlight}
            handleTeamCodeChange={defaultProps.handleTeamCodeChange}
            handleSpecialColorDotClick={defaultProps.handleSpecialColorDotClick}
          />
        </MemoryRouter>
      </Provider>,
    );

    const badgeImage = screen.getByAltText('', {
      selector: 'img[src="https://example.com/test-badge.png"]',
    });

    expect(badgeImage).toBeInTheDocument();
  });
});

describe('FormattedReport final week banner', () => {
  const FINAL_WEEK_TEXT = /FINAL WEEK REPORTING: This team member is no longer active/;

  const renderOnTab = (summary, weekIndex) =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport {...defaultProps} summaries={[summary]} weekIndex={weekIndex} />
        </MemoryRouter>
      </Provider>,
    );

  const fourWeeks = {
    totalSeconds: [3600, 3600, 3600, 3600],
    promisedHoursByWeek: [2, 2, 2, 2],
  };

  it('shows the banner for a user deactivated last week on the Last Week tab', () => {
    renderOnTab(
      {
        ...dummySummary,
        ...fourWeeks,
        isActive: false,
        endDate: '2026-09-17T06:59:59.999Z',
        finalWeekIndex: 1,
      },
      1,
    );
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(FINAL_WEEK_TEXT)).toBeInTheDocument();
  });

  it('does not render a deactivated user on a tab other than their final week', () => {
    renderOnTab({ ...dummySummary, ...fourWeeks, isActive: false, finalWeekIndex: 1 }, 0);
    expect(screen.queryByText(/John Doe/)).toBeNull();
  });

  it('renders an active user with a scheduled end date without the banner', () => {
    renderOnTab(
      {
        ...dummySummary,
        ...fourWeeks,
        isActive: true,
        endDate: '2026-10-11T06:59:59.999Z',
        finalWeekIndex: null,
      },
      0,
    );
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.queryByText(FINAL_WEEK_TEXT)).toBeNull();
  });
});

describe('FormattedReport requested week off notice', () => {
  // A request covering the current week, keyed by user id like the reducer state.
  // Dates are built in Pacific time, like the report, so the test does not depend
  // on the machine's timezone (CI runs in UTC).
  const timeOffRequests = {
    [dummySummary._id]: [
      {
        _id: 'req1',
        reason: 'Family trip',
        startingDate: momentTz
          .tz('America/Los_Angeles')
          .startOf('week')
          .toISOString(),
        endingDate: momentTz
          .tz('America/Los_Angeles')
          .endOf('week')
          .toISOString(),
      },
    ],
  };

  const renderReport = (weekIndex = 0) =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FormattedReport
            summaries={defaultProps.summaries}
            weekIndex={weekIndex}
            bioCanEdit={defaultProps.bioCanEdit}
            allRoleInfo={defaultProps.allRoleInfo}
            badges={defaultProps.badges}
            loadBadges={defaultProps.loadBadges}
            canEditTeamCode={defaultProps.canEditTeamCode}
            auth={defaultProps.auth}
            canSeeBioHighlight={defaultProps.canSeeBioHighlight}
            handleTeamCodeChange={defaultProps.handleTeamCodeChange}
            handleSpecialColorDotClick={defaultProps.handleSpecialColorDotClick}
            timeOffRequests={timeOffRequests}
          />
        </MemoryRouter>
      </Provider>,
    );

  it('shows the notice on the week the request covers, with the reason hidden', () => {
    renderReport(0);
    expect(screen.getByText('Requested Week Off')).toBeInTheDocument();
    expect(screen.queryByText('Family trip')).toBeNull();
  });

  it('does not show the notice on a week the request does not cover', () => {
    renderReport(1);
    expect(screen.queryByText('Requested Week Off')).toBeNull();
  });

  it('toggles the reason when the info button is clicked', () => {
    renderReport(0);
    const button = screen.getByRole('button', { name: 'Show time off reason' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Family trip');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(screen.queryByText('Family trip')).toBeNull();
  });

  it('closes the reason on Escape', () => {
    renderReport(0);
    const button = screen.getByRole('button', { name: 'Show time off reason' });
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByText('Family trip')).toBeNull();
  });
});
