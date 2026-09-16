import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  connectFacebookPage,
  disconnectFacebookPage,
  getFacebookConnectionStatus,
  initiateFacebookLogin,
} from '~/actions/facebookAuthActions';
import FacebookConnection from './FacebookConnection';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('~/actions/facebookAuthActions', () => ({
  getFacebookConnectionStatus: vi.fn(() => ({ type: 'STATUS' })),
  initiateFacebookLogin: vi.fn(() => ({ type: 'LOGIN' })),
  connectFacebookPage: vi.fn(payload => ({ type: 'CONNECT', payload })),
  disconnectFacebookPage: vi.fn(payload => ({ type: 'DISCONNECT', payload })),
}));

const owner = {
  userid: 'user-1',
  firstName: 'Test',
  lastName: 'Owner',
  role: 'Owner',
  permissions: { frontPermissions: [], removedDefaultPermissions: [] },
};

const disconnectedFacebook = { loading: false, connectionStatus: { connected: false } };
const connectedFacebook = {
  loading: false,
  connectionStatus: {
    connected: true,
    pageName: 'One Community',
    pageId: '123',
    connectedAt: '2026-04-17T12:00:00Z',
    connectedBy: 'Test Owner',
    tokenStatus: 'valid',
    lastVerifiedAt: '2026-04-17T13:00:00Z',
  },
};

let currentState;
let actionResults;

const stateFor = ({ user = owner, facebook = disconnectedFacebook, roles = [] } = {}) => ({
  auth: { user },
  theme: { darkMode: false },
  facebook,
  role: { roles },
});

