import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  connectFacebookPage,
  disconnectFacebookPage,
  getFacebookConnectionStatus,
  initiateFacebookLogin,
} from '~/actions/facebookAuthActions';
import hasPermission from '~/utils/permissions';
import styles from './FacebookComposer.module.css';

const PACIFIC_TIMEZONE = 'America/Los_Angeles';

const formatDate = date =>
  date
    ? moment(date)
        .tz(PACIFIC_TIMEZONE)
        .format('MMM D, YYYY h:mm A')
    : 'Unknown';

const getStatusText = (connected, expired) => {
  if (!connected) return 'Not Connected';
  return expired ? 'Token Expired' : 'Connected';
};

function FacebookLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PageSelector({ pages, darkMode, disabled, onSelect, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <dialog
        aria-labelledby="facebook-page-selector-title"
        className={classnames(styles.modal, { [styles.dark]: darkMode })}
        open
      >
        <h4 id="facebook-page-selector-title">Select a Facebook Page</h4>
        <p className={styles.muted}>Choose the Page you want to connect for posting:</p>
        {pages.map(page => (
          <button
            className={styles.pageOption}
            key={page.pageId}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(page)}
          >
            <strong>{page.pageName}</strong>
            <span className={styles.meta}>
              <br />
              {page.category} • ID: {page.pageId}
            </span>
          </button>
        ))}
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={disabled}
          onClick={onCancel}
        >
          Cancel
        </button>
      </dialog>
    </div>
  );
}

function ConnectionDetails({
  connected,
  connectionStatus,
  expired,
  canManage,
  managementPending,
  connecting,
  disconnecting,
  onConnect,
  onDisconnect,
}) {
  if (!connected) {
    return (
      <div>
        <p className={styles.muted}>Connect a Facebook Page to enable posting and scheduling.</p>
        {canManage ? (
          <button
            className={styles.primaryButton}
            type="button"
            disabled={managementPending}
            onClick={onConnect}
          >
            {connecting ? 'Connecting...' : 'Connect Facebook Page'}
          </button>
        ) : (
          <p className={styles.error}>Only authorized users can connect a Facebook Page.</p>
        )}
      </div>
    );
  }

  return (
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
            disabled={managementPending}
            onClick={onConnect}
          >
            {connecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            disabled={managementPending}
            onClick={onDisconnect}
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <p className={styles.muted}>Only authorized users can manage the Facebook connection.</p>
      )}
    </div>
  );
}

export default function FacebookConnection() {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const rolePermissions = useSelector(state => state.role?.roles);
  const connectionStatus = useSelector(state => state.facebook?.connectionStatus);
  const loading = useSelector(state => state.facebook?.loading);
  const canManage = useMemo(() => {
    if (authUser?.role === 'Owner' || authUser?.role === 'Administrator') return true;
    return Boolean(dispatch(hasPermission('postFacebookContent')));
  }, [authUser, dispatch, rolePermissions]);

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectionNonce, setSelectionNonce] = useState(null);
  const managementOperationRef = useRef(false);
  const managementPending = connecting || disconnecting;

  const beginManagementOperation = () => {
    if (managementOperationRef.current) return false;
    managementOperationRef.current = true;
    return true;
  };

  const endManagementOperation = () => {
    managementOperationRef.current = false;
  };

  useEffect(() => {
    if (connectionStatus === null) dispatch(getFacebookConnectionStatus());
  }, [connectionStatus, dispatch]);

  const handleConnect = async () => {
    if (managementPending || !beginManagementOperation()) return;
    if (!authUser?.userid) {
      endManagementOperation();
      toast.error('Please log in to connect Facebook.');
      return;
    }
    setPages([]);
    setSelectionNonce(null);
    setConnecting(true);
    try {
      const result = await dispatch(initiateFacebookLogin());
      if (result.success && result.pages?.length > 0) {
        setPages(result.pages);
        setSelectionNonce(result.selectionNonce);
      }
    } catch {
      // The action displays the historical toast.
    } finally {
      endManagementOperation();
      setConnecting(false);
    }
  };

  const handleSelectPage = async page => {
    if (managementPending || !beginManagementOperation()) return;
    setConnecting(true);
    try {
      await dispatch(
        connectFacebookPage({
          pageId: page.pageId,
          pageName: page.pageName,
          selectionNonce,
        }),
      );
      setPages([]);
      setSelectionNonce(null);
    } catch {
      // The action displays the historical toast.
    } finally {
      endManagementOperation();
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (managementPending || !beginManagementOperation()) return;
    // eslint-disable-next-line no-alert -- Preserve the historical disconnect confirmation.
    const confirmed = window.confirm(
      'Are you sure you want to disconnect Facebook? Scheduled posts will fail until reconnected.',
    );
    if (!confirmed) {
      endManagementOperation();
      return;
    }

    setDisconnecting(true);
    try {
      await dispatch(disconnectFacebookPage());
    } catch {
      // The action displays the historical toast.
    } finally {
      endManagementOperation();
      setDisconnecting(false);
    }
  };

  const connected = connectionStatus?.connected;
  const expired = connectionStatus?.tokenStatus === 'expired';
  const statusText = getStatusText(connected, expired);

  if (loading) {
    return (
      <div className={classnames(styles.connection, { [styles.dark]: darkMode })}>
        <p className={styles.muted}>Loading connection status...</p>
      </div>
    );
  }

  if (connectionStatus?.error) {
    return (
      <div className={classnames(styles.connection, { [styles.dark]: darkMode })}>
        <div className={styles.connectionHeader}>
          <div className={styles.connectionTitle}>
            <FacebookLogo />
            <h4>Facebook Page Connection</h4>
          </div>
        </div>
        <p className={styles.error} role="alert">
          Unable to determine the Facebook connection status. Please try again.
        </p>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => dispatch(getFacebookConnectionStatus())}
        >
          Retry Status
        </button>
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

      <ConnectionDetails
        connected={connected}
        connectionStatus={connectionStatus}
        expired={expired}
        canManage={canManage}
        managementPending={managementPending}
        connecting={connecting}
        disconnecting={disconnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {pages.length > 0 && (
        <PageSelector
          pages={pages}
          darkMode={darkMode}
          disabled={managementPending}
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
