import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import SocialMediaComposer from './SocialMediaComposer';

vi.mock('./FacebookComposer', () => ({
  default: () => <div>Recovered Facebook Composer</div>,
}));

describe('SocialMediaComposer platform routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('routes Facebook to the recovered Facebook composer', () => {
    render(<SocialMediaComposer platform="facebook" />);
    expect(screen.getByText('Recovered Facebook Composer')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
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

  it('keeps Mastodon posting on the Mastodon endpoint', async () => {
    render(<SocialMediaComposer platform="mastodon" />);
    fireEvent.change(screen.getByPlaceholderText('Write your mastodon post here...'), {
      target: { value: 'Mastodon post' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Post Now' }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/mastodon/createPin', expect.anything()),
    );
  });

  it('keeps X posting on the X endpoint', async () => {
    render(<SocialMediaComposer platform="x" />);
    fireEvent.change(screen.getByPlaceholderText('Write your x post here...'), {
      target: { value: 'X post' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy & Post to X' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/x/post', expect.anything()));
  });

  it('fails explicitly for an unsupported platform without making an API request', () => {
    render(<SocialMediaComposer platform="unsupported" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unsupported social platform: unsupported');
    expect(fetch).not.toHaveBeenCalled();
  });
});
