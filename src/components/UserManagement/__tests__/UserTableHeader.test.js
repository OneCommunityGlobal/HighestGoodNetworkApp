import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userTableDataPermissions from '../../../utils/userTableDataPermissions';
import UserTableHeader from '../UserTableHeader';
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

// Mock userTableDataPermissions function
jest.mock('utils/userTableDataPermissions', () => jest.fn());

describe('UserTableHeader', () => {
  const authRole = 'admin'; // example role, change as necessary for tests
  const roleSearchText = ''; // example search text, change as necessary for tests

  it('renders table headers correctly', () => {
    const { getByText, container } = render(
      <table>
        <thead>
          <UserTableHeader authRole={authRole} roleSearchText={roleSearchText} />
        </thead>
      </table>,
    );

    // Check if all headers are in the document
    expect(getByText(ACTIVE)).toBeInTheDocument();
    expect(getByText(FIRST_NAME)).toBeInTheDocument();
    expect(getByText(LAST_NAME)).toBeInTheDocument();
    expect(getByText(ROLE)).toBeInTheDocument();
    expect(getByText(EMAIL)).toBeInTheDocument();
    expect(getByText(WKLY_COMMITTED_HRS)).toBeInTheDocument();
    expect(getByText(PAUSE)).toBeInTheDocument();
    expect(getByText(MANAGE_FINAL_DAY)).toBeInTheDocument();
    expect(getByText(USER_RESUME_DATE)).toBeInTheDocument();
    expect(getByText(USER_START_DATE)).toBeInTheDocument();
    expect(getByText(USER_END_DATE)).toBeInTheDocument();

    // Since you have three headers with the same text, let's make sure all are present
    const resumeDateHeaders = container.querySelectorAll('#usermanagement_resume_date');
    expect(resumeDateHeaders.length).toBe(3);
  });

  it('renders delete column when permitted', () => {
    userTableDataPermissions.mockImplementation(() => true);
    const { container } = render(
      <table>
        <thead>
          <UserTableHeader authRole={authRole} roleSearchText={roleSearchText} />
        </thead>
      </table>,
    );

    // Check if the delete column is present when permissions are met
    const deleteColumn = container.querySelector('#usermanagement_delete');
    expect(deleteColumn).toBeInTheDocument();
  });

  it('does not render delete column when not permitted', () => {
    // Here you mock the implementation to return false
    userTableDataPermissions.mockImplementation(() => false);

    const notPermittedAuthRole = 'guest';
    const { queryByTestId } = render(
      <table>
        <thead>
          <UserTableHeader authRole={notPermittedAuthRole} roleSearchText={''} />
        </thead>
      </table>,
    );

    // Since you are querying by test id, make sure your component has 'data-testid' set on elements
    const deleteColumn = queryByTestId('delete-column'); // Update 'delete-column' to match your 'data-testid' value
    expect(deleteColumn).not.toBeInTheDocument();
  });
});
