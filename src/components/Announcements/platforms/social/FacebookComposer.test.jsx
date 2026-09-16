import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchScheduledPosts,
  postFacebookContent,
  scheduleFacebookPost,
} from '~/actions/facebookActions';
import FacebookComposer from './FacebookComposer';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('~/actions/facebookActions', () => ({
  cancelScheduledPost: vi.fn(payload => ({ type: 'CANCEL', payload })),
  fetchPostHistory: vi.fn(payload => ({ type: 'HISTORY', payload })),
  fetchScheduledPosts: vi.fn(payload => ({ type: 'SCHEDULED', payload })),
  postFacebookContent: vi.fn(payload => ({ type: 'POST', payload })),
  postFacebookContentWithImage: vi.fn(payload => ({ type: 'POST_IMAGE', payload })),
  scheduleFacebookPost: vi.fn(payload => ({ type: 'SCHEDULE', payload })),
  scheduleFacebookPostWithImage: vi.fn(payload => ({ type: 'SCHEDULE_IMAGE', payload })),
  updateScheduledPost: vi.fn(payload => ({ type: 'UPDATE', payload })),
}));

vi.mock('~/actions/facebookAuthActions', () => ({
  getFacebookConnectionStatus: vi.fn(() => ({ type: 'STATUS' })),
}));

vi.mock('./FacebookConnection', () => ({
  default: () => <div>Facebook Page Connection</div>,
}));

const user = {
  userid: 'user-1',
  firstName: 'Test',
  lastName: 'Owner',
  role: 'Owner',
  permissions: {},
};

const setConnected = connected => {
  useSelector.mockImplementation(selector =>
    selector({
      auth: { user },
      theme: { darkMode: false },
      facebook: { connectionStatus: { connected }, loading: false },
    }),
  );
};

describe('FacebookComposer', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    dispatch.mockImplementation(action => {
      if (action.type === 'SCHEDULED') return Promise.resolve({ scheduledPosts: [] });
      if (action.type === 'HISTORY') return Promise.resolve({ posts: [] });
      return Promise.resolve({ success: true });
    });
  });

  it('guides a disconnected user to the Facebook connection settings', () => {
    setConnected(false);
    render(<FacebookComposer />);
    expect(screen.getByText('⚠️ Facebook Not Connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post to facebook' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Settings tab' }));
    expect(screen.getByText('Facebook Page Connection')).toBeInTheDocument();
  });

  it('posts through the recovered Facebook action', async () => {
    setConnected(true);
    render(<FacebookComposer />);
    fireEvent.change(screen.getByPlaceholderText('Write your facebook post here...'), {
      target: { value: 'Historical Facebook post' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Post to facebook' }));
    await waitFor(() =>
      expect(postFacebookContent).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Historical Facebook post' }),
      ),
    );
  });

  it('preserves Pacific wall-clock scheduling', async () => {
    setConnected(true);
    render(<FacebookComposer />);
    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText('Write the message to post later...'), {
      target: { value: 'Scheduled Facebook post' },
    });
    fireEvent.change(screen.getByLabelText('Date & Time (PST)'), {
      target: { value: '2099-01-01T12:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule Post' }));
    await waitFor(() =>
      expect(scheduleFacebookPost).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledFor: '2099-01-01T12:00',
          timezone: 'America/Los_Angeles',
        }),
      ),
    );
  });

  it('shows the historical uploaded filename in the scheduled-post list', async () => {
    setConnected(true);
    dispatch.mockImplementation(action => {
      if (action.type === 'SCHEDULED') {
        return Promise.resolve({
          scheduledPosts: [
            {
              _id: 'scheduled-1',
              message: 'Scheduled with an upload',
              scheduledFor: '2099-01-01T20:00:00.000Z',
              status: 'pending',
              hasImage: true,
              imageOriginalName: 'community.png',
            },
          ],
        });
      }
      return Promise.resolve({ success: true });
    });

    render(<FacebookComposer />);
    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));

    expect(await screen.findByText('📷 Image attached: community.png')).toBeInTheDocument();
  });

  it('renders the recovered Facebook settings only on its Settings tab', () => {
    setConnected(true);
    render(<FacebookComposer />);
    expect(screen.queryByText('Facebook Page Connection')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '⚙️ Settings' }));
    expect(screen.getByText('Facebook Page Connection')).toBeInTheDocument();
  });
});
