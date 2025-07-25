import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ReportHeader } from '../ReportHeader';

describe('ReportHeader component', () => {
  it('renders with avatar when avatar prop is provided', () => {
    const avatarContent = <img src="avatar.jpg" alt="Avatar" data-testid="custom-avatar" />;
    render(<ReportHeader avatar={avatarContent} name="John Doe" />);

    const avatarWrapper = screen.getByTestId('avatar-wrapper');
    expect(avatarWrapper).toBeInTheDocument();
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
  });

  it('renders with default avatar when avatar prop is not provided', () => {
    render(<ReportHeader name="John Doe" />);
    const defaultAvatar = screen.getByAltText('');
    expect(defaultAvatar).toBeInTheDocument();
    expect(defaultAvatar).toHaveAttribute('src', '/pfp-default.png');
  });
});
