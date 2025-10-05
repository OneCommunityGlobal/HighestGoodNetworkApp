import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import {
  resendBlueSquareEmails,
  resendWeeklySummaryEmails,
} from '../../actions/blueSquareEmailActions';
import './BlueSquareEmailManagement.css';

const BlueSquareEmailManagement = ({
  auth,
  darkMode,
  resendBlueSquareEmails,
  resendWeeklySummaryEmails,
}) => {
  const [blueSquareModalOpen, setBlueSquareModalOpen] = useState(false);
  const [weeklySummaryModalOpen, setWeeklySummaryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has the required permission
  const userPermissions = auth.user?.permissions?.frontPermissions || [];
  const hasEmailPermission = userPermissions.includes('resendBlueSquareAndSummaryEmails');

  const handleBlueSquareResend = async () => {
    setIsLoading(true);
    setBlueSquareModalOpen(false);

    try {
      await resendBlueSquareEmails();
    } catch (error) {
      // Error is already handled in the action
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeeklySummaryResend = async () => {
    setIsLoading(true);
    setWeeklySummaryModalOpen(false);

    try {
      await resendWeeklySummaryEmails();
    } catch (error) {
      // Error is already handled in the action
    } finally {
      setIsLoading(false);
    }
  };

  // If user doesn't have permission, show access denied
  if (!hasEmailPermission) {
    return (
      <div
        className={darkMode ? 'bg-oxford-blue' : ''}
        style={{
          padding: '5px 20px',
          minHeight: '100%',
        }}
      >
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div
              className="card text-center"
              style={darkMode ? { backgroundColor: '#2d2d2d', borderColor: '#444' } : {}}
            >
              <div className="card-body">
                <h4 className="card-title">Access Denied</h4>
                <p className="card-text">
                  You do not have permission to access this page. Please contact an administrator if
                  you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={darkMode ? 'bg-oxford-blue' : ''}
      style={{
        padding: '5px 20px',
        minHeight: '100%',
      }}
    >
      <div className="row">
        <div className="col-md-6 mb-3">
          <div
            className="card h-100"
            style={darkMode ? { backgroundColor: '#2d2d2d', borderColor: '#444' } : {}}
          >
            <div className="card-body d-flex flex-column">
              <h5 className={`card-title mb-3 ${darkMode ? 'text-light' : ''}`}>
                Resend Blue Square Emails
              </h5>
              <p className={`card-text mb-3 flex-grow-1 ${darkMode ? 'text-light' : ''}`}>
                Triggers resend of Blue Square emails for users with last week&apos;s infringements.
                Emails will be sent to affected users and BCC list.
              </p>
              <button
                className="btn btn-warning mt-auto"
                onClick={() => setBlueSquareModalOpen(true)}
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Processing...
                  </>
                ) : (
                  <>Resend Blue Square Emails</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div
            className="card h-100"
            style={darkMode ? { backgroundColor: '#2d2d2d', borderColor: '#444' } : {}}
          >
            <div className="card-body d-flex flex-column">
              <h5 className={`card-title mb-3 ${darkMode ? 'text-light' : ''}`}>
                <i className="fas fa-chart-bar text-info me-2"></i>
                Resend Weekly Summary Email
              </h5>
              <p className={`card-text mb-3 flex-grow-1 ${darkMode ? 'text-light' : ''}`}>
                Resends the admin report showing weekly summaries and missed entries. This will be
                sent to all admin recipients.
              </p>
              <button
                className="btn btn-info mt-auto"
                onClick={() => setWeeklySummaryModalOpen(true)}
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-alt me-2"></i>
                    Resend Weekly Summary Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Square Email Confirmation Modal */}
      <Modal isOpen={blueSquareModalOpen} toggle={() => setBlueSquareModalOpen(false)}>
        <ModalHeader toggle={() => setBlueSquareModalOpen(false)}>
          Confirm Blue Square Email Resend
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to resend Blue Square emails for last week&apos;s infringements?
          </p>
          <p className="text-muted">
            <strong>This will:</strong>
          </p>
          <ul className="text-muted" style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li>Send emails to all users with infringements from last week</li>
            <li>Include all emails in the BCC list</li>
          </ul>
          <p className="text-info">This action can be safely repeated if needed.</p>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={() => setBlueSquareModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-warning" onClick={handleBlueSquareResend}>
            Resend Emails
          </button>
        </ModalFooter>
      </Modal>

      {/* Weekly Summary Email Confirmation Modal */}
      <Modal isOpen={weeklySummaryModalOpen} toggle={() => setWeeklySummaryModalOpen(false)}>
        <ModalHeader toggle={() => setWeeklySummaryModalOpen(false)}>
          <i className="fas fa-chart-bar text-info me-2"></i>
          Confirm Weekly Summary Email Resend
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to trigger resend of last week&apos;s summary report to all admin
            recipients?
          </p>
          <p className="text-muted">
            <strong>This will:</strong>
          </p>
          <ul className="text-muted" style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li>Send the weekly summary report to all configured recipients</li>
            <li>Include missed entries and weekly summaries</li>
          </ul>
          <p className="text-info">This action can be safely repeated if needed.</p>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={() => setWeeklySummaryModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-info" onClick={handleWeeklySummaryResend}>
            <i className="fas fa-file-alt me-2"></i>
            Resend Summary
          </button>
        </ModalFooter>
      </Modal>

      <ReactTooltip html={true} />
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  resendBlueSquareEmails: () => dispatch(resendBlueSquareEmails()),
  resendWeeklySummaryEmails: () => dispatch(resendWeeklySummaryEmails()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BlueSquareEmailManagement);
