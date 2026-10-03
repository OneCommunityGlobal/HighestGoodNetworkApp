import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelScheduledPost,
  fetchPostHistory,
  fetchScheduledPosts,
  postFacebookContent,
  postFacebookContentWithImage,
  scheduleFacebookPost,
  scheduleFacebookPostWithImage,
  updateScheduledPost,
} from '../facebookActions';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const dispatch = vi.fn();
const requestor = { requestorId: 'user-1', role: 'Owner', permissions: {} };
const facebookUrl = path => `${ENDPOINTS.APIEndpoint()}/social/facebook${path}`;

describe('Facebook API actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    axios.put.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  it('posts JSON content to the Facebook post endpoint', async () => {
    const payload = { message: 'Hello Facebook', requestor };
    await postFacebookContent(payload)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookUrl('/post'), payload);
  });

  it('posts image form data to the Facebook upload endpoint', async () => {
    const formData = new FormData();
    formData.append('image', new Blob(['image'], { type: 'image/png' }), 'post.png');
    await postFacebookContentWithImage(formData)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(
      facebookUrl('/post/upload'),
      formData,
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  });

  it('schedules JSON content on the Facebook schedule endpoint', async () => {
    const payload = {
      message: 'Later',
      scheduledFor: '2099-01-01T12:00',
      timezone: 'America/Los_Angeles',
      requestor,
    };
    await scheduleFacebookPost(payload)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookUrl('/schedule'), payload);
  });

  it('schedules image form data on the Facebook schedule upload endpoint', async () => {
    const formData = new FormData();
    formData.append('image', new Blob(['image'], { type: 'image/png' }), 'scheduled.png');
    await scheduleFacebookPostWithImage(formData)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(
      facebookUrl('/schedule/upload'),
      formData,
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
    );
  });

  it('retrieves Facebook scheduled posts with supported query parameters', async () => {
    await fetchScheduledPosts({ requestor, status: 'pending', limit: 20, skip: 5 })(dispatch);
    const [url] = axios.get.mock.calls[0];
    expect(url.split('?')[0]).toBe(facebookUrl('/scheduled'));
    const query = new URL(url).searchParams;
    expect(query.get('status')).toBe('pending');
    expect(query.get('limit')).toBe('20');
    expect(query.get('skip')).toBe('5');
    expect(JSON.parse(query.get('requestor'))).toEqual(requestor);
  });

  it('retrieves Facebook history with supported filters', async () => {
    await fetchPostHistory({
      requestor,
      limit: 15,
      source: 'mongodb',
      pageId: '123',
      status: 'sent',
      postMethod: 'direct',
    })(dispatch);
    const [url] = axios.get.mock.calls[0];
    expect(url.split('?')[0]).toBe(facebookUrl('/history'));
    const query = new URL(url).searchParams;
    expect(Object.fromEntries(query)).toEqual({
      limit: '15',
      source: 'mongodb',
      pageId: '123',
      status: 'sent',
      postMethod: 'direct',
      requestor: JSON.stringify(requestor),
    });
  });

  it('updates a Facebook scheduled post with PUT', async () => {
    const payload = {
      postId: 'scheduled-1',
      message: 'Updated',
      scheduledFor: '2099-01-01T12:00',
      timezone: 'America/Los_Angeles',
      link: 'https://example.com',
      imageUrl: 'https://example.com/image.png',
      requestor,
    };
    await updateScheduledPost(payload)(dispatch);
    expect(axios.put).toHaveBeenCalledWith(
      facebookUrl('/schedule/scheduled-1'),
      {
        message: 'Updated',
        scheduledFor: '2099-01-01T12:00',
        timezone: 'America/Los_Angeles',
        link: 'https://example.com',
        imageUrl: 'https://example.com/image.png',
        requestor,
      },
    );
  });

  it('cancels a Facebook scheduled post with DELETE', async () => {
    await cancelScheduledPost({ postId: 'scheduled-1', requestor })(dispatch);
    expect(axios.delete).toHaveBeenCalledWith(
      facebookUrl('/schedule/scheduled-1'),
      { data: { requestor } },
    );
  });

  it('never routes Facebook actions to Mastodon or X', async () => {
    await postFacebookContent({ message: 'Facebook only', requestor })(dispatch);
    const requestedUrls = [
      ...axios.get.mock.calls,
      ...axios.post.mock.calls,
      ...axios.put.mock.calls,
      ...axios.delete.mock.calls,
    ].map(([url]) => url);
    expect(requestedUrls.every(url => url.includes('/api/social/facebook/'))).toBe(true);
  });
});
