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
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '../../../utils/URL';
import './AccessManagementModal.css';

const AccessManagementModal = ({
  isOpen,
  onClose,
  userProfile,
  darkMode = false,
}) => {
  const [accessData, setAccessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [credentialsInput, setCredentialsInput] = useState({});
  const [inputTouched, setInputTouched] = useState({});
  
  const requestorId = userProfile._id;
  const role = userProfile.role;

  // App configurations with icons and colors
  const appConfigs = {
    github: {
      name: 'GitHub',
      icon: '/github_icon.png',
      color: '#333',
      bgColor: '#f6f8fa'
    },
    dropbox: {
      name: 'Dropbox',
      icon: '/dropbox_icon.png',
      color: '#0061fe',
      bgColor: '#f0f8ff'
    },
    slack: {
      name: 'Slack',
      icon: '/slack_icon.png',
      color: '#4a154b',
      bgColor: '#f8f0ff'
    },
    sentry: {
      name: 'Sentry',
      icon: '/sentry_icon.png',
      color: '#362d59',
      bgColor: '#f5f0ff'
    }
  };

  // Fetch access data when modal opens
  useEffect(() => {
    if (isOpen && userProfile?._id) {
      fetchAccessData();
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
    }
  }, [isOpen, userProfile?._id, userProfile]);

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
      console.error('Error fetching access data:', error);
      toast.error('Failed to fetch access information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      invited: { color: 'success', text: 'Invited' },
      revoked: { color: 'danger', text: 'Revoked' },
      failed: { color: 'danger', text: 'Failed' },
      none: { color: 'secondary', text: 'No Access' }
    };
    
    const config = statusConfig[status] || statusConfig.none;
    return <Badge color={config.color} className="status-badge">{config.text}</Badge>;
  };

  const getAppStatus = (appName) => {
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
      return status === 'none' && credential.length > 0 && !hasBeenRevoked;
    });
  };

  // Get apps that can be revoked (active access)
  const getRevokableApps = () => {
    return Object.keys(appConfigs).filter(appName => {
      const status = getAppStatus(appName);
      return (status === 'invited') && appName !== 'slack';
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
        invitableApps.map(appName => handleInviteApp(appName))
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
      toast.error('Unexpected error during bulk invite');
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
        revokableApps.map(appName => handleRevokeApp(appName))
      );
      
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast.success(`Successfully revoked access from ${successCount} app${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to revoke access from ${failCount} app${failCount > 1 ? 's' : ''}`);
      }
      
      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error('Error in bulk revoke:', error.response);
      toast.error('Unexpected error during bulk revoke');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleInviteApp = async (appName) => {
    setActionInProgress(true);

    const credential = credentialsInput[appName]?.trim();
    const email = appName === 'github' ? undefined : credential;
    const username = appName === 'github' ? credential : undefined;
    try {
      let endpoint;
      let payload;
      switch (appName) {
        case 'github':
          endpoint = ENDPOINTS.GITHUB_ADD;
          payload = { username, requestor: { requestorId, role } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_CREATE_ADD;
          payload = { 
            // folderPath: `/${userProfile.firstName}${userProfile.lastName}`,
            folderPath: 'TestDropboxAPI',
            email, 
            requestor: { requestorId, role } 
          };
          break;
        case 'slack':
          endpoint = ENDPOINTS.SLACK_ADD;
          payload = { email, requestor: { requestorId, role } };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_ADD;
          payload = { email, requestor: { requestorId, role } };
          break;
        default:
          throw new Error('Unknown app');
      }
      await axios.post(endpoint, payload);
      toast.success(`${appConfigs[appName].name} invitation sent successfully`);
      await fetchAccessData(); // Refresh data
    } catch (error) {
      // console.error(`Error inviting to ${appName}:`, error.response);
      toast.error(error.response.data.error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRevokeApp = async (appName) => {
    setActionInProgress(true);
    const email = accessData?.data?.apps?.find(a => a.app === 'sentry')?.credentials || '';
    const username = accessData?.data?.apps?.find(a => a.app === 'github')?.credentials || '';
    
    try {
      let endpoint;
      let payload;
      
      switch (appName) {
        case 'github':
          endpoint = ENDPOINTS.GITHUB_REMOVE;
          payload = { username, requestor: { requestorId, role } };
          break;
        case 'dropbox':
          endpoint = ENDPOINTS.DROPBOX_DELETE;
          payload = { 
            // folderPath: `${userProfile.firstName}${userProfile.lastName}`,
            folderPath: 'TestDropboxAPI',
            requestor: { requestorId, role } 
          };
          break;
        case 'sentry':
          endpoint = ENDPOINTS.SENTRY_REMOVE;
          payload = { email, requestor: { requestorId, role } };
          break;
        default:
          throw new Error('Unknown app');
      }
      
      await axios.delete(endpoint, { data: payload });
      toast.success(`${appConfigs[appName].name} access revoked successfully`);
      await fetchAccessData(); // Refresh data
    } catch (error) {
      //console.error(`Error revoking ${appName}:`, error);
      toast.error(error.response.data.error);
    } finally {
      setActionInProgress(false);
    }
  };

  const renderAppCard = (appName) => {
    const config = appConfigs[appName];
    const status = getAppStatus(appName);
    const app = accessData?.data?.apps?.find(a => a.app === appName);
    const credentialValue = credentialsInput[appName] || '';
    const touched = inputTouched[appName];
    const isGithub = appName === 'github';
    const isCredentialValid = credentialValue.trim().length > 0;
    return (
      <div 
        key={appName}
        className="app-card"
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span
              as={"span"}
              className="app-icon"
              style={{ display: 'inline-block', width: 32, height: 32, marginRight: 12 }}
            >
              <img src={config.icon} alt={config.name + ' icon'} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </span>
            <div>
              <h6 className="app-name">
                {config.name}
              </h6>
              <div className="status-container">
                {getStatusIcon(status)}
                {getStatusBadge(status)}
              </div>
            </div>
          </div>
          
          <div className="action-container">
            {status === 'none' && !app?.revokedOn && (
              <>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: isGithub ? 160 : 220, marginRight: 8 }}
                  placeholder={isGithub ? 'GitHub Username (required)' : 'Email (required)'}
                  value={credentialValue}
                  onChange={e => handleCredentialChange(appName, e.target.value)}
                  onBlur={() => setInputTouched(prev => ({ ...prev, [appName]: true }))}
                  required
                />
                <Button
                  color="primary"
                  size="sm"
                  className="btn-action"
                  onClick={() => handleInviteApp(appName)}
                  disabled={actionInProgress || !isCredentialValid}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                  Invite
                </Button>
              </>
            )}
            
            {status === 'none' && app?.revokedOn && (
              <div className="text-muted small">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                Access previously revoked
              </div>
            )}
            
            {status === 'none' && !app?.revokedOn && touched && !isCredentialValid && (
              <div className="text-danger small" style={{ marginLeft: 8 }}>
                {isGithub ? 'GitHub username is required' : 'Email is required'}
              </div>
            )}
            
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
                disabled={actionInProgress}
              >
                <FontAwesomeIcon icon={faUserMinus} className="mr-1" />
                Revoke
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
        
        {app?.credentials && (
          <div className="credentials">
            <strong>Credentials:</strong> {app.credentials}
          </div>
        )}
      </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!confirmAction) return null;
    
    const { type, app } = confirmAction;
    
    // Handle bulk actions
    if (type === 'invite-all') {
      const invitableApps = getInvitableApps();
      return (
        <Modal isOpen={!!confirmAction} toggle={() => setConfirmAction(null)} size="md" className={darkMode ? 'text-light dark-mode' : ''}>
          <ModalHeader toggle={() => setConfirmAction(null)} className={darkMode ? 'bg-space-cadet' : ''}>
            Confirm Invite All Access
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-success" />
              <span>
                Are you sure you want to invite <strong>{userProfile?.firstName} {userProfile?.lastName}</strong> to all available applications?
              </span>
            </div>
            <div className="alert alert-info">
              <strong>Apps to be invited:</strong>
              <ul className="mb-0 mt-2">
                {invitableApps.map(appName => (
                  <li key={appName}>
                    <strong>{appConfigs[appName].name}</strong> - {appName === 'github' ? 'Username' : 'Email'}: {credentialsInput[appName]}
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
            <Button color="secondary" onClick={() => setConfirmAction(null)} disabled={actionInProgress}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );
    }
    
    if (type === 'revoke-all') {
      const revokableApps = getRevokableApps();
      return (
        <Modal isOpen={!!confirmAction} toggle={() => setConfirmAction(null)} size="md" className={darkMode ? 'text-light dark-mode' : ''}>
          <ModalHeader toggle={() => setConfirmAction(null)} className={darkMode ? 'bg-space-cadet' : ''}>
            Whoa Tiger!
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <div className="alert alert-danger">
              <strong>Whoa Tiger! Are you sure you want to do this? This action is not reversible.</strong>
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
            <Button color="secondary" onClick={() => setConfirmAction(null)} disabled={actionInProgress}>
              No, take me back!
            </Button>
          </ModalFooter>
        </Modal>
      );
    }
    
    // Handle individual app actions
    const config = appConfigs[app];
    
    return (
      <Modal isOpen={!!confirmAction} toggle={() => setConfirmAction(null)} size="md" className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader toggle={() => setConfirmAction(null)} className={darkMode ? 'bg-space-cadet' : ''}>
          {type === 'revoke' ? 'Whoa Tiger!' : 'Confirm Invite Access'}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {type === 'revoke' && (
            <>
              <div className="alert alert-danger">
                <strong>Whoa Tiger! Are you sure you want to do this? This action is not reversible.</strong>
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
            ) : (
              type === 'revoke' ? "Yes, I'm sure" : `Yes, ${type} access`
            )}
          </Button>
          <Button color="secondary" onClick={() => setConfirmAction(null)} disabled={actionInProgress}>
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

  return (
    <>
      <Modal isOpen={isOpen} toggle={onClose} size="lg" className={`access-management-modal ${darkMode ? 'text-light dark-mode' : ''}`}>
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
                <h6>Managing access for: <strong>{userProfile?.firstName} {userProfile?.lastName}</strong></h6>
                <p className="text-muted mb-0">Email: {userProfile?.email}</p>
              </div>
              
              <div className="mb-3">
                <h6>Application Access Status</h6>
                <p className="text-muted small">
                  {accessData?.found 
                    ? 'User has access records. Manage their permissions below.'
                    : 'No access records found. You can invite this user to applications.'
                  }
                </p>
              </div>
              
              <div className="apps-container">
                {Object.keys(appConfigs).map(renderAppCard)}
              </div>

              {/* Bulk Action Buttons */}
              <div className="d-flex mb-3">
                {invitableApps.length > 0 && (
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'invite-all', app: null })}
                    disabled={actionInProgress}
                    className="mr-3"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                    Invite All ({invitableApps.length})
                  </Button>
                )}
                {revokableApps.length > 0 && (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'revoke-all', app: null })}
                    disabled={actionInProgress}
                  >
                    <FontAwesomeIcon icon={faUserMinus} className="mr-1" />
                    Revoke All ({revokableApps.length})
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
              disabled={loading}
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