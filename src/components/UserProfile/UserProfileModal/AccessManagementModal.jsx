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
} from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '../../../utils/URL';
import './AccessManagementModal.css';

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
    }
  }, [isOpen, userProfile?._id]);

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
      console.error('Error fetching Dropbox team folders:', error);
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
        return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
      case 'revoked':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
      case 'failed':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />;
      case 'none':
      default:
        return <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />;
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
      <Badge color={config.color} className="status-badge">
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
      const app = accessData?.data?.apps?.find(a => a.app === appName);
      // Don't allow inviting if user has been revoked (has revokedOn date)
      const hasBeenRevoked = app?.revokedOn;

      // Basic validation: must have 'none' status, credential, and not been revoked
      const basicValidation = status === 'none' && credential.length > 0 && !hasBeenRevoked;

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

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully invited to ${successCount} app${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to invite to ${failCount} app${failCount > 1 ? 's' : ''}`);
      }

      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error('Error in bulk invite:', error);
      const errorMessage = error.message || 'Unexpected error during bulk invite';
      toast.error(errorMessage);
    } finally {
      setActionInProgress(false);
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

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `Successfully revoked access from ${successCount} app${successCount > 1 ? 's' : ''}`,
        );
      }
      if (failCount > 0) {
        toast.error(`Failed to revoke access from ${failCount} app${failCount > 1 ? 's' : ''}`);
      }

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
          payload = { username, targetUser: { targetUserId, role } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_CREATE_ADD;
          payload = {
            folderPath: `${userProfile.firstName} ${userProfile.lastName}`,
            teamFolderKey: selectedTeamFolder,
            targetUser: { targetUserId, role, email },
          };
          break;
        case 'slack':
          endpoint = ENDPOINTS.SLACK_ADD;
          payload = { targetUser: { targetUserId, role, email } };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_ADD;
          payload = { targetUser: { targetUserId, role, email } };
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
          payload = { username, targetUser: { targetUserId, role } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_DELETE;
          payload = {
            targetUser: { targetUserId, role },
          };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_REMOVE;
          payload = { targetUser: { targetUserId, role } };
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
      <div key={appName} className="app-card">
        <div className="app-card-content">
          <div className="app-header">
            <div className="app-info">
              <span
                className="app-icon"
                style={{ display: 'inline-block', width: 32, height: 32, marginRight: 12 }}
              >
                <img
                  src={config.icon}
                  alt={config.name + ' icon'}
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
              </span>
              <div>
                <h6 className="app-name">{config.name}</h6>
                <div className="status-container">
                  {getStatusIcon(status)}
                  {getStatusBadge(status)}
                </div>
              </div>
            </div>

            <div className="action-container">
              {status === 'invited' && (
                <div className="text-muted small">
                  Invited: {app?.invitedOn ? new Date(app.invitedOn).toLocaleDateString() : 'N/A'}
                </div>
              )}

              {(status === 'active' || status === 'invited') && appName !== 'slack' && (
                <Button
                  color="danger"
                  size="sm"
                  className="btn-action"
                  onClick={() => setConfirmAction({ type: 'revoke', app: appName })}
                  disabled={isRevokeLoading || isInviteLoading}
                >
                  {isRevokeLoading ? (
                    <>
                      <Spinner size="sm" className="mr-1" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserMinus} className="mr-1" />
                      Revoke
                    </>
                  )}
                </Button>
              )}

              {(status === 'active' || status === 'invited') && appName === 'slack' && (
                <div className="text-muted small">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  Manual removal required
                </div>
              )}

              {status === 'revoked' && (
                <div className="text-muted small">
                  Revoked: {app?.revokedOn ? new Date(app.revokedOn).toLocaleDateString() : 'N/A'}
                </div>
              )}

              {status === 'failed' && (
                <div className="text-danger small">
                  Failed: {app?.failedReason || 'Unknown error'}
                </div>
              )}
            </div>
          </div>

          {status === 'none' && !app?.revokedOn && (
            <div className="invite-section">
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control uniform-input"
                  placeholder={isGithub ? 'GitHub Username' : 'Email Address'}
                  value={credentialValue}
                  onChange={e => handleCredentialChange(appName, e.target.value)}
                  onBlur={() => setInputTouched(prev => ({ ...prev, [appName]: true }))}
                  required
                />
                {isDropbox && (
                  <select
                    className="form-control uniform-input ml-2"
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
                  className="btn-action ml-2"
                  onClick={() => handleInviteApp(appName)}
                  disabled={isInviteButtonDisabled()}
                >
                  {isInviteLoading ? (
                    <>
                      <Spinner size="sm" className="mr-1" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>

              {touched && !isCredentialValid && (
                <div className="text-danger small">
                  {isGithub ? 'GitHub username is required' : 'Email is required'}
                </div>
              )}

              {isDropbox && teamFoldersLoading && (
                <div className="text-info small mt-1">
                  <Spinner size="sm" className="mr-1" />
                  Loading Dropbox team folders...
                </div>
              )}

              {isDropbox &&
                !teamFoldersLoading &&
                (teamFolderTouched || (touched && isCredentialValid)) &&
                !selectedTeamFolder && (
                  <div className="text-danger small">
                    {teamFolders.length === 0
                      ? 'No team folders available. Please try refreshing the page.'
                      : 'Please select a Dropbox team folder'}
                  </div>
                )}

              {isDropbox && !teamFoldersLoading && selectedTeamFolder && isCredentialValid && (
                <div className="text-info small mt-2">
                  <FontAwesomeIcon icon={faFolder} className="mr-1" />
                  <strong>User folder name to be created:</strong> {userProfile?.firstName}{' '}
                  {userProfile?.lastName}
                </div>
              )}
            </div>
          )}

          {status === 'none' && app?.revokedOn && (
            <div className="text-muted small">
              <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
              Access previously revoked
            </div>
          )}

          {app?.credentials && (
            <div className="credentials">
              <strong>Credentials:</strong> {app.credentials}
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
      console.error('Invalid confirmAction structure:', confirmAction);
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
          className={darkMode ? 'text-light dark-mode' : ''}
        >
          <ModalHeader
            toggle={() => setConfirmAction(null)}
            className={darkMode ? 'bg-space-cadet' : ''}
          >
            Confirm Invite All Access
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-success" />
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
              <ul className="mb-0 mt-2">
                {invitableApps.map(appName => (
                  <li key={appName}>
                    <strong>{appConfigs[appName].name}</strong> -{' '}
                    {appName === 'github' ? 'Username' : 'Email'}: {credentialsInput[appName]}
                    {appName === 'dropbox' && selectedTeamFolder && (
                      <div className="text-info small mt-1">
                        <FontAwesomeIcon icon={faFolder} className="mr-1" />
                        <strong>Team folder:</strong>{' '}
                        {teamFolders.find(f => f.key === selectedTeamFolder)?.name ||
                          selectedTeamFolder}
                        <br />
                        <FontAwesomeIcon icon={faFolder} className="mr-1" />
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
                  <Spinner size="sm" className="mr-2" />
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
          className={darkMode ? 'text-light dark-mode' : ''}
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
              <ul className="mb-0 mt-2">
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
                  <Spinner size="sm" className="mr-2" />
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
        className={darkMode ? 'text-light dark-mode' : ''}
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
                <Spinner size="sm" className="mr-2" />
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
        className={`access-management-modal ${darkMode ? 'text-light dark-mode' : ''}`}
      >
        <ModalHeader toggle={onClose} className={darkMode ? 'bg-space-cadet' : ''}>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faSync} className="mr-2" />
            Access Management
          </div>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {loading ? (
            <div className="loading-container">
              <Spinner color="primary" />
              <div className="mt-2">Loading access information...</div>
            </div>
          ) : (
            <div>
              <div className="user-info">
                <h6>
                  Managing access for:{' '}
                  <strong>
                    {userProfile?.firstName} {userProfile?.lastName}
                  </strong>
                </h6>
                <p className="text-muted mb-0">Email: {userProfile?.email}</p>
              </div>

              <div className="mb-3">
                <h6>Application Access Status</h6>
                <p className="text-muted small">
                  {accessData?.found
                    ? 'User has access records. Manage their permissions below.'
                    : 'No access records found. You can invite this user to applications.'}
                </p>
              </div>

              <div className="apps-container">{Object.keys(appConfigs).map(renderAppCard)}</div>

              {/* Bulk Action Buttons */}
              <div className="d-flex mb-3">
                {invitableApps.length > 0 && (
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'invite-all', app: null })}
                    disabled={actionInProgress || anyAppLoading}
                    className="mr-3"
                  >
                    {actionInProgress ? (
                      <>
                        <Spinner size="sm" className="mr-1" />
                        Inviting All...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
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
                        <Spinner size="sm" className="mr-1" />
                        Revoking All...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserMinus} className="mr-1" />
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
              <FontAwesomeIcon icon={faSync} className="mr-1" />
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
