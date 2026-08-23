import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
  let xWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    writeText = vi.fn();
    xWindow = { close: vi.fn(), location: { href: '' } };
    open = vi.fn(() => xWindow);
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

  const showScheduledPost = async fetchMock => {
    localStorage.setItem(
      'mastodon_composer_prefs',
      JSON.stringify({ confirmDeleteScheduled: true, confirmPostNow: false }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<SocialMediaComposer platform="x" />);
    fireEvent.click(screen.getByRole('button', { name: /^scheduled$/i }));
    return screen.findByTitle(/copy & post to x/i);
  };

  it('reserves a popup synchronously, then navigates and completes the new-post flow', async () => {
    writeText.mockResolvedValue();
    let resolveApiRequest;
    const fetchMock = vi.fn(
      () =>
        new Promise(resolve => {
          resolveApiRequest = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const postInput = submitPost();

    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(writeText).not.toHaveBeenCalled();
    expect(xWindow.location.href).toBe('');

    resolveApiRequest({ ok: true, json: () => Promise.resolve({}) });

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(content);
      expect(toast.success).toHaveBeenCalledWith(
        'Content copied to clipboard! X is opening — paste and post.',
        {
          autoClose: 5000,
        },
      );
    });
    expect(open.mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder[0]);
    expect(fetchMock.mock.invocationCallOrder[0]).toBeLessThan(
      writeText.mock.invocationCallOrder[0],
    );
    expect(xWindow.location.href).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
    );
    expect(xWindow.close).not.toHaveBeenCalled();
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
    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(xWindow.close).toHaveBeenCalledOnce();
    expect(xWindow.location.href).toBe('');
    expect(postInput).toHaveValue(content);
  });

  it('closes the reserved popup when the new-post API request fails', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'X API unavailable' }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const postInput = submitPost();

    expect(open).toHaveBeenCalledWith('', '_blank');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('X API unavailable');
    });
    expect(xWindow.close).toHaveBeenCalledOnce();
    expect(xWindow.location.href).toBe('');
    expect(writeText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(postInput).toHaveValue(content);
  });

  it('preserves the composer when the popup is blocked', async () => {
    open.mockReturnValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const postInput = submitPost();

    expect(toast.error).toHaveBeenCalledWith(
      'Could not open X. Please allow pop-ups and try again.',
    );
    expect(writeText).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(postInput).toHaveValue(content);
  });

  it('keeps a skipped scheduled post visible and removes pending and ready actions', async () => {
    const readyPost = {
      _id: 'scheduled-x-post',
      content,
      scheduledAt: '2026-08-23T12:00:00.000Z',
      status: 'ready',
    };
    const skippedPost = { ...readyPost, status: 'skipped' };
    let scheduledLoadCount = 0;
    const fetchMock = vi.fn((url, options) => {
      if (url === '/api/x/schedule' && !options?.method) {
        scheduledLoadCount += 1;
        const posts = scheduledLoadCount === 1 ? [readyPost] : [skippedPost];
        return Promise.resolve({ ok: true, json: () => Promise.resolve(posts) });
      }
      if (url === '/api/x/schedule/scheduled-x-post/skip') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(skippedPost) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await showScheduledPost(fetchMock);
    fireEvent.click(screen.getByTitle('Skip this post'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/x/schedule/scheduled-x-post/skip',
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(scheduledLoadCount).toBe(2);
    });

    await screen.findByText(/skipped/i);
    // The card's status styling is applied inline on the nearest styled ancestor.
    // eslint-disable-next-line testing-library/no-node-access
    const skippedCard = screen.getByText(content).closest('[style]');
    expect(skippedCard).toHaveTextContent(content);
    expect(skippedCard).toHaveStyle({
      background: '#f5f5f5',
      borderLeft: '4px solid #757575',
    });
    expect(within(skippedCard).queryByTitle('Edit')).not.toBeInTheDocument();
    expect(within(skippedCard).queryByTitle('Copy & post to X')).not.toBeInTheDocument();
    expect(within(skippedCard).queryByTitle('Delete')).not.toBeInTheDocument();
    expect(within(skippedCard).queryByTitle('Mark as already posted')).not.toBeInTheDocument();
    expect(within(skippedCard).queryByTitle('Skip this post')).not.toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Post skipped.');
  });

  it('navigates X, marks a scheduled post, and refetches after mark-posted succeeds', async () => {
    writeText.mockResolvedValue();
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
    const copyScheduledButton = await showScheduledPost(fetchMock);

    fireEvent.click(copyScheduledButton);

    expect(open).toHaveBeenCalledWith('', '_blank');
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/x/schedule/scheduled-x-post/mark-posted',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
    expect(xWindow.location.href).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
    );
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([url, options]) => url === '/api/x/schedule' && !options?.method,
        ),
      ).toHaveLength(2);
    });
  });

  it('does not refetch scheduled posts when mark-posted returns a non-OK response', async () => {
    writeText.mockResolvedValue();
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
      if (url === '/api/x/schedule/scheduled-x-post/mark-posted') {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    const copyScheduledButton = await showScheduledPost(fetchMock);

    fireEvent.click(copyScheduledButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not mark scheduled post as posted. Please try again.',
      );
    });
    expect(
      fetchMock.mock.calls.filter(
        ([url, options]) => url === '/api/x/schedule' && !options?.method,
      ),
    ).toHaveLength(1);
    expect(xWindow.location.href).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
    );
  });

  it('does not refetch scheduled posts when the mark-posted request rejects', async () => {
    writeText.mockResolvedValue();
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
      if (url === '/api/x/schedule/scheduled-x-post/mark-posted') {
        return Promise.reject(new Error('Network unavailable'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    const copyScheduledButton = await showScheduledPost(fetchMock);

    fireEvent.click(copyScheduledButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not mark scheduled post as posted. Please try again.',
      );
    });
    expect(
      fetchMock.mock.calls.filter(
        ([url, options]) => url === '/api/x/schedule' && !options?.method,
      ),
    ).toHaveLength(1);
    expect(xWindow.location.href).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent(content)}`,
    );
  });

  it('does not mark a scheduled post as completed when the clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('Clipboard unavailable'));
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
    const copyScheduledButton = await showScheduledPost(fetchMock);
    fireEvent.click(copyScheduledButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not copy content to clipboard. Please try again.',
      );
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(xWindow.close).toHaveBeenCalledOnce();
    expect(xWindow.location.href).toBe('');
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/x/schedule/scheduled-x-post/mark-posted',
      expect.anything(),
    );
  });

  it('does not mark a scheduled post when the popup is blocked', async () => {
    open.mockReturnValue(null);
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
    const copyScheduledButton = await showScheduledPost(fetchMock);

    fireEvent.click(copyScheduledButton);

    expect(toast.error).toHaveBeenCalledWith(
      'Could not open X. Please allow pop-ups and try again.',
    );
    expect(writeText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/x/schedule/scheduled-x-post/mark-posted',
      expect.anything(),
    );
  });
});

describe('SocialMediaComposer history response handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const openHistory = platform => {
    render(<SocialMediaComposer platform={platform} />);
    fireEvent.click(screen.getByRole('button', { name: /^history$/i }));
  };

  it('renders X history from the standardized posts and total response', async () => {
    const historyPost = {
      _id: 'x-history-post',
      content: 'Standardized X history entry',
      postedAt: '2026-08-22T12:00:00.000Z',
    };
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ posts: [historyPost], total: 24 }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    openHistory('x');

    expect(await screen.findByText(historyPost.content)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/x/history?limit=20',
      expect.objectContaining({ headers: {} }),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ['a legacy bare array', [{ _id: 'legacy', content: 'Legacy X history entry' }]],
    ['a non-array posts field', { posts: {}, total: 1 }],
    ['an invalid total field', { posts: [], total: '1' }],
  ])('rejects %s in an X history response', async (_description, payload) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(payload),
        }),
      ),
    );

    openHistory('x');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error loading post history');
    });
    expect(screen.getByText('No posts found in history.')).toBeInTheDocument();
    expect(screen.queryByText('Legacy X history entry')).not.toBeInTheDocument();
  });

  it('continues to consume Mastodon history as an array', async () => {
    const mastodonPost = {
      id: 'mastodon-history-post',
      content: 'Mastodon history entry',
      created_at: '2026-08-22T12:00:00.000Z',
      favourites_count: 2,
      reblogs_count: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mastodonPost]),
        }),
      ),
    );

    openHistory('mastodon');

    expect(await screen.findByText(mastodonPost.content)).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
