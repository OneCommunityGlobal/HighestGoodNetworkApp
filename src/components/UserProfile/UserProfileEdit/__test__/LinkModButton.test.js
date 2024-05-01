import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { authMock, userProfileMock } from '__tests__/mockStates';
import LinkModButton from '../LinkModButton';

// Mock child component
jest.mock('components/UserProfile/UserProfileModal/EditLinkModal', () => {
  return function(props) {
    return (
      <div data-testid="edit-modal">
        {props.isOpen ? <div data-testid="modal">mocked EditLinkModal</div> : null}
      </div>
    );
  };
});

describe('LinkModButton Component', () => {
  const mockProps = {
    updateLink: jest.fn(),
    userProfile: userProfileMock,
    setChanged: jest.fn(),
    handleSubmit: jest.fn(),
    role: authMock.user.role,
  };

  it('should render LinkModButton with closed eidt modal', () => {
    render(<LinkModButton {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(() => screen.getByText('mocked EditLinkModal')).toThrow();
  });

  it('should open Modal after "Edit" button is Clicked', () => {
    render(<LinkModButton {...mockProps} />);
    fireEvent.click(screen.getByTestId('edit-link'));
    expect(screen.getByText('mocked EditLinkModal')).toBeInTheDocument();
  });
});
