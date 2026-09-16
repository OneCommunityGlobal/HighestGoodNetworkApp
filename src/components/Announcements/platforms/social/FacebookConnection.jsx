import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  connectFacebookPage,
  disconnectFacebookPage,
  getFacebookConnectionStatus,
  initiateFacebookLogin,
} from '~/actions/facebookAuthActions';
import styles from './FacebookComposer.module.css';

const PACIFIC_TIMEZONE = 'America/Los_Angeles';

const buildRequestor = authUser => {
  if (!authUser?.userid) return null;
  return {
    requestorId: authUser.userid,
    name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
    role: authUser.role,
    permissions: authUser.permissions,
  };
};

const formatDate = date =>
  date
    ? moment(date)
        .tz(PACIFIC_TIMEZONE)
        .format('MMM D, YYYY h:mm A')
    : 'Unknown';

function FacebookLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PageSelector({ pages, darkMode, onSelect, onCancel }) {
  return (
    <div className={styles.modalOverlay} role="presentation">
      <div className={classnames(styles.modal, { [styles.dark]: darkMode })} role="dialog">
        <h4>Select a Facebook Page</h4>
        <p className={styles.muted}>Choose the Page you want to connect for posting:</p>
        {pages.map(page => (
          <button
            className={styles.pageOption}
            key={page.pageId}
            type="button"
            onClick={() => onSelect(page)}
          >
            <strong>{page.pageName}</strong>
            <span className={styles.meta}>
              <br />
              {page.category} • ID: {page.pageId}
            </span>
          </button>
        ))}
        <button className={styles.secondaryButton} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function FacebookConnection() {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const connectionStatus = useSelector(state => state.facebook?.connectionStatus);
  const loading = useSelector(state => state.facebook?.loading);
  const requestor = useMemo(() => buildRequestor(authUser), [authUser]);
  const canManage = authUser?.role === 'Owner' || authUser?.role === 'Administrator';

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectionNonce, setSelectionNonce] = useState(null);

  useEffect(() => {
    if (connectionStatus === null) dispatch(getFacebookConnectionStatus());
  }, [connectionStatus, dispatch]);

  const handleConnect = async () => {
    if (!requestor) {
      toast.error('Please log in to connect Facebook.');
      return;
    }
    setConnecting(true);
    try {
      const result = await dispatch(initiateFacebookLogin({ requestor }));
      if (result.success && result.pages?.length > 0) {
        setPages(result.pages);
        setSelectionNonce(result.selectionNonce);
      }
    } catch {
      // The action displays the historical toast.
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
          selectionNonce,
          requestor,
        }),
      );
      setPages([]);
      setSelectionNonce(null);
    } catch {
      // The action displays the historical toast.
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    // eslint-disable-next-line no-alert -- Preserve the historical disconnect confirmation.
    const confirmed = window.confirm(
      'Are you sure you want to disconnect Facebook? Scheduled posts will fail until reconnected.',
    );
    if (!confirmed) return;

    setDisconnecting(true);
    try {
      await dispatch(disconnectFacebookPage({ requestor }));
    } catch {
      // The action displays the historical toast.
    } finally {
      setDisconnecting(false);
    }
  };

  const connected = connectionStatus?.connected;
  const expired = connectionStatus?.tokenStatus === 'expired';
  const statusText = connected ? (expired ? 'Token Expired' : 'Connected') : 'Not Connected';

  if (loading) {
    return (
      <div className={classnames(styles.connection, { [styles.dark]: darkMode })}>
        <p className={styles.muted}>Loading connection status...</p>
      </div>
    );
  }

  return (
    <div className={classnames(styles.connection, { [styles.dark]: darkMode })}>
      <div className={styles.connectionHeader}>
        <div className={styles.connectionTitle}>
          <FacebookLogo />
          <div>
            <h4>Facebook Page Connection</h4>
            {connected && <p className={styles.muted}>{connectionStatus.pageName}</p>}
          </div>
        </div>
        <span
          className={classnames(styles.badge, {
            [styles.badgeDisconnected]: !connected,
            [styles.badgeExpired]: expired,
          })}
        >
          {statusText}
        </span>
      </div>

      {connected ? (
        <div>
          <div className={styles.meta}>
            <p>
              <strong>Page ID:</strong> {connectionStatus.pageId}
            </p>
            <p>
              <strong>Connected:</strong> {formatDate(connectionStatus.connectedAt)} by{' '}
              {connectionStatus.connectedBy}
            </p>
            {expired && (
              <p className={styles.error}>
                <strong>⚠️ Token Issue:</strong> Please reconnect to restore posting capability.
              </p>
            )}
            {connectionStatus.lastVerifiedAt && (
              <p>
                <strong>Last Verified:</strong> {formatDate(connectionStatus.lastVerifiedAt)}
              </p>
            )}
            {connectionStatus.lastError && (
              <p className={styles.error}>
                <strong>Last Error:</strong> {connectionStatus.lastError}
              </p>
            )}
          </div>
          {canManage ? (
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={connecting}
                onClick={handleConnect}
              >
                {connecting ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button
                className={styles.dangerButton}
                type="button"
                disabled={disconnecting}
                onClick={handleDisconnect}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <p className={styles.muted}>
              Only Owners and Administrators can manage the Facebook connection.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className={styles.muted}>Connect a Facebook Page to enable posting and scheduling.</p>
          {canManage ? (
            <button
              className={styles.primaryButton}
              type="button"
              disabled={connecting}
              onClick={handleConnect}
            >
              {connecting ? 'Connecting...' : 'Connect Facebook Page'}
            </button>
          ) : (
            <p className={styles.error}>
              Only Owners and Administrators can connect a Facebook Page.
            </p>
          )}
        </div>
      )}

      {pages.length > 0 && (
        <PageSelector
          pages={pages}
          darkMode={darkMode}
          onSelect={handleSelectPage}
          onCancel={() => {
            setPages([]);
            setSelectionNonce(null);
          }}
        />
      )}
    </div>
  );
}
