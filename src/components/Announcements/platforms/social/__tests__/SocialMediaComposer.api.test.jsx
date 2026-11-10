import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import SocialMediaComposer from '../SocialMediaComposer';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

const renderComposer = ({ darkMode = false } = {}) =>
  render(
    <Provider store={configureMockStore([])({ theme: { darkMode } })}>
      <SocialMediaComposer platform="mastodon" />
    </Provider>,
  );

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const typePost = text =>
  fireEvent.change(screen.getByPlaceholderText(/Write your mastodon post here/i), {
    target: { value: text },
  });

const setSchedule = (date, time) => {
  fireEvent.change(screen.getByLabelText('Schedule date'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('Schedule time'), { target: { value: time } });
};

describe('SocialMediaComposer API calls (Mastodon)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  it('schedules a post through the backend API with the chosen time', async () => {
    renderComposer();
    typePost('Hello from HGN');
    setSchedule(tomorrow(), '10:30');

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Post' }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe(ENDPOINTS.MASTODON_SCHEDULED_POSTS);
    expect(body.description).toBe('Hello from HGN');
    expect(new Date(body.scheduledTime).getTime()).toBe(new Date(`${tomorrow()}T10:30`).getTime());
    expect(toast.success).toHaveBeenCalledWith('Post scheduled successfully!');
  });

  it('shows the error message returned by the backend', async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: 'Scheduled time must be in the future' } },
    });
    renderComposer();
    typePost('Hello');
    setSchedule(tomorrow(), '10:30');

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Post' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Scheduled time must be in the future'),
    );
  });

  it('does not call the API when the date or time is missing', () => {
    renderComposer();
    typePost('Hello');

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Post' }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Please select both date and time.');
  });

  it('loads scheduled posts from the backend API', async () => {
    renderComposer();

    fireEvent.click(screen.getByRole('button', { name: 'Scheduled' }));

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.MASTODON_SCHEDULED_POSTS));
  });

  it('loads post history from the backend API', async () => {
    renderComposer();

    fireEvent.click(screen.getByRole('button', { name: 'History' }));

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.MASTODON_POST_HISTORY(20)),
    );
  });

  const editFirstScheduledPost = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Scheduled' }));
    fireEvent.click(await screen.findByTitle('Edit'));
  };

  const scheduledPost = overrides => ({
    _id: 'old-1',
    postData: JSON.stringify({ status: 'Original post' }),
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    ...overrides,
  });

  it('deletes the original after saving an edited post', async () => {
    axios.get.mockResolvedValue({ data: [scheduledPost()] });
    renderComposer();
    await editFirstScheduledPost();

    fireEvent.click(screen.getByRole('button', { name: 'Update Post' }));

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(ENDPOINTS.MASTODON_SCHEDULED_POST_BY_ID('old-1')),
    );
    expect(toast.success).toHaveBeenCalledWith('Post updated successfully!');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('warns that both versions are scheduled when deleting the original fails', async () => {
    axios.get.mockResolvedValue({ data: [scheduledPost()] });
    axios.delete.mockRejectedValue({ response: { status: 500 } });
    renderComposer();
    await editFirstScheduledPost();

    fireEvent.click(screen.getByRole('button', { name: 'Update Post' }));

    await waitFor(() => expect(toast.warning).toHaveBeenCalledTimes(1));
    expect(toast.warning.mock.calls[0][0]).toMatch(/original could not be removed/);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('keeps the original when saving an edited post fails', async () => {
    axios.get.mockResolvedValue({ data: [scheduledPost()] });
    axios.post.mockRejectedValue({ response: { data: { error: 'Server unavailable' } } });
    renderComposer();
    await editFirstScheduledPost();

    fireEvent.click(screen.getByRole('button', { name: 'Update Post' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server unavailable'));
    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('shows an error instead of an empty list when scheduled posts fail to load', async () => {
    axios.get.mockRejectedValue({ response: { data: { error: 'Not authorized' } } });
    renderComposer();

    fireEvent.click(screen.getByRole('button', { name: 'Scheduled' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorized');
    expect(screen.queryByText('No scheduled posts yet.')).not.toBeInTheDocument();
  });

  it('shows a failed post with its error', async () => {
    axios.get.mockResolvedValue({
      data: [scheduledPost({ status: 'failed', lastError: 'Bad gateway' })],
    });
    renderComposer();

    fireEvent.click(screen.getByRole('button', { name: 'Scheduled' }));

    expect(await screen.findByText(/Not published\./)).toBeInTheDocument();
    expect(screen.getByText(/Bad gateway/)).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).not.toBeDisabled();
  });

  it('disables actions on a post that is being published', async () => {
    axios.get.mockResolvedValue({ data: [scheduledPost({ status: 'publishing' })] });
    renderComposer();

    fireEvent.click(screen.getByRole('button', { name: 'Scheduled' }));

    expect(await screen.findByText('Publishing now…')).toBeInTheDocument();
    expect(screen.getByTitle('Edit')).toBeDisabled();
    expect(screen.getByTitle('Post now')).toBeDisabled();
    expect(screen.getByTitle('Delete')).toBeDisabled();
  });
});
