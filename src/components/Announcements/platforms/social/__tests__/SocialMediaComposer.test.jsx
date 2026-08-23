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