const setState = state => {
  currentState = state;
  useSelector.mockImplementation(selector => selector(currentState));
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

describe('FacebookConnection', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    actionResults = {};
    setState(stateFor());
    useDispatch.mockReturnValue(dispatch);
    dispatch.mockImplementation(action => {
      if (typeof action === 'function') return action(dispatch, () => currentState);
      const result = actionResults[action.type];
      return typeof result === 'function' ? result() : result || Promise.resolve({});
    });
  });

  it('dispatches the initial connection-status request', () => {
    setState(stateFor({ facebook: { loading: false, connectionStatus: null } }));
    render(<FacebookConnection />);
    expect(getFacebookConnectionStatus).toHaveBeenCalledTimes(1);
  });

  it('shows the loading state', () => {
    setState(stateFor({ facebook: { loading: true, connectionStatus: null } }));
    render(<FacebookConnection />);
    expect(screen.getByText('Loading connection status...')).toBeInTheDocument();
  });

  it('shows Connect Facebook Page for a genuinely disconnected Owner', () => {
    render(<FacebookConnection />);
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('shows supported connected Page metadata', () => {
    setState(stateFor({ facebook: connectedFacebook }));
    render(<FacebookConnection />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('One Community')).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/Last Verified:/)).toBeInTheDocument();
  });

  it('renders a generic retryable status error instead of disconnected state', () => {
    setState(
      stateFor({
        facebook: {
          loading: false,
          connectionStatus: { error: 'internal network details' },
        },
      }),
    );
    render(<FacebookConnection />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to determine the Facebook connection status',
    );
    expect(screen.queryByText('Not Connected')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Facebook Page' })).not.toBeInTheDocument();
    expect(screen.queryByText('internal network details')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Status' }));
    expect(getFacebookConnectionStatus).toHaveBeenCalledTimes(1);
  });

  it('requires explicit selection even when the callback returns one Page', async () => {
    actionResults.LOGIN = Promise.resolve({
      success: true,
      pages: [{ pageId: '123', pageName: 'One Community', category: 'Community' }],
      selectionNonce: 'one-page-nonce',
    });
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    expect(await screen.findByText('Select a Facebook Page')).toBeInTheDocument();
    expect(connectFacebookPage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /One Community/ }));
    await waitFor(() =>
      expect(connectFacebookPage).toHaveBeenCalledWith(
        expect.objectContaining({
          pageId: '123',
          pageName: 'One Community',
          selectionNonce: 'one-page-nonce',
        }),
      ),
    );
  });

  it('connects a selected Page from multiple choices with the callback nonce', async () => {
    actionResults.LOGIN = Promise.resolve({
      success: true,
      pages: [
        { pageId: '123', pageName: 'First Page', category: 'Community' },
        { pageId: '456', pageName: 'Second Page', category: 'Nonprofit' },
      ],
      selectionNonce: 'multiple-page-nonce',
    });
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    await screen.findByText('Select a Facebook Page');
    fireEvent.click(screen.getByRole('button', { name: /Second Page/ }));
    await waitFor(() =>
      expect(connectFacebookPage).toHaveBeenCalledWith(
        expect.objectContaining({
          pageId: '456',
          pageName: 'Second Page',
          selectionNonce: 'multiple-page-nonce',
        }),
      ),
    );
  });

  it('replaces an older selection nonce when a new login flow starts', async () => {
    let loginCount = 0;
    actionResults.LOGIN = () => {
      loginCount += 1;
      return Promise.resolve(
        loginCount === 1
          ? {
              success: true,
              pages: [{ pageId: '123', pageName: 'Old Page', category: 'Community' }],
              selectionNonce: 'old-nonce',
            }
          : {
              success: true,
              pages: [{ pageId: '456', pageName: 'New Page', category: 'Nonprofit' }],
              selectionNonce: 'new-nonce',
            },
      );
    };

    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    await screen.findByRole('button', { name: /Old Page/ });

    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    expect(await screen.findByRole('button', { name: /New Page/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Old Page/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /New Page/ }));

    await waitFor(() =>
      expect(connectFacebookPage).toHaveBeenCalledWith(
        expect.objectContaining({
          pageId: '456',
          selectionNonce: 'new-nonce',
        }),
      ),
    );
  });

  it('recovers the Connect control after a zero-Page or callback failure', async () => {
    actionResults.LOGIN = () => Promise.reject(new Error('No pages found'));
    render(<FacebookConnection />);
    const connectButton = screen.getByRole('button', { name: 'Connect Facebook Page' });
    fireEvent.click(connectButton);
    await waitFor(() => expect(connectButton).toBeEnabled());
    expect(screen.queryByText('Select a Facebook Page')).not.toBeInTheDocument();
  });

  it('recovers Page selection controls after connect failure', async () => {
    actionResults.LOGIN = Promise.resolve({
      success: true,
      pages: [{ pageId: '123', pageName: 'One Community', category: 'Community' }],
      selectionNonce: 'nonce',
    });
    actionResults.CONNECT = () => Promise.reject(new Error('Connect failed'));
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    const pageButton = await screen.findByRole('button', { name: /One Community/ });
    fireEvent.click(pageButton);
    await waitFor(() => expect(pageButton).toBeEnabled());
    expect(screen.getByText('Select a Facebook Page')).toBeInTheDocument();
  });

  it('prevents duplicate SDK login requests while Connect is pending', async () => {
    const login = deferred();
    actionResults.LOGIN = login.promise;
    render(<FacebookConnection />);
    const connectButton = screen.getByRole('button', { name: 'Connect Facebook Page' });
    act(() => {
      connectButton.click();
      connectButton.click();
    });
    expect(initiateFacebookLogin).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();
    login.resolve({ success: true, pages: [], selectionNonce: 'nonce' });
  });

  it('prevents duplicate Page connect requests while selection is pending', async () => {
    const connect = deferred();
    actionResults.LOGIN = Promise.resolve({
      success: true,
      pages: [{ pageId: '123', pageName: 'One Community', category: 'Community' }],
      selectionNonce: 'nonce',
    });
    actionResults.CONNECT = connect.promise;
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    const pageButton = await screen.findByRole('button', { name: /One Community/ });
    act(() => {
      pageButton.click();
      pageButton.click();
    });
    expect(connectFacebookPage).toHaveBeenCalledTimes(1);
    expect(pageButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    connect.resolve({ success: true });
  });

  it('prevents reconnect and duplicate disconnect while disconnect is pending', () => {
    const disconnect = deferred();
    actionResults.DISCONNECT = disconnect.promise;
    setState(stateFor({ facebook: connectedFacebook }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<FacebookConnection />);
    const disconnectButton = screen.getByRole('button', { name: 'Disconnect' });
    act(() => {
      disconnectButton.click();
      disconnectButton.click();
    });
    expect(disconnectFacebookPage).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Disconnecting...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeDisabled();
    disconnect.resolve({ success: true });
  });

  it('recovers Disconnect controls after failure', async () => {
    actionResults.DISCONNECT = () => Promise.reject(new Error('Disconnect failed'));
    setState(stateFor({ facebook: connectedFacebook }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Disconnect' })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeEnabled();
  });

  it('renders disconnected state after a successful disconnect refresh', async () => {
    setState(stateFor({ facebook: connectedFacebook }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const view = render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    await waitFor(() => expect(disconnectFacebookPage).toHaveBeenCalledTimes(1));
    setState(stateFor());
    view.rerender(<FacebookConnection />);
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('shows expired authorization and reconnects through the same login flow', async () => {
    setState(
      stateFor({
        facebook: {
          ...connectedFacebook,
          connectionStatus: { ...connectedFacebook.connectionStatus, tokenStatus: 'expired' },
        },
      }),
    );
    actionResults.LOGIN = Promise.resolve({ success: true, pages: [], selectionNonce: 'nonce' });
    render(<FacebookConnection />);
    expect(screen.getByText('Token Expired')).toBeInTheDocument();
    expect(screen.getByText(/Please reconnect/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reconnect' }));
    await waitFor(() => expect(initiateFacebookLogin).toHaveBeenCalledTimes(1));
  });

  it.each(['Owner', 'Administrator'])('%s can manage the connection', role => {
    setState(stateFor({ user: { ...owner, role } }));
    render(<FacebookConnection />);
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('allows a user with an individual postFacebookContent permission to manage', () => {
    setState(
      stateFor({
        user: {
          ...owner,
          role: 'Volunteer',
          permissions: {
            frontPermissions: ['postFacebookContent'],
            removedDefaultPermissions: [],
          },
        },
        roles: [{ roleName: 'Volunteer', permissions: [] }],
      }),
    );
    render(<FacebookConnection />);
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('allows an effective role-default postFacebookContent permission', () => {
    setState(
      stateFor({
        user: { ...owner, role: 'Social Manager' },
        roles: [{ roleName: 'Social Manager', permissions: ['postFacebookContent'] }],
      }),
    );
    render(<FacebookConnection />);
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('does not grant management access from sendEmails alone', () => {
    setState(
      stateFor({
        user: {
          ...owner,
          role: 'Volunteer',
          permissions: { frontPermissions: ['sendEmails'], removedDefaultPermissions: [] },
        },
      }),
    );
    render(<FacebookConnection />);
    expect(screen.queryByRole('button', { name: 'Connect Facebook Page' })).not.toBeInTheDocument();
    expect(screen.getByText(/Only authorized users/)).toBeInTheDocument();
  });

  it('honors removal of a role-default postFacebookContent permission', () => {
    setState(
      stateFor({
        user: {
          ...owner,
          role: 'Social Manager',
          permissions: {
            frontPermissions: [],
            removedDefaultPermissions: ['postFacebookContent'],
          },
        },
        roles: [{ roleName: 'Social Manager', permissions: ['postFacebookContent'] }],
      }),
    );
    render(<FacebookConnection />);
    expect(screen.queryByRole('button', { name: 'Connect Facebook Page' })).not.toBeInTheDocument();
    expect(screen.getByText(/Only authorized users/)).toBeInTheDocument();
  });

  it('does not render credential-shaped status or callback response values', async () => {
    setState(
      stateFor({
        facebook: {
          ...connectedFacebook,
          connectionStatus: {
            ...connectedFacebook.connectionStatus,
            accessToken: 'status-token-secret',
            pageAccessToken: 'page-token-secret',
            appSecret: 'app-secret-value',
          },
        },
      }),
    );
    const view = render(<FacebookConnection />);
    expect(view.container).not.toHaveTextContent('status-token-secret');
    expect(view.container).not.toHaveTextContent('page-token-secret');
    expect(view.container).not.toHaveTextContent('app-secret-value');

    setState(stateFor());
    actionResults.LOGIN = Promise.resolve({
      success: true,
      pages: [
        {
          pageId: '123',
          pageName: 'One Community',
          category: 'Community',
          accessToken: 'callback-page-token-secret',
        },
      ],
      selectionNonce: 'private-selection-nonce',
    });
    view.rerender(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    await screen.findByText('Select a Facebook Page');
    expect(view.container).not.toHaveTextContent('callback-page-token-secret');
    expect(view.container).not.toHaveTextContent('private-selection-nonce');
  });
});
