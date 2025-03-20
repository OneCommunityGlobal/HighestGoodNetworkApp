import React from 'react'
import { render } from '@testing-library/react'
import { ReportHeader } from '../ReportHeader'

describe('ReportHeader component', () => {
  it('renders with avatar when avatar prop is provided', () => {
    const avatarContent = <img src="avatar.jpg" alt="Avatar" />;
    const { container } = render(
      <ReportHeader avatar={avatarContent} name="John Doe" />
    );
    const avatarElement = container.querySelector('.report-header-profile-pic');

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.innerHTML).toContain('src="avatar.jpg"'); // Check if the avatar content is present
  });

  it('renders with default avatar when avatar prop is not provided', () => {
    const { container } = render(
      <ReportHeader name="John Doe" />
    );
    const defaultAvatarElement = container.querySelector('img[src="/pfp-default.png"]');

    expect(defaultAvatarElement).toBeInTheDocument();
  });
});
