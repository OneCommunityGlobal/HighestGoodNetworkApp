import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  getFacebookConnectionStatus,
  initiateFacebookLogin,
  connectFacebookPage,
  disconnectFacebookPage,
} from '~/actions/facebookAuthActions';

const PST_TZ = 'America/Los_Angeles';

export default function FacebookConnection() {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);
  const darkMode = useSelector(state => state.theme.darkMode);

  const requestor = useMemo(() => {
    if (!authUser?.userid) return null;
    return {
      requestorId: authUser.userid,
      name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
      role: authUser.role,
      permissions: authUser.permissions,
    };
  }, [
    authUser?.userid,
    authUser?.firstName,
    authUser?.lastName,
    authUser?.role,
    authUser?.permissions,
  ]);

  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Page selection modal state
  const [availablePages, setAvailablePages] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [grantedScopes, setGrantedScopes] = useState([]);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const canManageConnection = useMemo(() => {
    const role = authUser?.role;
    return role === 'Owner' || role === 'Administrator';
  }, [authUser?.role]);

  const loadConnectionStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await dispatch(getFacebookConnectionStatus());
      setConnectionStatus(status);
    } catch {
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadConnectionStatus();
  }, [loadConnectionStatus]);

  const handleConnect = async () => {
    if (!requestor) {
      toast.error('Please log in to connect Facebook.');
      return;
    }

    setConnecting(true);
    try {
      const result = await dispatch(initiateFacebookLogin({ requestor }));
      if (result.success && result.pages?.length > 0) {
        setAvailablePages(result.pages);
        setUserToken(result.userToken);
        setGrantedScopes(result.grantedScopes);
        setShowPageSelector(true);
      }
    } catch {
      // Error already shown via toast
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectPage = async page => {
    setConnecting(true);
    try {
      await dispatch(
        connectFacebookPage({
          pageId: page.pageId,
          pageName: page.pageName,
          pageAccessToken: page.accessToken,
          userToken,
          grantedScopes,
          requestor,
        }),
      );
      setShowPageSelector(false);
      setAvailablePages([]);
      loadConnectionStatus();
    } catch {
      // Error already shown via toast
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect Facebook? Scheduled posts will fail until reconnected.',
      )
    ) {
      return;
    }

    setDisconnecting(true);
    try {
      await dispatch(disconnectFacebookPage({ requestor }));
      loadConnectionStatus();
    } catch {
      // Error already shown via toast
    } finally {
      setDisconnecting(false);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return 'Unknown';
    return moment(dateStr)
      .tz(PST_TZ)
      .format('MMM D, YYYY h:mm A');
  };

  const getStatusBadge = () => {
    if (!connectionStatus?.connected) {
      return { text: 'Not Connected', color: '#dc3545', bg: '#f8d7da' };
    }
    if (connectionStatus.tokenStatus === 'expired') {
      return { text: 'Token Expired', color: '#dc3545', bg: '#f8d7da' };
    }
    if (connectionStatus.tokenStatus === 'expiring_soon') {
      return { text: 'Expiring Soon', color: '#856404', bg: '#fff3cd' };
    }
    return { text: 'Connected', color: '#155724', bg: '#d4edda' };
  };

  const statusBadge = getStatusBadge();

  // Styles
  const textColor = darkMode ? '#e5e7eb' : '#333';
  const mutedTextColor = darkMode ? '#cbd5e1' : '#666';
  const surfaceBg = darkMode ? '#0f172a' : '#fafafa';
  const borderColor = darkMode ? '#1f2937' : '#ddd';
  const panelBg = darkMode ? '#111827' : '#fff';

  const containerStyle = {
    border: `1px solid ${borderColor}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: surfaceBg,
    color: textColor,
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const badgeStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: statusBadge.color,
    backgroundColor: statusBadge.bg,
  };

  const btnPrimary = {
    backgroundColor: '#1877F2',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const btnDanger = {
    backgroundColor: darkMode ? '#b91c1c' : '#dc3545',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContent = {
    backgroundColor: panelBg,
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '450px',
    maxHeight: '80vh',
    overflow: 'auto',
    color: textColor,
  };

  const pageItemStyle = {
    padding: '12px',
    border: `1px solid ${borderColor}`,
    borderRadius: '6px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    backgroundColor: panelBg,
    color: textColor,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ color: mutedTextColor }}>Loading connection status...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <div>
            <h4 style={{ margin: 0 }}>Facebook Page Connection</h4>
            {connectionStatus?.connected && (
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: mutedTextColor }}>
                {connectionStatus.pageName}
              </p>
            )}
          </div>
        </div>
        <span style={badgeStyle}>{statusBadge.text}</span>
      </div>

      {connectionStatus?.connected ? (
        <div>
          <div style={{ fontSize: '13px', color: mutedTextColor, marginBottom: '12px' }}>
            <p style={{ margin: '4px 0' }}>
              <strong>Page ID:</strong> {connectionStatus.pageId}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Connected:</strong> {formatDate(connectionStatus.connectedAt)} by{' '}
              {connectionStatus.connectedBy}
            </p>
            {connectionStatus.tokenExpiresAt && (
              <p style={{ margin: '4px 0' }}>
                <strong>Token Expires:</strong> {formatDate(connectionStatus.tokenExpiresAt)}
              </p>
            )}
            {connectionStatus.lastError && (
              <p style={{ margin: '4px 0', color: '#dc3545' }}>
                <strong>Last Error:</strong> {connectionStatus.lastError}
              </p>
            )}
          </div>

          {canManageConnection && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                style={{ ...btnPrimary, backgroundColor: '#6c757d' }}
              >
                {connecting ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                style={btnDanger}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          )}

          {!canManageConnection && (
            <p style={{ fontSize: '13px', color: mutedTextColor, fontStyle: 'italic' }}>
              Only Owners and Administrators can manage the Facebook connection.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p style={{ color: mutedTextColor, marginBottom: '12px' }}>
            Connect a Facebook Page to enable posting and scheduling.
          </p>

          {canManageConnection ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              style={{ ...btnPrimary, opacity: connecting ? 0.7 : 1 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {connecting ? 'Connecting...' : 'Connect Facebook Page'}
            </button>
          ) : (
            <p style={{ fontSize: '13px', color: '#dc3545' }}>
              Only Owners and Administrators can connect a Facebook Page.
            </p>
          )}
        </div>
      )}

      {/* Page Selection Modal */}
      {showPageSelector && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h4 style={{ marginTop: 0 }}>Select a Facebook Page</h4>
            <p style={{ color: mutedTextColor, fontSize: '14px' }}>
              Choose the Page you want to connect for posting:
            </p>

            {availablePages.map(page => (
              <div
                key={page.pageId}
                style={pageItemStyle}
                onClick={() => handleSelectPage(page)}
                onKeyDown={e => e.key === 'Enter' && handleSelectPage(page)}
                role="button"
                tabIndex={0}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#1f2937' : '#f0f0f0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = panelBg;
                }}
              >
                <p style={{ margin: 0, fontWeight: 'bold', color: textColor }}>{page.pageName}</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: mutedTextColor }}>
                  {page.category} • ID: {page.pageId}
                </p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setShowPageSelector(false);
                setAvailablePages([]);
              }}
              style={{ ...btnDanger, backgroundColor: '#6c757d', marginTop: '12px', width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
