import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  connectFacebookPage,
  disconnectFacebookPage,
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
  permissions: {},
};

const setState = state => {
  useSelector.mockImplementation(selector => selector(state));
};

describe('FacebookConnection', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    dispatch.mockResolvedValue({});
  });

  it('shows the historical loading state', () => {
    setState({ auth: { user: owner }, theme: { darkMode: false }, facebook: { loading: true } });
    render(<FacebookConnection />);
    expect(screen.getByText('Loading connection status...')).toBeInTheDocument();
  });

  it('shows Connect Facebook Page when disconnected', () => {
    setState({
      auth: { user: owner },
      theme: { darkMode: false },
      facebook: { loading: false, connectionStatus: { connected: false } },
    });
    render(<FacebookConnection />);
    expect(screen.getByRole('button', { name: 'Connect Facebook Page' })).toBeInTheDocument();
  });

  it('shows supported connected-page metadata', () => {
    setState({
      auth: { user: owner },
      theme: { darkMode: false },
      facebook: {
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
      },
    });
    render(<FacebookConnection />);
    expect(screen.getByText('One Community')).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/Last Verified:/)).toBeInTheDocument();
  });

  it('uses the historical login and page-selection flow', async () => {
    setState({
      auth: { user: owner },
      theme: { darkMode: false },
      facebook: { loading: false, connectionStatus: { connected: false } },
    });
    dispatch
      .mockResolvedValueOnce({
        success: true,
        pages: [{ pageId: '123', pageName: 'One Community', category: 'Community' }],
        selectionNonce: 'nonce',
      })
      .mockResolvedValueOnce({ success: true });

    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Facebook Page' }));
    await screen.findByText('Select a Facebook Page');
    fireEvent.click(screen.getByRole('button', { name: /One Community/ }));

    await waitFor(() => {
      expect(initiateFacebookLogin).toHaveBeenCalledWith(
        expect.objectContaining({ requestor: expect.any(Object) }),
      );
      expect(connectFacebookPage).toHaveBeenCalledWith(
        expect.objectContaining({ pageId: '123', selectionNonce: 'nonce' }),
      );
    });
  });

  it('disconnects after confirmation', async () => {
    setState({
      auth: { user: owner },
      theme: { darkMode: false },
      facebook: {
        loading: false,
        connectionStatus: {
          connected: true,
          pageName: 'One Community',
          pageId: '123',
          connectedAt: '2026-04-17T12:00:00Z',
          connectedBy: 'Test Owner',
        },
      },
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<FacebookConnection />);
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    await waitFor(() => expect(disconnectFacebookPage).toHaveBeenCalled());
  });
});
