import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SocialMediaComposer from './SocialMediaComposer';

vi.mock('./FacebookComposer', () => ({
  default: () => <div>Recovered Facebook Composer</div>,
}));

describe('SocialMediaComposer platform routing', () => {
  it('routes Facebook to the recovered Facebook composer', () => {
    render(<SocialMediaComposer platform="facebook" />);
    expect(screen.getByText('Recovered Facebook Composer')).toBeInTheDocument();
  });

  it.each([
    ['x', 'Copy & Post to X'],
    ['mastodon', 'Post Now'],
  ])('keeps %s on the existing shared implementation', (platform, postButton) => {
    render(<SocialMediaComposer platform={platform} />);
    expect(screen.getByRole('heading', { name: platform })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: postButton })).toBeInTheDocument();
    expect(screen.queryByText('Recovered Facebook Composer')).not.toBeInTheDocument();
  });
});
