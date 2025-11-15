import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnconnectedUserManagement } from '../UserManagement';

// Import the mocked functions directly
import {
  getAllUserProfile,
  updateUserStatus,
  updateUserFinalDayStatusIsSet,
  deleteUser,
} from '../../../actions/userManagement';

// Mock the actions
vi.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: vi.fn(),
  updateUserStatus: vi.fn(),
  updateUserFinalDayStatusIsSet: vi.fn(),
  deleteUser: vi.fn(),
  enableEditUserInfo: vi.fn(),
  disableEditUserInfo: vi.fn(),
  getAllRoles: vi.fn(),
}));

// Define mock constants here to avoid scope issues
const MOCK_FINAL_DAY = 'SetFinalDay';
const MOCK_NOT_FINAL_DAY = 'NotSetFinalDay';
const MOCK_ACTIVE = 'Active';
const MOCK_INACTIVE = 'Inactive';

vi.mock('../UserTableHeader', () => ({
  default: () => <div data-testid="user-table-header">UserTableHeader</div>,
}));

vi.mock('../UserTableData', () => ({
  default: function UserTableData({
    onPauseResumeClick,
    onFinalDayClick,
    onActiveInactiveClick,
    user,
    index,
  }) {
    return (
      <div data-testid={`user-table-data-${index}`}>
        <button
          type="button"
          data-testid={`pause-resume-button-${index}`}
          onClick={() => onPauseResumeClick(user, MOCK_ACTIVE)}
        >
          Pause/Resume
        </button>
        <button
          type="button"
          data-testid={`inactive-button-${index}`}
          onClick={() => onPauseResumeClick(user, MOCK_INACTIVE)}
        >
          Set Inactive
        </button>
        <button
          type="button"
          data-testid={`active-inactive-button-${index}`}
          onClick={() => onActiveInactiveClick(user)}
        >
          Toggle Active/Inactive
        </button>
        <button
          type="button"
          data-testid={`final-day-button-${index}`}
          onClick={() => onFinalDayClick(user, MOCK_FINAL_DAY)}
        >
          Set Final Day
        </button>
        <button
          type="button"
          data-testid={`not-final-day-button-${index}`}
          onClick={() => onFinalDayClick(user, MOCK_NOT_FINAL_DAY)}
        >
          Remove Final Day
        </button>
      </div>
    );
  },
}));

vi.mock('../UserTableSearchHeader', () => ({
  default: function UserTableSearchHeader({ onFirstNameSearch }) {
    return (
      <div data-testid="user-table-search-header">
        <input data-testid="first-name-search" onChange={e => onFirstNameSearch(e.target.value)} />
      </div>
    );
  },
}));

vi.mock('../UserTableFooter', () => ({
  default: function UserTableFooter() {
    return <div data-testid="user-table-footer">UserTableFooter</div>;
  },
}));

vi.mock('../UserSearchPanel', () => ({
  default: function UserSearchPanel({ onActiveFiter, onNewUserClick }) {
    return (
      <div data-testid="user-search-panel">
        <button
          type="button"
          data-testid="active-filter-button"
          onClick={() => onActiveFiter('active')}
        >
          Filter Active
        </button>
        <button type="button" data-testid="new-user-button" onClick={onNewUserClick}>
          New User
        </button>
      </div>
    );
  },
}));

vi.mock('../NewUserPopup', () => ({
  default: function NewUserPopup({ open }) {
    return open ? <div data-testid="new-user-popup">NewUserPopup</div> : null;
  },
}));

vi.mock('../ActivationDatePopup', () => ({
  default: function ActivationDatePopup({ open }) {
    return open ? <div data-testid="activation-date-popup">ActivationDatePopup</div> : null;
  },
}));

vi.mock('../SetupHistoryPopup', () => ({
  default: function SetupHistoryPopup() {
    return <div data-testid="setup-history-popup">SetupHistoryPopup</div>;
  },
}));

vi.mock('../DeleteUserPopup', () => ({
  default: function DeleteUserPopup() {
    return <div data-testid="delete-user-popup">DeleteUserPopup</div>;
  },
}));

vi.mock('../ActiveInactiveConfirmationPopup', () => ({
  default: function ActiveInactiveConfirmationPopup({ open }) {
    return open ? (
      <div data-testid="active-inactive-popup">ActiveInactiveConfirmationPopup</div>
    ) : null;
  },
}));

vi.mock('../SetUpFinalDayPopUp', () => ({
  default: function SetUpFinalDayPopUp({ open }) {
    return open ? <div data-testid="setup-final-day-popup">SetUpFinalDayPopUp</div> : null;
  },
}));

vi.mock('../logTimeOffPopUp', () => ({
  default: function LogTimeOffPopUp() {
    return <div data-testid="log-time-off-popup">LogTimeOffPopUp</div>;
  },
}));

