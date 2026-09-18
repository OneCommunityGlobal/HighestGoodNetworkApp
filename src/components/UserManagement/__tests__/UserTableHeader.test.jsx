// import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { rootReducers } from '../../../store';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import UserTableHeader from '../UserTableHeader';
import userTableDataPermissions from '../../../utils/userTableDataPermissions';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  MANAGE_FINAL_DAY,
  USER_RESUME_DATE,
  USER_START_DATE,
  USER_END_DATE,
} from '../../../languages/en/ui';

const store = createStore(rootReducers);

// Mock userTableDataPermissions function
vi.mock('../../../utils/userTableDataPermissions', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('UserTableHeader', () => {
  const authRole = 'admin'; // example role, change as necessary for tests
  const roleSearchText = ''; // example search text, change as necessary for tests

  it('renders table headers correctly', () => {
    const { getByText, container } = render(
      <Provider store={store}> 
      <table>
        <thead>
          <UserTableHeader authRole={authRole} roleSearchText={roleSearchText} />
        </thead>
      </table>
      </Provider>,

    );

    // Check if all headers are in the document
    expect(screen.getByText(ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(FIRST_NAME)).toBeInTheDocument();
    expect(screen.getByText(LAST_NAME)).toBeInTheDocument();
    expect(screen.getByText(ROLE)).toBeInTheDocument();
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByText(WKLY_COMMITTED_HRS)).toBeInTheDocument();
    expect(screen.getByText(PAUSE)).toBeInTheDocument();
    expect(screen.getByText(MANAGE_FINAL_DAY)).toBeInTheDocument();
    expect(screen.getByText(USER_RESUME_DATE)).toBeInTheDocument();
    expect(screen.getByText(USER_START_DATE)).toBeInTheDocument();
    expect(screen.getByText(USER_END_DATE)).toBeInTheDocument();

    // Since you have three headers with the same text, let's make sure all are present
    // const resumeDateHeaders = screen.getAllByText(USER_RESUME_DATE);
    // expect(resumeDateHeaders).toHaveLength(3);
    expect(screen.getByText(USER_RESUME_DATE)).toBeInTheDocument();
    expect(screen.getByText(USER_START_DATE)).toBeInTheDocument();
    expect(screen.getByText(USER_END_DATE)).toBeInTheDocument();
  });

  it('renders delete column when permitted', () => {
    userTableDataPermissions.mockImplementation(() => true);
    const { container } = render(
      <Provider store={store}>
      <table>
        <thead>
          <UserTableHeader authRole={authRole} roleSearchText={roleSearchText} />
        </thead>
      </table>
      </Provider>
    );

    // Check if the delete column is present when permissions are met
    const deleteColumn = screen.getByRole('columnheader', { name: /delete user/i });
    expect(deleteColumn).toBeInTheDocument();
  });

  it('does not render delete column when not permitted', () => {
    // Here you mock the implementation to return false
    userTableDataPermissions.mockImplementation(() => false);

    const notPermittedAuthRole = 'guest';
    const { queryByTestId } = render(
      <Provider store={store}>
      <table>
        <thead>
          <UserTableHeader authRole={notPermittedAuthRole} roleSearchText="" />
        </thead>
      </table>,
      </Provider>
    );

    // Since you are querying by test id, make sure your component has 'data-testid' set on elements
    const deleteColumn = screen.queryByRole('columnheader', { name: /delete user/i });
    expect(deleteColumn).not.toBeInTheDocument();
  });
});
