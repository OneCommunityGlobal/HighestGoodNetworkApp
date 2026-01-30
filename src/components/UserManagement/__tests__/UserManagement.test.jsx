import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../__tests__/utils';
import '@testing-library/jest-dom';
import UserManagement from '../UserManagement';
import { FinalDay, UserStatus } from '../../../utils/enums';

// Import the mocked functions directly
import {
  getAllUserProfile,
  deleteUser,
} from '../../../actions/userManagement';
import { scheduleDeactivationAction, activateUserAction, pauseUserAction, deactivateImmediatelyAction } from '../../../actions/userLifecycleActions';

// Mock the actions

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');

  return {
    ...actual,
    connect:
      () =>
      WrappedComponent => {
        const MockConnectedComponent = props => (
          <WrappedComponent {...props} />
        );

        MockConnectedComponent.displayName = `MockConnect(${
          WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

        return MockConnectedComponent;
      },
  };
});


vi.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: vi.fn(() => ({ type: 'GET_ALL_USERS' })),
  deleteUser: vi.fn(() => ({ type: 'DELETE_USER' })),
  enableEditUserInfo: vi.fn(() => ({ type: 'ENABLE_EDIT' })),
  disableEditUserInfo: vi.fn(() => ({ type: 'DISABLE_EDIT' })),
  getAllRoles: vi.fn(() => ({ type: 'GET_ROLES' })),
}));


vi.mock('../../../actions/userLifecycleActions', () => ({
  scheduleDeactivationAction: vi.fn(() => ({ type: 'SCHEDULE_DEACTIVATION' })),
  activateUserAction: vi.fn(() => ({ type: 'ACTIVATE_USER' })),
  pauseUserAction: vi.fn(() => ({ type: 'PAUSE_USER' })),
  deactivateImmediatelyAction: vi.fn(() => ({ type: 'DEACTIVATE_IMMEDIATELY' })),
}));

// Define mock constants here to avoid scope issues
const MOCK_ACTIVE = UserStatus.Active;
const MOCK_INACTIVE = UserStatus.Inactive;

vi.mock('../UserTableHeader', () => ({
  default: () => <div data-testid="user-table-header" />,
}));

vi.mock('../UserTableData', () => ({
  default: ({ onPauseResumeClick, onFinalDayClick, onActiveInactiveClick, user, index }) => (
    <div data-testid={`user-table-data-${index}`}>
      <button
        data-testid={`pause-resume-button-${index}`}
        onClick={() => onPauseResumeClick(user, MOCK_ACTIVE)}
      />
      <button
        data-testid={`inactive-button-${index}`}
        onClick={() => onPauseResumeClick(user, MOCK_INACTIVE)}
      />
      <button
        data-testid={`active-inactive-button-${index}`}
        onClick={() => onActiveInactiveClick(user)}
      />
      <button
        data-testid={`final-day-button-${index}`}
        onClick={() => onFinalDayClick(user, FinalDay.SetFinalDay)}
      />
      <button
        data-testid={`not-final-day-button-${index}`}
        onClick={() => onFinalDayClick(user, FinalDay.RemoveFinalDay)}
      />
    </div>
  ),
}));

vi.mock('../UserTableSearchHeader', () => ({
  default: ({ onFirstNameSearch }) => (
    <input
      data-testid="first-name-search"
      onChange={e => onFirstNameSearch(e.target.value)}
    />
  ),
}));

vi.mock('../UserTableFooter', () => ({
  default: () => <div data-testid="user-table-footer" />,
}));

vi.mock('../UserSearchPanel', () => ({
  default: ({ onActiveFiter, onNewUserClick }) => (
    <>
      <button data-testid="active-filter-button" onClick={() => onActiveFiter('active')} />
      <button data-testid="new-user-button" onClick={onNewUserClick} />
    </>
  ),
}));

vi.mock('../NewUserPopup', () => ({
  default: ({ open }) => open ? <div data-testid="new-user-popup" /> : null,
}));

vi.mock('../ActivationDatePopup', () => ({
  default: ({ open }) => open ? <div data-testid="activation-date-popup" /> : null,
}));

vi.mock('../ActiveInactiveConfirmationPopup', () => ({
  default: ({ open }) => open ? <div data-testid="active-inactive-popup" /> : null,
}));

vi.mock('../SetUpFinalDayPopUp', () => ({
  default: ({ open }) => open ? <div data-testid="setup-final-day-popup" /> : null,
}));

vi.mock('../DeleteUserPopup', () => ({
  default: () => null,
}));


describe('UserManagement Component', () => {
  let props;

  beforeEach(() => {
    vi.clearAllMocks();

    props = {
      getAllUserProfile,
      deleteUser,
      hasPermission: vi.fn(() => true),
      getAllTimeOffRequests: vi.fn(),
      dispatch: vi.fn(),
      state: {
        theme: { darkMode: false },
        auth: { user: { role: 'Administrator' } },
        userProfile: { email: 'test@example.com' },
        userProfileEdit: { editable: false },
        userPagination: {
          pagestats: { selectedPage: 1, pageSize: 10 },
          editable: false,
        },
        role: { roles: [] },
        timeOffRequests: { requests: {} },
        allUserProfiles: {
          fetching: false,
          userProfiles: [
            {
              _id: '1',
              firstName: 'John',
              lastName: 'Doe',
              role: 'User',
              email: 'john@example.com',
              weeklycommittedHours: 40,
              isActive: true,
            },
          ],
        },
      },
    };
  });


  it('renders without errors', () => {
    renderWithProvider(<UserManagement {...props} />);
    expect(screen.getByTestId('user-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('calls getAllUserProfile and getAllTimeOffRequests on mount', () => {
    renderWithProvider(<UserManagement {...props} />);
    expect(getAllUserProfile).toHaveBeenCalled();
    expect(props.getAllTimeOffRequests).toHaveBeenCalled();
  });

  it('opens activation date popup when pausing user', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('inactive-button-0'));
    expect(screen.getByTestId('activation-date-popup')).toBeInTheDocument();
  });

  it('calls activateUserAction when resuming user', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('pause-resume-button-0'));

    expect(activateUserAction).toHaveBeenCalledWith(
      props.dispatch,
      expect.objectContaining({ _id: '1' }),
      props.getAllUserProfile
    );
  });

  it('opens active/inactive confirmation popup', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('active-inactive-button-0'));
    expect(screen.getByTestId('active-inactive-popup')).toBeInTheDocument();
  });

  it('opens final day popup for SetFinalDay', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('final-day-button-0'));
    expect(screen.getByTestId('final-day-button-0')).toBeInTheDocument();
  });

  it('calls activateUserAction when removing final day', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('not-final-day-button-0'));

    expect(activateUserAction).toHaveBeenCalledWith(
      props.dispatch,
      expect.objectContaining({ _id: '1' }),
      props.getAllUserProfile
    );
  });

  it('opens new user popup', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('new-user-button'));
    expect(screen.getByTestId('new-user-popup')).toBeInTheDocument();
  });
});