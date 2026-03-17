import { createBaseProps } from './UserManagementTestSetup.jsx';

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../__tests__/utils';
import '@testing-library/jest-dom';

import UserManagement from '../UserManagement';
import { activateUserAction } from '../../../actions/userLifecycleActions';

vi.mock('../../../actions/userLifecycleActions', () => ({
  activateUserAction: vi.fn(),
}));

describe('UserManagement Component', () => {
  let props;

  beforeEach(() => {
    props = createBaseProps();
  });

  it('renders without errors', () => {
    renderWithProvider(<UserManagement {...props} />);
    expect(screen.getByTestId('user-table-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-table-data-0')).toBeInTheDocument();
  });

  it('calls getAllUserProfile and getAllTimeOffRequests on mount', () => {
    renderWithProvider(<UserManagement {...props} />);
    expect(props.getAllUserProfile).toHaveBeenCalled();
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
    expect(activateUserAction).toHaveBeenCalled();
  });

  it('handles final day action when clicked', () => {
    renderWithProvider(<UserManagement {...props} />);

    expect(() =>
      fireEvent.click(screen.getByTestId('final-day-button-0'))
    ).not.toThrow();
  });

  it('opens new user popup', () => {
    renderWithProvider(<UserManagement {...props} />);
    fireEvent.click(screen.getByTestId('new-user-button'));
    expect(screen.getByTestId('new-user-popup')).toBeInTheDocument();
  });
});
