import { createBaseProps } from './UserManagementTestSetup.jsx';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';

import UserManagement from '../UserManagement';
import { updateUserPauseStatus } from '../../../actions/userManagement';

vi.mock('../../../actions/userManagement', async () => {
  const actual = await vi.importActual('../../../actions/userManagement');
  return {
    ...actual,
    updateUserPauseStatus: vi.fn(() => async () => undefined),
  };
});

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

  it('renders without errors', () => {
    renderUserManagement(<UserManagement {...props} />);
    expect(screen.getByTestId('user-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('calls getAllUserProfile and getAllTimeOffRequests on mount', () => {
    renderUserManagement(<UserManagement {...props} />);
    expect(props.getAllUserProfile).toHaveBeenCalled();
    expect(props.getAllTimeOffRequests).toHaveBeenCalled();
  });

  it('opens activation date popup when pausing user', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('inactive-button-0'));
    expect(screen.getByTestId('activation-date-popup')).toBeInTheDocument();
  });

  it('calls updateUserPauseStatus when resuming user', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('pause-resume-button-0'));
    expect(updateUserPauseStatus).toHaveBeenCalled();
  });

  it('handles final day action when clicked', () => {
    renderUserManagement(<UserManagement {...props} />);

    expect(() =>
      fireEvent.click(screen.getByTestId('final-day-button-0'))
    ).not.toThrow();
  });

  it('opens new user popup', () => {
    renderUserManagement(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('new-user-button'));
    expect(screen.getByTestId('new-user-popup')).toBeInTheDocument();
  });
});
