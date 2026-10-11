import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchScheduledPosts,
  postFacebookContent,
  postFacebookContentWithImage,
  scheduleFacebookPost,
  scheduleFacebookPostWithImage,
} from '~/actions/facebookActions';
import FacebookComposer from './FacebookComposer';
import styles from './FacebookComposer.module.css';

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

const connectedStatus = {
  connected: true,
  pageId: '123',
  pageName: 'One Community',
  tokenStatus: 'valid',
};

const setFacebookState = (facebook, darkMode = false) => {
  useSelector.mockImplementation(selector =>
    selector({
      auth: { user },
      theme: { darkMode },
      facebook,
    }),
  );
};

const setConnected = (connected, darkMode = false) =>
  setFacebookState(
    {
      connectionStatus: connected ? connectedStatus : { connected: false },
      loading: false,
    },
    darkMode,
  );

const expectNoFacebookSubmission = () => {
  expect(postFacebookContent).not.toHaveBeenCalled();
  expect(postFacebookContentWithImage).not.toHaveBeenCalled();
  expect(scheduleFacebookPost).not.toHaveBeenCalled();
  expect(scheduleFacebookPostWithImage).not.toHaveBeenCalled();
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

  it('keeps the new-post datetime field inside the light Facebook theme scope', async () => {
    setConnected(true);
    render(<FacebookComposer />);

    // eslint-disable-next-line testing-library/no-node-access -- The heading is a direct child of the themed composer scope.
    const composer = screen.getByRole('heading', { name: 'Facebook' }).parentElement;
    expect(composer).toHaveClass(styles.composer);
    expect(composer).not.toHaveClass(styles.dark);

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    const scheduleDateTime = screen.getByLabelText('Date & Time (PST)');
    expect(scheduleDateTime).toHaveAttribute('type', 'datetime-local');
    expect(scheduleDateTime).toHaveClass(styles.field);
    expect(composer).toContainElement(scheduleDateTime);
  });

  it('keeps new-post and edit datetime fields inside the dark Facebook theme scope', async () => {
    setConnected(true, true);
    dispatch.mockImplementation(action => {
      if (action.type === 'SCHEDULED') {
        return Promise.resolve({
          scheduledPosts: [
            {
              _id: 'scheduled-1',
              message: 'Post to edit',
              scheduledFor: '2099-01-01T20:00:00.000Z',
              status: 'pending',
            },
          ],
        });
      }
      return Promise.resolve({ success: true });
    });
    render(<FacebookComposer />);

    // eslint-disable-next-line testing-library/no-node-access -- The heading is a direct child of the themed composer scope.
    const composer = screen.getByRole('heading', { name: 'Facebook' }).parentElement;
    expect(composer).toHaveClass(styles.composer, styles.dark);

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await screen.findByText('Post to edit');
    const scheduleDateTime = screen.getByLabelText('Date & Time (PST)');
    expect(scheduleDateTime).toHaveAttribute('type', 'datetime-local');
    expect(scheduleDateTime).toHaveClass(styles.field);
    expect(composer).toContainElement(scheduleDateTime);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const editDialog = screen.getByRole('dialog', { name: 'Edit Scheduled Post' });
    const editDateTime = within(editDialog).getByDisplayValue('2099-01-01T12:00');
    expect(editDateTime).toHaveAttribute('type', 'datetime-local');
    expect(editDateTime).toHaveClass(styles.field);
    expect(composer).toContainElement(editDateTime);
  });

  it('blocks posting and scheduling when Facebook is confirmed disconnected', async () => {
    setConnected(false);
    render(<FacebookComposer />);
    expect(screen.getByText('⚠️ Facebook Not Connected')).toBeInTheDocument();
    expect(screen.getByText('Connect a Facebook Page before posting.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post to facebook' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Schedule Post' })).toBeDisabled();
    expectNoFacebookSubmission();

    fireEvent.click(screen.getByRole('button', { name: 'Settings tab' }));
    expect(screen.getByText('Facebook Page Connection')).toBeInTheDocument();
  });

  it('blocks stale connected status while the connection status is loading', async () => {
    setFacebookState({ connectionStatus: connectedStatus, loading: true });
    render(<FacebookComposer />);

    expect(screen.getByText('Checking Facebook Connection')).toBeInTheDocument();
    expect(screen.queryByText('⚠️ Facebook Not Connected')).not.toBeInTheDocument();
    const postButton = screen.getByRole('button', { name: 'Post to facebook' });
    expect(postButton).toBeDisabled();
    postButton.disabled = false;
    fireEvent.click(postButton);

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    const scheduleButton = screen.getByRole('button', { name: 'Schedule Post' });
    expect(scheduleButton).toBeDisabled();
    scheduleButton.disabled = false;
    fireEvent.click(scheduleButton);
    expectNoFacebookSubmission();
  });

  it('blocks an unknown status without exposing the raw backend error', async () => {
    const rawError = 'database host facebook-internal.example failed';
    setFacebookState({ connectionStatus: { error: rawError }, loading: false });
    const view = render(<FacebookComposer />);

    expect(screen.getByText('Unable to Verify Facebook Connection')).toBeInTheDocument();
    expect(screen.queryByText('⚠️ Facebook Not Connected')).not.toBeInTheDocument();
    expect(view.container).not.toHaveTextContent(rawError);
    expect(screen.getByRole('button', { name: 'Post to facebook' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Schedule Post' })).toBeDisabled();
    expect(view.container).not.toHaveTextContent(rawError);
    expectNoFacebookSubmission();

    fireEvent.click(screen.getByRole('button', { name: 'Settings tab' }));
    expect(screen.getByText('Facebook Page Connection')).toBeInTheDocument();
  });

  it('blocks posting and scheduling for an expired Facebook connection', async () => {
    setFacebookState({
      connectionStatus: { ...connectedStatus, tokenStatus: 'expired' },
      loading: false,
    });
    render(<FacebookComposer />);

    expect(screen.getByText('Facebook Connection Expired')).toBeInTheDocument();
    expect(screen.getByText('Reconnect your Facebook Page before posting.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post to facebook' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '⏰ Scheduled' }));
    await waitFor(() => expect(fetchScheduledPosts).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Schedule Post' })).toBeDisabled();
    expectNoFacebookSubmission();
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
