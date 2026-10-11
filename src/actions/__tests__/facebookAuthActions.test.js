import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import {
  connectFacebookPage,
  disconnectFacebookPage,
  getFacebookConnectionStatus,
  initiateFacebookLogin,
} from '../facebookAuthActions';
import { ENDPOINTS } from '~/utils/URL';
import { SET_FB_CONNECTION_LOADING, SET_FB_CONNECTION_STATUS } from '~/reducers/facebookReducer';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

const grantedScopes = 'pages_show_list,pages_read_engagement,pages_manage_posts';
const facebookAuthUrl = path => `${ENDPOINTS.APIEndpoint()}/social/facebook/auth${path}`;

const setFacebookLoginResponse = authResponse => {
  window.FB = { login: vi.fn(callback => callback({ authResponse })) };
};

describe('Facebook authentication API actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.fbSDKInitialized = true;
    setFacebookLoginResponse({
      accessToken: 'sdk-access-token-placeholder',
      userID: '123',
      grantedScopes,
    });
  });

  it('retrieves Facebook connection status from the literal Facebook route', async () => {
    axios.get.mockResolvedValue({ data: { connected: true } });
    const dispatch = vi.fn();
    await getFacebookConnectionStatus()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(facebookAuthUrl('/status'));
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: SET_FB_CONNECTION_LOADING,
      payload: true,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: SET_FB_CONNECTION_STATUS,
      payload: { connected: true },
    });
  });

  it('stores a distinct status error when the status request fails', async () => {
    axios.get.mockRejectedValue(new Error('network details'));
    const dispatch = vi.fn();
    const result = await getFacebookConnectionStatus()(dispatch);
    expect(result).toEqual({ error: 'network details' });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: SET_FB_CONNECTION_STATUS,
      payload: { error: 'network details' },
    });
  });

  it('requests the exact Page-management SDK scopes', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        pages: [{ pageId: '456', pageName: 'One Community' }],
        selectionNonce: 'nonce',
      },
    });
    await initiateFacebookLogin()(vi.fn());
    expect(window.FB.login).toHaveBeenCalledWith(expect.any(Function), {
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
      return_scopes: true,
    });
  });

  it('sends the exact SDK callback payload to the literal Facebook callback route', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        pages: [{ pageId: '456', pageName: 'One Community' }],
        selectionNonce: 'nonce',
      },
    });
    await initiateFacebookLogin()(vi.fn());
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/callback'), {
      accessToken: 'sdk-access-token-placeholder',
      userID: '123',
      grantedScopes,
    });
  });

  it('rejects a cancelled SDK login without calling the backend', async () => {
    setFacebookLoginResponse(undefined);
    await expect(initiateFacebookLogin()(vi.fn())).rejects.toThrow('Login cancelled');
    expect(axios.post).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('Facebook login was cancelled.');
  });

  it('surfaces callback failures and does not return Page state', async () => {
    const error = { response: { data: { error: 'Callback rejected' } } };
    axios.post.mockRejectedValue(error);
    await expect(initiateFacebookLogin()(vi.fn())).rejects.toBe(error);
    expect(toast.error).toHaveBeenCalledWith(
      'Facebook authentication failed: Callback rejected',
    );
  });

  it('rejects a successful callback that returns zero Pages', async () => {
    axios.post.mockResolvedValue({ data: { success: true, pages: [], selectionNonce: 'nonce' } });
    await expect(initiateFacebookLogin()(vi.fn())).rejects.toThrow('No pages found');
    expect(toast.error).toHaveBeenCalledWith(
      'No Facebook Pages found. Make sure you have admin access to a Page.',
    );
  });

  it('connects the selected Page with the callback nonce and refreshes status', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const dispatch = vi.fn();
    const payload = {
      pageId: '456',
      pageName: 'One Community',
      selectionNonce: 'callback-nonce',
    };
    await connectFacebookPage(payload)(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/connect'), payload);
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('keeps Page connection pending until its status refresh finishes', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    let finishRefresh;
    const refresh = new Promise(resolve => {
      finishRefresh = resolve;
    });
    const dispatch = vi.fn(() => refresh);

    const connection = connectFacebookPage({
      pageId: '456',
      pageName: 'One Community',
      selectionNonce: 'callback-nonce',
    })(dispatch);
    let settled = false;
    connection.then(() => {
      settled = true;
    });

    await vi.waitFor(() => expect(dispatch).toHaveBeenCalledWith(expect.any(Function)));
    expect(settled).toBe(false);
    finishRefresh();
    await connection;
    expect(settled).toBe(true);
  });

  it('rejects a failed Page connection without refreshing status', async () => {
    const error = { response: { data: { details: 'Nonce expired' } } };
    axios.post.mockRejectedValue(error);
    const dispatch = vi.fn();
    const payload = {
      pageId: '456',
      pageName: 'One Community',
      selectionNonce: 'expired-nonce',
    };
    await expect(connectFacebookPage(payload)(dispatch)).rejects.toBe(error);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/connect'), payload);
    expect(dispatch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to connect Facebook Page: Nonce expired');
  });

  it('disconnects the Facebook Page and refreshes status', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const dispatch = vi.fn();
    await disconnectFacebookPage()(dispatch);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/disconnect'), {});
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('rejects a failed disconnect without refreshing status', async () => {
    const error = { response: { data: { error: 'Not authorized' } } };
    axios.post.mockRejectedValue(error);
    const dispatch = vi.fn();
    await expect(disconnectFacebookPage()(dispatch)).rejects.toBe(error);
    expect(axios.post).toHaveBeenCalledWith(facebookAuthUrl('/disconnect'), {});
    expect(dispatch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to disconnect Facebook: Not authorized');
  });

  it('never routes Facebook authentication to Mastodon or X', async () => {
    axios.get.mockResolvedValue({ data: { connected: false } });
    await getFacebookConnectionStatus()(vi.fn());
    const requestedUrls = [...axios.get.mock.calls, ...axios.post.mock.calls].map(([url]) => url);
    expect(requestedUrls.every(url => url.includes('/api/social/facebook/'))).toBe(true);
  });
});