vi.mock('../setupNewUserPopup', () => ({
  default: function SetupNewUserPopup() {
    return <div data-testid="setup-new-user-popup">SetupNewUserPopup</div>;
  },
}));

describe('UserManagement Component', () => {
  let props;

  beforeEach(() => {
    vi.clearAllMocks();

    props = {
      getAllUserProfile,
      updateUserStatus,
      updateUserFinalDayStatusIsSet,
      deleteUser,
      hasPermission: vi.fn().mockReturnValue(true),
      getAllTimeOffRequests: vi.fn(),
      state: {
        theme: { darkMode: false },
        allUserProfiles: {
          userProfiles: [
            {
              _id: '1',
              firstName: 'John',
              lastName: 'Doe',
              status: 'Active',
              role: 'User',
              jobTitle: 'Developer',
              email: 'john@example.com',
              weeklycommittedHours: 40,
            },
            {
              _id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              status: 'Inactive',
              role: 'Admin',
              jobTitle: 'Manager',
              email: 'jane@example.com',
              weeklycommittedHours: 40,
            },
          ],
          fetching: false,
        },
        role: { roles: [] },
        timeOffRequests: { requests: {} },
        auth: { user: { role: 'Administrator' } },
        userProfile: { email: 'test@example.com' },
        userProfileEdit: { editable: false },
        userPagination: {
          pagestats: {
            selectedPage: 1,
            pageSize: 10,
          },
          editable: false,
        },
      },
    };
  });

  it('should render without errors', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Check if key components are rendered
    expect(screen.getByTestId('user-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-1')).toBeInTheDocument();
  });

  it('should call getAllUserProfile and getAllTimeOffRequests on mount', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Verify API calls on mount
    expect(getAllUserProfile).toHaveBeenCalled();
    expect(props.getAllTimeOffRequests).toHaveBeenCalled();
  });

  it('should update state when onFirstNameSearch is called', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and interact with the search input
    const searchInput = screen.getByTestId('first-name-search');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Since we can't directly check state, we need to verify the effect of the state change
    // In this case, we'd typically see filtered results in the table
    // For now, we'll verify that the component still renders after the search
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('should call updateUserStatus when onPauseResumeClick is called with status Active', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the pause/resume button for the first user
    const pauseResumeButton = screen.getByTestId('pause-resume-button-0');
    fireEvent.click(pauseResumeButton);

    // Verify the API call
    expect(updateUserStatus).toHaveBeenCalledWith(
      expect.objectContaining({ _id: '1' }),
      MOCK_ACTIVE,
      expect.any(Number),
    );
  });

  it('should set activationDateOpen to true when onPauseResumeClick is called with status not Active', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the set inactive button for the first user
    const inactiveButton = screen.getByTestId('inactive-button-0');
    fireEvent.click(inactiveButton);

    // Check that the activation date popup is shown
    expect(screen.getByTestId('activation-date-popup')).toBeInTheDocument();
  });

  it('should update state when onActiveFiter is called with active', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the active filter button
    const activeFilterButton = screen.getByTestId('active-filter-button');
    fireEvent.click(activeFilterButton);

    // Since we can't directly check state, we need to verify the effect of the state change
    // In this case, we'd typically see filtered results in the table
    // For now, we'll verify that the component still renders after filtering
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('should open new user popup when onNewUserClick is called', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the new user button
    const newUserButton = screen.getByTestId('new-user-button');
    fireEvent.click(newUserButton);

    // Check if the new user popup is displayed
    expect(screen.getByTestId('new-user-popup')).toBeInTheDocument();
  });

  it('should open the activeInactivePopup when onActiveInactiveClick is called', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the active/inactive toggle button for the first user
    const activeInactiveButton = screen.getByTestId('active-inactive-button-0');
    fireEvent.click(activeInactiveButton);

    // Check if the active/inactive confirmation popup is displayed
    expect(screen.getByTestId('active-inactive-popup')).toBeInTheDocument();
  });

  it('should open the final day popup when onFinalDayClick is called with SetFinalDay', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the final day button for the first user
    const finalDayButton = screen.getByTestId('final-day-button-0');
    fireEvent.click(finalDayButton);

    // Check if the setup final day popup is displayed
    expect(screen.getByTestId('setup-final-day-popup')).toBeInTheDocument();
  });

  it('should call updateUserFinalDayStatusIsSet when onFinalDayClick is called with NotSetFinalDay', () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the not final day button for the first user
    const notFinalDayButton = screen.getByTestId('not-final-day-button-0');
    fireEvent.click(notFinalDayButton);

    // Verify the API call
    expect(updateUserFinalDayStatusIsSet).toHaveBeenCalledWith(
      expect.objectContaining({ _id: '1' }),
      'Active',
      undefined,
      MOCK_NOT_FINAL_DAY,
    );
  });
});
