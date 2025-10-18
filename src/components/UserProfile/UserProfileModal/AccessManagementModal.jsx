import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge, Spinner } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faUserPlus,
  faUserMinus,
  faSync,
  faFolder,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './AccessManagementModal.module.css';

const AccessManagementModal = ({ isOpen, onClose, userProfile, darkMode = false }) => {
  const [accessData, setAccessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false); // For bulk actions
  const [inviteLoading, setInviteLoading] = useState({}); // Individual app loading states
  const [revokeLoading, setRevokeLoading] = useState({}); // Individual app revoke loading
  const [confirmAction, setConfirmAction] = useState(null);
  const [credentialsInput, setCredentialsInput] = useState({});
  const [inputTouched, setInputTouched] = useState({});
  const [teamFolderTouched, setTeamFolderTouched] = useState(false);
  const [teamFolders, setTeamFolders] = useState([]);
  const [selectedTeamFolder, setSelectedTeamFolder] = useState('');
  const [teamFoldersLoading, setTeamFoldersLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    app: null,
    data: null,
    loading: false,
    credentials: null,
  });

  const targetUserId = userProfile._id;
  const role = userProfile.role;

  // App configurations with icons and colors
  const appConfigs = {
    github: {
      name: 'GitHub',
      icon: '/github_icon.png',
      color: '#333',
      bgColor: '#f6f8fa',
    },
    dropbox: {
      name: 'Dropbox',
      icon: '/dropbox_icon.png',
      color: '#0061fe',
      bgColor: '#f0f8ff',
    },
    slack: {
      name: 'Slack',
      icon: '/slack_icon.png',
      color: '#4a154b',
      bgColor: '#f8f0ff',
    },
    sentry: {
      name: 'Sentry',
      icon: '/sentry_icon.png',
      color: '#362d59',
      bgColor: '#f5f0ff',
    },
  };

  // Fetch access data and Dropbox team folders when modal opens
  useEffect(() => {
    if (isOpen && userProfile?._id) {
      fetchAccessData();
      fetchTeamFolders();
      setCredentialsInput({
        github: '',
        dropbox: userProfile.email || '',
        slack: userProfile.email || '',
        sentry: userProfile.email || '',
      });
      setInputTouched({});
    } else if (!isOpen) {
      setAccessData(null);
      setConfirmAction(null);
      setActionInProgress(false);
      setTeamFolders([]);
      setSelectedTeamFolder('');
      setTeamFolderTouched(false);
      setInviteLoading({});
      setRevokeLoading({});
      setDetailsModal({ isOpen: false, app: null, data: null, loading: false, credentials: null });
    }
  }, [isOpen, userProfile?._id]);

  // Close details modal if app status becomes invalid
  useEffect(() => {
    if (detailsModal.isOpen && detailsModal.app && accessData?.data?.apps) {
      const app = accessData.data.apps.find(a => a.app === detailsModal.app);
      if (!app || app.status !== 'invited') {
        setDetailsModal({
          isOpen: false,
          app: null,
          data: null,
          loading: false,
          credentials: null,
        });
      }
    }
  }, [accessData, detailsModal.isOpen, detailsModal.app]);

  const fetchAccessData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(ENDPOINTS.ACCESS_MANAGEMENT, {
        params: {
          userId: userProfile._id,
        },
      });
      setAccessData(response.data);
    } catch (error) {
      //console.error('Error fetching access data:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch access information';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamFolders = async () => {
    setTeamFoldersLoading(true);
    try {
      const response = await axios.get(ENDPOINTS.DROPBOX_TEAM_FOLDERS);
      setTeamFolders(response.data);
      // Set default Dropbox team folder
      const defaultFolder = response.data.find(folder => folder.isDefault);
      if (defaultFolder) {
        setSelectedTeamFolder(defaultFolder.key);
      }
    } catch (error) {
      // console.error('Error fetching Dropbox team folders:', error);
      toast.error('Failed to fetch Dropbox team folders');
      // Set empty array to prevent indefinite loading state
      setTeamFolders([]);
      setSelectedTeamFolder('');
    } finally {
      setTeamFoldersLoading(false);
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'invited':
        return <FontAwesomeIcon icon={faCheckCircle} className={styles.textSuccess} />;
      case 'revoked':
        return <FontAwesomeIcon icon={faTimesCircle} className={styles.textDanger} />;
      case 'failed':
        return <FontAwesomeIcon icon={faExclamationTriangle} className={styles.textDanger} />;
      case 'none':
      default:
        return <FontAwesomeIcon icon={faTimesCircle} className={styles.textMuted} />;
    }
  };

  const getStatusBadge = status => {
    const statusConfig = {
      invited: { color: 'success', text: 'Invited' },
      revoked: { color: 'danger', text: 'Revoked' },
      failed: { color: 'danger', text: 'Failed' },
      none: { color: 'secondary', text: 'No Access' },
    };

    const config = statusConfig[status] || statusConfig.none;
    return (
      <Badge color={config.color} className={styles.statusBadge}>
        {config.text}
      </Badge>
    );
  };

  const getAppStatus = appName => {
    if (!accessData?.found || !accessData?.data?.apps) {
      return 'none';
    }

    const app = accessData.data.apps.find(a => a.app === appName);
    if (!app) return 'none';

    return app.status || 'none';
  };

  // Update credential input
  const handleCredentialChange = (app, value) => {
    setCredentialsInput(prev => ({ ...prev, [app]: value }));
    setInputTouched(prev => ({ ...prev, [app]: true }));
  };

  // Get apps that can be invited (no access and valid credentials)
  const getInvitableApps = () => {
    return Object.keys(appConfigs).filter(appName => {
      const status = getAppStatus(appName);
      const credential = credentialsInput[appName]?.trim() || '';

      // Allow invitations for users with 'none' status OR 'revoked' status (re-invitations)
      const canInvite = status === 'none' || status === 'revoked';

      // Basic validation: must be invitable status and have valid credentials
      const basicValidation = canInvite && credential.length > 0;

      // Additional validation for Dropbox: must have Dropbox team folder selected
      if (appName === 'dropbox') {
        const isValidTeamFolder = teamFolders.some(folder => folder.key === selectedTeamFolder);
        return basicValidation && isValidTeamFolder;
      }

      return basicValidation;
    });
  };

  // Get apps that can be revoked (active access)
  const getRevokableApps = () => {
    return Object.keys(appConfigs).filter(appName => {
      const status = getAppStatus(appName);
      return status === 'invited' && appName !== 'slack';
    });
  };

  // Handle invite all apps
  const handleInviteAll = async () => {
    const invitableApps = getInvitableApps();
    if (invitableApps.length === 0) {
      toast.warning('No apps available to invite. Please check credentials.');
      return;
    }

    setActionInProgress(true);
    try {
      const results = await Promise.allSettled(
        invitableApps.map(appName => handleInviteApp(appName)),
      );

      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error('Error in bulk invite:', error);
      const errorMessage = error.message || 'Unexpected error during bulk invite';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(false);
    }
  };

  // Fetch detailed information for a specific app
  const fetchAppDetails = async appName => {
    // Validate that we should fetch details for this app
    const app = accessData?.data?.apps?.find(a => a.app === appName);
    if (!app || app.status !== 'invited') {
      toast.error(`Cannot view details for ${appName} - app must be invited`);
      return;
    }

    setDetailsModal(prev => ({ ...prev, loading: true }));

    try {
      let endpoint;

      switch (appName) {
        case 'github':
          endpoint = `${ENDPOINTS.APIEndpoint()}/github/user-details`;
          break;
        case 'dropbox':
          endpoint = `${ENDPOINTS.APIEndpoint()}/dropbox/folder-details`;
          break;
        case 'sentry':
          endpoint = `${ENDPOINTS.APIEndpoint()}/sentry/user-details`;
          break;
        default:
          throw new Error(`Details not available for ${appName}`);
      }

      // Use POST request with targetUser in body (consistent with other API calls)
      // Note: requestor role is automatically injected by backend middleware from JWT token
      const response = await axios.post(endpoint, {
        targetUser: { targetUserId },
      });

      setDetailsModal(prev => ({ ...prev, data: response.data.data, loading: false }));
    } catch (error) {
      //console.error(`Error fetching ${appName} details:`, error);
      const errorMessage =
        error.response?.data?.message || error.message || `Failed to fetch ${appName} details`;
      toast.error(errorMessage);
      setDetailsModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle toggle details
  const handleToggleDetails = appName => {
    if (detailsModal.app === appName && detailsModal.isOpen) {
      // Hide details
      setDetailsModal({ isOpen: false, app: null, data: null, loading: false, credentials: null });
    } else {
      // Show details
      setDetailsModal({ isOpen: true, app: appName, data: null, loading: true, credentials: null });
      fetchAppDetails(appName);
    }
  };

  // Handle revoke all apps
  const handleRevokeAll = async () => {
    const revokableApps = getRevokableApps();
    if (revokableApps.length === 0) {
      toast.warning('No apps available to revoke access from.');
      return;
    }

    setActionInProgress(true);
    try {
      const results = await Promise.allSettled(
        revokableApps.map(appName => handleRevokeApp(appName)),
      );

      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error('Error in bulk revoke:', error.response);
      const errorMessage = error.message || 'Unexpected error during bulk revoke';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleInviteApp = async appName => {
    // Prevent multiple simultaneous requests
    if (inviteLoading[appName] || actionInProgress) {
      return;
    }

    setInviteLoading(prev => ({ ...prev, [appName]: true }));

    const credential = credentialsInput[appName]?.trim();
    const email = appName === 'github' ? undefined : credential;
    const username = appName === 'github' ? credential : undefined;

    try {
      let endpoint;
      let payload;
      switch (appName) {
        case 'github':
          endpoint = ENDPOINTS.GITHUB_ADD;
          payload = { username, targetUser: { targetUserId } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_CREATE_ADD;
          payload = {
            folderName: `${userProfile.firstName} ${userProfile.lastName}`,
            teamFolderKey: selectedTeamFolder,
            targetUser: { targetUserId, email },
          };
          break;
        case 'slack':
          endpoint = ENDPOINTS.SLACK_ADD;
          payload = { targetUser: { targetUserId, email } };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_ADD;
          payload = { targetUser: { targetUserId, email } };
          break;
        default:
          throw new Error('Unknown app');
      }
      await axios.post(endpoint, payload);
      toast.success(`${appConfigs[appName].name} invitation sent successfully`);
      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error(`Error inviting to ${appName}:`, error.response);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setInviteLoading(prev => ({ ...prev, [appName]: false }));
    }
  };

  const handleRevokeApp = async appName => {
    // Prevent multiple simultaneous requests
    if (revokeLoading[appName] || actionInProgress) {
      return;
    }

    setRevokeLoading(prev => ({ ...prev, [appName]: true }));

    try {
      let endpoint;
      let payload;

      switch (appName) {
        case 'github':
          endpoint = ENDPOINTS.GITHUB_REMOVE;
          payload = { targetUser: { targetUserId } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_DELETE;
          payload = {
            targetUser: { targetUserId },
          };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_REMOVE;
          payload = { targetUser: { targetUserId } };
          break;
        default:
          throw new Error('Unknown app');
      }

      await axios.delete(endpoint, { data: payload });
      toast.success(`${appConfigs[appName].name} access revoked successfully`);
      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error(`Error revoking ${appName}:`, error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to revoke access';
      toast.error(errorMessage);
    } finally {
      setRevokeLoading(prev => ({ ...prev, [appName]: false }));
    }
  };

  const renderAppCard = appName => {
    const config = appConfigs[appName];
    const status = getAppStatus(appName);
    const app = accessData?.data?.apps?.find(a => a.app === appName);
    const credentialValue = credentialsInput[appName] || '';
    const touched = inputTouched[appName];
    const isGithub = appName === 'github';
    const isDropbox = appName === 'dropbox';
    const isCredentialValid = credentialValue.trim().length > 0;
    const isInviteLoading = inviteLoading[appName] || false;
    const isRevokeLoading = revokeLoading[appName] || false;

    // App-specific validation
    const isInviteButtonDisabled = () => {
      if (isInviteLoading || isRevokeLoading) return true;
      if (!isCredentialValid) return true;
      if (isDropbox) {
        const isValidTeamFolder = teamFolders.some(folder => folder.key === selectedTeamFolder);
        return !isValidTeamFolder;
      }
      return false;
    };

    return (
      <div key={appName} className={styles.appCard}>
        <div className={styles.appCardContent}>
          <div className={styles.appHeader}>
            <div className={styles.appInfo}>
              <span
                className={styles.appIcon}
                style={{ display: 'inline-block', width: 32, height: 32, marginRight: 12 }}
              >
                <img
                  src={config.icon}
                  alt={config.name + ' icon'}
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
              </span>
              <div>
                <h6 className={styles.appName}>{config.name}</h6>
                <div className={styles.statusContainer}>
                  {getStatusIcon(status)}
                  {getStatusBadge(status)}
                </div>
              </div>
            </div>

            <div className={styles.actionContainer}>
              {status === 'invited' && (
                <div className={`${styles.textMuted} ${styles.small}`}>
                  Invited: {app?.invitedOn ? new Date(app.invitedOn).toLocaleDateString() : 'N/A'}
                </div>
              )}

              {(status === 'active' || status === 'invited') && appName !== 'slack' && (
                <Button
                  color="danger"
                  size="sm"
                  className={styles.btnAction}
                  onClick={() => setConfirmAction({ type: 'revoke', app: appName })}
                  disabled={isRevokeLoading || isInviteLoading}
                >
                  {isRevokeLoading ? (
                    <>
                      <Spinner size="sm" className={styles.mr1} />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserMinus} className={styles.mr1} />
                      Revoke
                    </>
                  )}
                </Button>
              )}

              {(status === 'active' || status === 'invited') && appName === 'slack' && (
                <div className={`${styles.textMuted} ${styles.small}`}>
                  <FontAwesomeIcon icon={faExclamationTriangle} className={styles.mr1} />
                  Manual removal required
                </div>
              )}

              {status === 'revoked' && (
                <div className={`${styles.textMuted} ${styles.small}`}>
                  Revoked: {app?.revokedOn ? new Date(app.revokedOn).toLocaleDateString() : 'N/A'}
                </div>
              )}

              {status === 'failed' && (
                <div className={`${styles.textDanger} ${styles.small}`}>
                  Failed: {app?.failedReason || 'Unknown error'}
                </div>
              )}
            </div>
          </div>

          {(status === 'none' || status === 'revoked') && (
            <div className={styles.inviteSection}>
              {isDropbox && !teamFoldersLoading && selectedTeamFolder && isCredentialValid && (
                <div className={`${styles.textInfo} ${styles.small} ${styles.mb2}`}>
                  <FontAwesomeIcon icon={faFolder} className={styles.folderIcon} />
                  <strong>User Folder Name:</strong> {userProfile?.firstName}{' '}
                  {userProfile?.lastName}
                </div>
              )}
              <div className={`${styles.inputGroup} ${styles.mb2}`}>
                <input
                  type="text"
                  className={`form-control ${styles.uniformInput}`}
                  placeholder={isGithub ? 'GitHub Username' : 'Email Address'}
                  value={credentialValue}
                  onChange={e => handleCredentialChange(appName, e.target.value)}
                  onBlur={() => setInputTouched(prev => ({ ...prev, [appName]: true }))}
                  required
                />
                {isDropbox && (
                  <select
                    className={`form-control ${styles.uniformInput} ${styles.ml2}`}
                    value={selectedTeamFolder}
                    onChange={e => {
                      setSelectedTeamFolder(e.target.value);
                      setTeamFolderTouched(true);
                    }}
                    onBlur={() => setTeamFolderTouched(true)}
                    disabled={teamFoldersLoading}
                  >
                    <option value="">
                      {teamFoldersLoading
                        ? 'Loading team folders...'
                        : 'Select Dropbox Team Folder'}
                    </option>
                    {!teamFoldersLoading &&
                      teamFolders.map(folder => (
                        <option key={folder.key} value={folder.key}>
                          {folder.name} {folder.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                  </select>
                )}
                <Button
                  color="primary"
                  size="sm"
                  className={`${styles.btnAction} ${styles.ml2}`}
                  onClick={() => handleInviteApp(appName)}
                  disabled={isInviteButtonDisabled()}
                >
                  {isInviteLoading ? (
                    <>
                      <Spinner size="sm" className={styles.mr1} />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} className={styles.mr1} />
                      Invite
                    </>
                  )}
                </Button>
              </div>

              {touched && !isCredentialValid && (
                <div className={`${styles.textDanger} ${styles.small}`}>
                  {isGithub ? 'GitHub username is required' : 'Email is required'}
                </div>
              )}

              {isDropbox && teamFoldersLoading && (
                <div className={`${styles.textInfo} ${styles.small} ${styles.mt1}`}>
                  <Spinner size="sm" className={styles.mr1} />
                  Loading Dropbox team folders...
                </div>
              )}

              {isDropbox &&
                !teamFoldersLoading &&
                (teamFolderTouched || (touched && isCredentialValid)) &&
                !selectedTeamFolder && (
                  <div className={`${styles.textDanger} ${styles.small}`}>
                    {teamFolders.length === 0
                      ? 'No team folders available. Please try refreshing the page.'
                      : 'Please select a Dropbox team folder'}
                  </div>
                )}
            </div>
          )}

          {status === 'revoked' && (
            <div className={`${styles.textWarning} ${styles.small} ${styles.mb1} ${styles.mt3}`}>
              <FontAwesomeIcon icon={faTimesCircle} className={styles.mr1} />
              Access previously revoked on{' '}
              {app?.revokedOn ? new Date(app.revokedOn).toLocaleDateString() : 'N/A'}. You can
              re-invite this user.
            </div>
          )}

          {app?.credentials && (
            <div
              className={`${styles.credentials} ${styles.dFlex} ${styles.justifyContentBetween} ${styles.alignItemsCenter}`}
            >
              <div>
                <strong className={darkMode ? 'text-light' : 'text-dark'}>
                  {(() => {
                    if (status === 'revoked') {
                      switch (appName) {
                        case 'github':
                          return 'GitHub Username (Revoked):';
                        case 'sentry':
                          return 'Email (Revoked):';
                        case 'dropbox':
                          return 'Folder ID (Revoked):';
                        case 'slack':
                          return 'Email (Revoked):';
                        default:
                          return 'Credentials (Revoked):';
                      }
                    } else {
                      switch (appName) {
                        case 'github':
                          return 'GitHub Username:';
                        case 'sentry':
                          return 'Email:';
                        case 'dropbox':
                          return 'Folder ID:';
                        case 'slack':
                          return 'Email:';
                        default:
                          return 'Credentials:';
                      }
                    }
                  })()}
                </strong>{' '}
                <span className={darkMode ? 'text-light' : 'text-dark'}>{app.credentials}</span>
              </div>
              {status === 'invited' && appName !== 'slack' && (
                <Button
                  color="info"
                  size="sm"
                  className={`${styles.btnDetails} ${styles.ml2}`}
                  onClick={() => handleToggleDetails(appName)}
                  title={`View ${appConfigs[appName].name} details`}
                >
                  {detailsModal.app === appName && detailsModal.isOpen ? 'Hide' : 'Show'} Details
                </Button>
              )}
            </div>
          )}

          {/* Inline Details Section - Only show for invited status */}
          {detailsModal.app === appName && detailsModal.isOpen && status === 'invited' && (
            <div className={`${styles.appDetailsSection} ${styles.mt2}`}>
              {detailsModal.loading ? (
                <div className={`${styles.textCenter} ${styles.py2}`}>
                  <Spinner size="sm" color="primary" className={styles.mr2} />
                  Loading details...
                </div>
              ) : detailsModal.data ? (
                <div className={styles.detailsContent}>
                  <h6 className={`${styles.detailsTitle} ${styles.mb2}`}>
                    <FontAwesomeIcon icon={faInfoCircle} className={styles.mr2} />
                    {appConfigs[appName].name} Details
                  </h6>
                  <div className={styles.detailsList}>
                    {Object.entries(detailsModal.data).map(([key, value]) => (
                      <div key={key} className={`${styles.detailRow} ${styles.mb1}`}>
                        <span className={styles.detailKey}>{key}:</span>
                        <span className={styles.detailValue}>
                          {value === null || value === undefined || value === ''
                            ? 'N/A'
                            : typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={`${styles.detailsActions} ${styles.mt2}`}>
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      onClick={() => fetchAppDetails(appName)}
                    >
                      <FontAwesomeIcon icon={faSync} className={styles.mr1} />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`${styles.textCenter} ${styles.py3} ${styles.textMuted}`}>
                  No details available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    const { type, app } = confirmAction;

    // Validate confirmAction structure
    if (
      !type ||
      (type !== 'invite-all' && type !== 'revoke-all' && type !== 'revoke' && type !== 'invite')
    ) {
      // console.error('Invalid confirmAction structure:', confirmAction);
      setConfirmAction(null);
      return null;
    }

    // Handle bulk actions
    if (type === 'invite-all') {
      const invitableApps = getInvitableApps();
      return (
        <Modal
          isOpen={!!confirmAction}
          toggle={() => setConfirmAction(null)}
          size="md"
          className={darkMode ? `text-light ${styles.darkMode}` : ''}
        >
          <ModalHeader
            toggle={() => setConfirmAction(null)}
            className={darkMode ? 'bg-space-cadet' : ''}
          >
            Confirm Invite All Access
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <div className={`${styles.dFlex} ${styles.alignItemsCenter} ${styles.mb3}`}>
              <FontAwesomeIcon
                icon={faUserPlus}
                className={`${styles.mr2} ${styles.textSuccess}`}
              />
              <span>
                Are you sure you want to invite{' '}
                <strong>
                  {userProfile?.firstName} {userProfile?.lastName}
                </strong>{' '}
                to all available applications?
              </span>
            </div>
            <div className="alert alert-info">
              <strong>Apps to be invited:</strong>
              <ul className={`${styles.mb0} ${styles.mt2}`}>
                {invitableApps.map(appName => (
                  <li key={appName}>
                    <strong>{appConfigs[appName].name}</strong> -{' '}
                    {appName === 'github' ? 'Username' : 'Email'}: {credentialsInput[appName]}
                    {appName === 'dropbox' && selectedTeamFolder && (
                      <div className={`${styles.textInfo} ${styles.small} ${styles.mt1}`}>
                        <FontAwesomeIcon icon={faFolder} className={styles.folderIcon} />
                        <strong>Team folder:</strong>{' '}
                        {teamFolders.find(f => f.key === selectedTeamFolder)?.name ||
                          selectedTeamFolder}
                        <br />
                        <FontAwesomeIcon icon={faFolder} className={styles.folderIcon} />
                        <strong>User folder:</strong> {userProfile?.firstName}{' '}
                        {userProfile?.lastName}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button
              color="success"
              onClick={() => {
                handleInviteAll();
                setConfirmAction(null);
              }}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Spinner size="sm" className={styles.mr2} />
                  Inviting All...
                </>
              ) : (
                'Yes, Invite All'
              )}
            </Button>
            <Button
              color="secondary"
              onClick={() => setConfirmAction(null)}
              disabled={actionInProgress}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );
    }

    if (type === 'revoke-all') {
      const revokableApps = getRevokableApps();
      return (
        <Modal
          isOpen={!!confirmAction}
          toggle={() => setConfirmAction(null)}
          size="md"
          className={darkMode ? `text-light ${styles.darkMode}` : ''}
        >
          <ModalHeader
            toggle={() => setConfirmAction(null)}
            className={darkMode ? 'bg-space-cadet' : ''}
          >
            Whoa Tiger!
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <div className="alert alert-danger">
              <strong>
                Whoa Tiger! Are you sure you want to do this? This action is not reversible.
              </strong>
            </div>
            <div className="alert alert-info">
              <strong>Apps to be revoked:</strong>
              <ul className={`${styles.mb0} ${styles.mt2}`}>
                {revokableApps.map(appName => (
                  <li key={appName}>
                    <strong>{appConfigs[appName].name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button
              color="danger"
              onClick={() => {
                handleRevokeAll();
                setConfirmAction(null);
              }}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Spinner size="sm" className={styles.mr2} />
                  Revoking All...
                </>
              ) : (
                "Yes, I'm sure"
              )}
            </Button>
            <Button
              color="secondary"
              onClick={() => setConfirmAction(null)}
              disabled={actionInProgress}
            >
              No, take me back!
            </Button>
          </ModalFooter>
        </Modal>
      );
    }

    // Handle individual app actions
    const config = appConfigs[app];

    return (
      <Modal
        isOpen={!!confirmAction}
        toggle={() => setConfirmAction(null)}
        size="md"
        className={darkMode ? `text-light ${styles.darkMode}` : ''}
      >
        <ModalHeader
          toggle={() => setConfirmAction(null)}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          {type === 'revoke' ? 'Whoa Tiger!' : 'Confirm Invite Access'}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {type === 'revoke' && (
            <>
              <div className="alert alert-danger">
                <strong>
                  Whoa Tiger! Are you sure you want to do this? This action is not reversible.
                </strong>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color={type === 'revoke' ? 'danger' : 'primary'}
            onClick={() => {
              if (type === 'revoke') {
                handleRevokeApp(app);
              } else {
                handleInviteApp(app);
              }
              setConfirmAction(null);
            }}
            disabled={actionInProgress}
          >
            {actionInProgress ? (
              <>
                <Spinner size="sm" className={styles.mr2} />
                {type === 'revoke' ? 'Revoking...' : 'Inviting...'}
              </>
            ) : type === 'revoke' ? (
              "Yes, I'm sure"
            ) : (
              `Yes, ${type} access`
            )}
          </Button>
          <Button
            color="secondary"
            onClick={() => setConfirmAction(null)}
            disabled={actionInProgress}
          >
            {type === 'revoke' ? 'No, take me back!' : 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  if (!isOpen) return null;

  // Only calculate these if we have accessData (not loading and data is available)
  const invitableApps = !loading && accessData ? getInvitableApps() : [];
  const revokableApps = !loading && accessData ? getRevokableApps() : [];

  // Check if any individual app operations are in progress
  const hasInviteLoading = Object.values(inviteLoading).some(loading => loading);
  const hasRevokeLoading = Object.values(revokeLoading).some(loading => loading);
  const anyAppLoading = hasInviteLoading || hasRevokeLoading;

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={onClose}
        size="lg"
        className={`${styles.accessManagementModal} ${
          darkMode ? `text-light ${styles.darkMode}` : ''
        }`}
      >
        <ModalHeader toggle={onClose} className={darkMode ? 'bg-space-cadet' : ''}>
          <div className={`${styles.dFlex} ${styles.alignItemsCenter}`}>
            <FontAwesomeIcon icon={faSync} className={styles.mr2} />
            Access Management
          </div>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spinner color="primary" />
              <div className={styles.mt2}>Loading access information...</div>
            </div>
          ) : (
            <div>
              <div className={styles.userInfo}>
                <h6>
                  Managing access for:{' '}
                  <strong>
                    {userProfile?.firstName} {userProfile?.lastName}
                  </strong>
                </h6>
                <p className={`${styles.textMuted} ${styles.mb0}`}>Email: {userProfile?.email}</p>
              </div>

              <div className={styles.mb3}>
                <h6>Application Access Status</h6>
                <p className={`${styles.textMuted} ${styles.small}`}>
                  {accessData?.found
                    ? 'User has access records. Manage their permissions below.'
                    : 'No access records found. You can invite this user to applications.'}
                </p>
              </div>

              <div className={styles.appsContainer}>
                {Object.keys(appConfigs).map(renderAppCard)}
              </div>

              {/* Bulk Action Buttons */}
              <div className={`${styles.dFlex} ${styles.mb3}`}>
                {invitableApps.length > 0 && (
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'invite-all', app: null })}
                    disabled={actionInProgress || anyAppLoading}
                    className={styles.mr3}
                  >
                    {actionInProgress ? (
                      <>
                        <Spinner size="sm" className={styles.mr1} />
                        Inviting All...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserPlus} className={styles.mr1} />
                        Invite All ({invitableApps.length})
                      </>
                    )}
                  </Button>
                )}
                {revokableApps.length > 0 && (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'revoke-all', app: null })}
                    disabled={actionInProgress || anyAppLoading}
                  >
                    {actionInProgress ? (
                      <>
                        <Spinner size="sm" className={styles.mr1} />
                        Revoking All...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserMinus} className={styles.mr1} />
                        Revoke All ({revokableApps.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={onClose}>
            Close
          </Button>
          {accessData?.found && (
            <Button
              color="outline-primary"
              onClick={fetchAccessData}
              disabled={loading || anyAppLoading}
            >
              <FontAwesomeIcon icon={faSync} className={styles.mr1} />
              Refresh
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {renderConfirmationModal()}
    </>
  );
};

export default AccessManagementModal;
