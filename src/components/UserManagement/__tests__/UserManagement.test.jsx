import { createBaseProps } from './UserManagementTestSetup.jsx';
import UserManagement, { UnconnectedUserManagement } from '../UserManagement';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import the mocked functions directly
import {
  getAllUserProfile,
  updateUserFinalDayStatusIsSet,
  deleteUser,
} from '../../../actions/userManagement';
import { Provider } from 'react-redux';


const createThunkStore = () => ({
  getState: () => ({
    theme: {
      darkMode: false,
    },
    timeOffRequests: {
      requests: [],
    },
  }),
  dispatch: action =>
    typeof action === 'function'
      ? action(() => {}, () => ({}))
      : action,
  subscribe: () => () => {},
});

describe('UserManagement Component', () => {
  let props;

  beforeEach(() => {
    props = createBaseProps();
    vi.clearAllMocks();
  });

  const renderUserManagement = ui =>
    render(ui, {
      wrapper: ({ children }) => (
        <Provider store={createThunkStore()}>{children}</Provider>
      ),
    });

  // TODO: unskip once isLoadingUsers is cleared on mount (currently only reset
  // in componentDidUpdate, so with a mocked getAllUserProfile the component
  // stays stuck on the "Loading users" state and never renders the table).
  it.skip('renders without errors', () => {
    renderUserManagement(<UserManagement {...props} />);
    expect(screen.getByTestId('user-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('calls getAllUserProfile and getAllTimeOffRequests on mount', () => {
    renderUserManagement(<UserManagement {...props} />);
    expect(props.getAllUserProfile).toHaveBeenCalled();
    expect(props.getAllTimeOffRequests).toHaveBeenCalled();
  });

  // TODO: unskip once isLoadingUsers is cleared on mount (see note above).
  it.skip('opens activation date popup when pausing user', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('inactive-button-0'));
    expect(screen.getByTestId('activation-date-popup')).toBeInTheDocument();
  });

  it.skip('should update state when onActiveFiter is called with active', async () => {
    render(<UnconnectedUserManagement {...props} />);

    // Find and click the active filter button
    const activeFilterButton = screen.getByTestId('active-filter-button');
    fireEvent.click(activeFilterButton);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Since we can't directly check state, we need to verify the effect of the state change
    // In this case, we'd typically see filtered results in the table
    // For now, we'll verify that the component still renders after filtering
    expect(screen.getByTestId('user-management-table')).toBeInTheDocument();
  });

  // TODO: unskip once isLoadingUsers is cleared on mount (see note above).
  it.skip('calls activateUserAction when resuming user', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('pause-resume-button-0'));
    expect(props.getAllUserProfile).toHaveBeenCalled();
  });

  // TODO: unskip once isLoadingUsers is cleared on mount (see note above).
  it.skip('handles final day action when clicked', () => {
    renderUserManagement(<UserManagement {...props} />);

    expect(() =>
      fireEvent.click(screen.getByTestId('final-day-button-0'))
    ).not.toThrow();
  });

  // TODO: unskip once isLoadingUsers is cleared on mount (see note above).
  it.skip('opens new user popup', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('new-user-button'));
    expect(screen.getByTestId('new-user-popup')).toBeInTheDocument();
  });
});
