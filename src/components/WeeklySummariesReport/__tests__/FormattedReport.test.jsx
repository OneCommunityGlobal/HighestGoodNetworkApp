import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import moment from 'moment';
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

  describe.each([false, true])('historical badges (darkMode=%s)', darkMode => {
    const historicalBadgeId = '67919bab07b2a31a54e59265';
    const badgeData = [
      {
        _id: historicalBadgeId,
        badgeName: '90 FOR 6 WEEK streak',
        imageUrl: 'https://example.com/test-badge.png',
      },
    ];

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-19T12:00:00-07:00'));
    });

    it.each([
      ['earlier entry in a multi-week history', ['Sep-12-26', 'Sep-19-26'], 1, true],
      ['unpadded writer output', ['Sep-6-26', 'Sep-19-26'], 1, true],
      ['padded single-digit day', ['Sep-06-26'], 1, true],
      ['ISO calendar date', ['2026-09-06'], 1, true],
      ['stored ISO timestamp', ['2026-09-05T20:49:24.113Z'], 2, true],
      ['stored timestamp outside the selected week', ['2026-09-05T20:49:24.113Z'], 1, false],
      ['inclusive week start', ['2026-09-06T07:00:00.000Z'], 1, true],
      ['just before week start', ['2026-09-06T06:59:59.999Z'], 1, false],
      ['inclusive week end', ['2026-09-13T06:59:59.999Z'], 1, true],
      ['just after week end', ['2026-09-13T07:00:00.000Z'], 1, false],
      ['timestamp with an explicit offset', ['2026-09-12T23:30:00-07:00'], 1, true],
      ['next-week calendar date', ['2026-09-13'], 1, false],
      ['previous-week calendar date', ['Sep-5-26'], 1, false],
      ['invalid dates', ['garbage', 'Sep-31-26', '2026-09-10Tgarbage'], 1, false],
      ['multiple matching entries render once', ['Sep-6-26', 'Sep-12-26'], 1, true],
      ['empty history uses lastModified', [], 1, true],
      ['missing history uses lastModified', undefined, 1, true],
    ])('%s', (_label, earnedDate, weekIndex, visible) => {
      const themeStore = createStore(
        state => state,
        { theme: { darkMode } },
        applyMiddleware(thunk),
      );
      const summaryWithHistoricalBadge = {
        ...dummySummary,
        badgeCollection: [
          {
            count: 1,
            earnedDate,
            badge: historicalBadgeId,
            // A populated history must take precedence over this fallback.
            lastModified: '2026-09-10T12:00:00.000Z',
          },
        ],
      };

      render(
        <Provider store={themeStore}>
          <MemoryRouter>
            <FormattedReport
              {...defaultProps}
              summaries={[summaryWithHistoricalBadge]}
              weekIndex={weekIndex}
              badges={badgeData}
              darkMode={darkMode}
              loadBadges
            />
          </MemoryRouter>
        </Provider>,
      );

      expect(
        screen.queryAllByAltText('', {
          selector: 'img[src="https://example.com/test-badge.png"]',
        }),
      ).toHaveLength(visible ? 1 : 0);
    });
  });
});
