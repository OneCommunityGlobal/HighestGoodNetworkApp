import { vi } from 'vitest';
import { FinalDay, UserStatus } from '../../../utils/enums';

export const MOCK_ACTIVE = UserStatus.Active;
export const MOCK_INACTIVE = UserStatus.Inactive;

// 🔴 IMPORTANT: vi.mock must be at top-level

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
  default: ({ open }) => (open ? <div data-testid="new-user-popup" /> : null),
}));

vi.mock('../ActivationDatePopup', () => ({
  default: ({ open }) => (open ? <div data-testid="activation-date-popup" /> : null),
}));

vi.mock('../ActiveInactiveConfirmationPopup', () => ({
  default: ({ open }) => (open ? <div data-testid="active-inactive-popup" /> : null),
}));

vi.mock('../SetUpFinalDayPopUp', () => ({
  default: ({ open }) => (open ? <div data-testid="setup-final-day-popup" /> : null),
}));

vi.mock('../DeleteUserPopup', () => ({
  default: () => <div data-testid="delete-user-popup" />,
}));

// ✅ keep helpers
export const createBaseProps = (overrides = {}) => ({
  getAllUserProfile: vi.fn(),
  deleteUser: vi.fn(),
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
  ...overrides,
});
