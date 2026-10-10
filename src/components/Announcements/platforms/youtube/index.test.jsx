import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import YoutubeAutoPoster from './index';

const connectedAccount = {
  channelName: 'One Community Global',
  customUrl: '@onecommunityglobal',
  thumbnail: 'https://example.com/channel-thumbnail.jpg',
};

describe('YoutubeAutoPoster settings controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    global.fetch = vi.fn(() => new Promise(() => {}));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('keeps the visibility tile synchronized with its selection', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, account: connectedAccount }),
    });
    render(<YoutubeAutoPoster platform="youtube" />);

    const publicOption = await screen.findByRole('radio', { name: 'Public' });
    const unlistedOption = screen.getByRole('radio', { name: 'Unlisted' });

    expect(publicOption).toBeChecked();

    fireEvent.click(unlistedOption);

    expect(unlistedOption).toBeChecked();
    expect(screen.getByText('UNLISTED')).toBeInTheDocument();
  });

  test('renders the audience switches with the design defaults and allows changes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, account: connectedAccount }),
    });
    render(<YoutubeAutoPoster platform="youtube" />);

    const notifySubscribers = await screen.findByRole('switch', { name: /Notify subscribers/i });
    const embeddable = screen.getByRole('switch', { name: /Embeddable/i });
    const publicStats = screen.getByRole('switch', { name: /Public stats viewable/i });
    const syntheticMedia = screen.getByRole('switch', { name: /Contains synthetic media/i });

    expect(notifySubscribers).not.toBeChecked();
    expect(embeddable).toBeChecked();
    expect(publicStats).toBeChecked();
    expect(syntheticMedia).not.toBeChecked();

    fireEvent.click(screen.getByText('Notify subscribers'));
    expect(notifySubscribers).not.toBeChecked();

    fireEvent.click(notifySubscribers);
    fireEvent.click(embeddable);

    expect(notifySubscribers).toBeChecked();
    expect(embeddable).not.toBeChecked();
  });

  test('displays the connected YouTube channel details', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, account: connectedAccount }),
    });

    render(<YoutubeAutoPoster platform="youtube" />);

    expect(
      await screen.findByRole('heading', { name: connectedAccount.channelName }),
    ).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /channel thumbnail/i })).toHaveAttribute(
      'src',
      connectedAccount.thumbnail,
    );
    expect(screen.getByRole('link', { name: connectedAccount.customUrl })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@onecommunityglobal',
    );
    expect(screen.getByRole('form', { name: 'YouTube video upload' })).toBeInTheDocument();
  });

  test('hides the upload form when the account is disconnected', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: false, account: null }),
    });

    render(<YoutubeAutoPoster platform="youtube" />);

    expect(await screen.findByText('Connect your YouTube channel')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'YouTube video upload' })).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('does not show the missing-channel toast on a normal page load', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, account: null }),
    });

    render(<YoutubeAutoPoster platform="youtube" />);

    expect(await screen.findByText('Connect your YouTube channel')).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('shows the missing-channel toast after a YouTube connection attempt', async () => {
    sessionStorage.setItem('youtubeConnectionAttempt', 'true');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, account: null }),
    });

    render(<YoutubeAutoPoster platform="youtube" />);

    await waitFor(() =>
      expect(
        toast.error,
      ).toHaveBeenCalledWith(
        'Your connected Google account does not have a YouTube channel. Create a channel, then try again.',
        { toastId: 'youtube-channel-not-found' },
      ),
    );
    expect(sessionStorage.getItem('youtubeConnectionAttempt')).toBeNull();
    expect(screen.queryByRole('form', { name: 'YouTube video upload' })).not.toBeInTheDocument();
  });

  test('uploads the selected video with metadata from the composer', async () => {
    const uploadResponse = {
      success: true,
      video: { url: 'https://youtube.com/watch?v=video-id' },
    };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: true, account: connectedAccount }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          categories: [{ id: '22', title: 'People & Blogs', assignable: true }],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => uploadResponse });

    render(<YoutubeAutoPoster platform="youtube" />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled());

    fireEvent.change(screen.getByLabelText(/Video Title/i), {
      target: { value: 'Community update' },
    });
    await userEvent.click(screen.getByLabelText(/Category/i));
    await userEvent.click(await screen.findByText('People & Blogs'));
    fireEvent.click(screen.getByRole('radio', { name: "Yes, it's made for kids" }));
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Weekly news' },
    });
    fireEvent.change(screen.getByPlaceholderText('add tag'), { target: { value: 'community' } });
    fireEvent.keyDown(screen.getByPlaceholderText('add tag'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('radio', { name: 'Unlisted' }));
    fireEvent.click(screen.getByRole('switch', { name: /Notify subscribers/i }));

    const video = new File(['video'], 'update.mp4', { type: 'video/mp4' });
    await userEvent.upload(screen.getByLabelText('Video source'), video);
    fireEvent.submit(screen.getByRole('form', { name: 'YouTube video upload' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));

    const [uploadUrl, request] = global.fetch.mock.calls[2];
    const metadata = JSON.parse(request.body.get('metadata'));

    expect(uploadUrl).toMatch(/\/youtube\/upload$/);
    expect(request.body.get('video')).toBe(video);
    expect(metadata).toEqual({
      title: 'Community update',
      description: 'Weekly news',
      categoryId: '22',
      tags: ['community'],
      privacyStatus: 'unlisted',
      madeForKids: true,
      notifySubscribers: true,
      embeddable: true,
      publicStatsViewable: true,
      containsSyntheticMedia: false,
    });
  });
});
