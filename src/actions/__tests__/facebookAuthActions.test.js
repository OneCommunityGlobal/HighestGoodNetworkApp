import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  connectFacebookPage,
  disconnectFacebookPage,
  getFacebookConnectionStatus,
  initiateFacebookLogin,
} from '../facebookAuthActions';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

const requestor = { requestorId: 'user-1', role: 'Owner', permissions: {} };
const facebookAuthUrl = path => `${ENDPOINTS.APIEndpoint()}/social/facebook/auth${path}`;

describe('Facebook authentication API actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.fbSDKInitialized = true;
    window.FB = {
      login: vi.fn(callback =>
        callback({
          authResponse: {
            accessToken: 'short-lived-token',
            userID: '123',
            grantedScopes: 'pages_manage_posts,pages_read_user_content',
          },
        }),
      ),
    };
  });

  it('retrieves Facebook connection status', async () => {
    axios.get.mockResolvedValue({ data: { connected: true } });
    const dispatch = vi.fn();
    await getFacebookConnectionStatus()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(facebookAuthUrl('/status'));
  });

  it('sends the Facebook SDK callback payload to the Facebook callback endpoint', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        pages: [{ pageId: '456', pageName: 'One Community' }],
        selectionNonce: 'nonce',
      },
    });

    await initiateFacebookLogin({ requestor })(vi.fn());

    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/callback'), {
      accessToken: 'short-lived-token',
      userID: '123',
      grantedScopes: 'pages_manage_posts,pages_read_user_content',
      requestor,
    });
  });

  it('connects the selected Facebook page', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const dispatch = vi.fn();
    const payload = {
      pageId: '456',
      pageName: 'One Community',
      selectionNonce: 'nonce',
      requestor,
    };
    await connectFacebookPage(payload)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/connect'), payload);
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('disconnects the Facebook page', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const dispatch = vi.fn();
    await disconnectFacebookPage({ requestor })(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/disconnect'), { requestor });
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('never routes Facebook authentication to Mastodon or X', async () => {
    axios.get.mockResolvedValue({ data: { connected: false } });
    await getFacebookConnectionStatus()(vi.fn());
    const requestedUrls = [...axios.get.mock.calls, ...axios.post.mock.calls].map(([url]) => url);
    expect(requestedUrls.every(url => url.includes('/api/social/facebook/'))).toBe(true);
  });
});
