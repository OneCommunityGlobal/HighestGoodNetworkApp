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
  weeklySummariesCount: '5',
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
  daysInTeam: 70,
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
});
