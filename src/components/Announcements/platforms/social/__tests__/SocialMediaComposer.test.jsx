import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import SocialMediaComposer from '../SocialMediaComposer';

// react-toastify is globally mocked in src/setupTests.js

describe('SocialMediaComposer X 280-character limit', () => {
  const overLimitContent = 'a'.repeat(281);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const typeOverLimitPost = () => {
    render(<SocialMediaComposer platform="x" />);
    const textarea = screen.getByPlaceholderText(/write your x post here/i);
    fireEvent.change(textarea, { target: { value: overLimitContent } });
  };

  it('blocks posting over 280 characters: shows an error toast and never calls fetch', async () => {
    typeOverLimitPost();

    fireEvent.click(screen.getByRole('button', { name: /copy & post to x/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Post exceeds 280 character limit.');
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('blocks scheduling over 280 characters: shows an error toast and never calls fetch', async () => {
    typeOverLimitPost();

    fireEvent.click(screen.getByRole('button', { name: /^schedule post$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Post exceeds 280 character limit.');
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('SocialMediaComposer X clipboard handling', () => {
  const content = 'Post this on X';
  let writeText;
  let open;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    writeText = vi.fn();
    open = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.stubGlobal('open', open);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const submitPost = () => {
    render(<SocialMediaComposer platform="x" />);
    const postInput = screen.getByPlaceholderText(/write your x post here/i);
    fireEvent.change(postInput, { target: { value: content } });
    fireEvent.click(screen.getByRole('button', { name: /copy & post to x/i }));
    return postInput;
  };

  it('shows success and continues the flow only after the clipboard write succeeds', async () => {
    writeText.mockResolvedValue();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
    );

    const postInput = submitPost();

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(content);
      expect(toast.success).toHaveBeenCalledWith(
        'Content copied to clipboard! X is opening — paste and post.',
        {
          autoClose: 5000,
        },
      );
    });
    expect(open).toHaveBeenCalledWith(
      `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
      '_blank',
    );
    expect(postInput).toHaveValue('');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error and preserves the composer when the clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('Clipboard unavailable'));
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
    );

    const postInput = submitPost();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not copy content to clipboard. Please try again.',
      );
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(postInput).toHaveValue(content);
  });

  it('does not mark a scheduled post as completed when the clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('Clipboard unavailable'));
    localStorage.setItem(
      'mastodon_composer_prefs',
      JSON.stringify({ confirmDeleteScheduled: true, confirmPostNow: false }),
    );
    const scheduledPost = {
      _id: 'scheduled-x-post',
      content,
      scheduledAt: '2026-08-23T12:00:00.000Z',
      status: 'ready',
    };
    const fetchMock = vi.fn((url, options) => {
      if (url === '/api/x/schedule' && !options?.method) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([scheduledPost]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<SocialMediaComposer platform="x" />);
    fireEvent.click(screen.getByRole('button', { name: /^scheduled$/i }));
    const copyScheduledButton = await screen.findByTitle(/copy & post to x/i);
    fireEvent.click(copyScheduledButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not copy content to clipboard. Please try again.',
      );
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/x/schedule/scheduled-x-post/mark-posted',
      expect.anything(),
    );
  });
});
