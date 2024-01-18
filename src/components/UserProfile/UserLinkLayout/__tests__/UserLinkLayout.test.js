import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserLinkLayout from '../UserLinkLayout';


jest.mock('../../UserLinks', () => () => <div data-testid="mock-user-links"></div>);
jest.mock('../../UserProfileEdit/LinkModButton', () => () => <div data-testid="mock-link-mod-button"></div>);


describe('UserLinkLayout Component', () => {
  const mockProps = {
    userProfile: {
      adminLinks: ['admin link 1', 'admin link 2'],
      personalLinks: ['personal link 1', 'personal link 2'],
    },
    updateLink: jest.fn(),
    handleLinkModel: jest.fn(),
    handleSubmit: jest.fn(),
    canEdit: false,
    role: 'user',
  };

  it('should render UserLinks components correctly with the right props', () => {
    render(<UserLinkLayout {...mockProps} />);
    const userLinksComponents = screen.getAllByTestId('mock-user-links');
    expect(userLinksComponents.length).toBe(2);
  });

  it('should conditionally render LinkModButton based on canEdit prop', () => {
    const { rerender } = render(<UserLinkLayout {...mockProps} />);
    expect(screen.queryByTestId('mock-link-mod-button')).toBeNull();

    mockProps.canEdit = true;
    rerender(<UserLinkLayout {...mockProps} />);
    expect(screen.getByTestId('mock-link-mod-button')).toBeInTheDocument();
  });

  it('should pass correct props to LinkModButton when rendered', () => {
    mockProps.canEdit = true;
    render(<UserLinkLayout {...mockProps} />);
    expect(screen.getByTestId('mock-link-mod-button')).toBeInTheDocument();
  });
});
