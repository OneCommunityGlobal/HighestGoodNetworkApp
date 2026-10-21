import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '../../services/httpService';

const EMAIL_PATTERN = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

const normalizeEmail = email => email.trim().toLowerCase();

export default function JobApplicationEmailSettings({ isOpen, onClose, darkMode }) {
  const [recipients, setRecipients] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;

    setRecipients([]);
    setEmail('');
    setError('');
    setSuccess('');
    setLoadFailed(false);
    setLoading(true);

    httpService
      .get(ENDPOINTS.JOB_APPLICATION_EMAIL_RECIPIENTS)
      .then(({ data }) => {
        if (!active) return;

        if (!Array.isArray(data?.recipients)) {
          throw new Error('Invalid recipients response');
        }

        setRecipients(data.recipients);
      })
      .catch(() => {
        if (!active) return;

        setLoadFailed(true);
        setError('Unable to load recipients. Please close and reopen to try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  const addEmail = () => {
    const normalized = normalizeEmail(email);
    setSuccess('');

    if (!EMAIL_PATTERN.test(normalized)) {
      setError('Enter a valid email address.');
      return;
    }

    if (recipients.some(recipient => normalizeEmail(recipient) === normalized)) {
      setError('This email address is already listed.');
      return;
    }

    setRecipients(previous => [...previous, normalized]);
    setEmail('');
    setError('');
  };

  const removeEmail = recipient => {
    setRecipients(previous => previous.filter(value => value !== recipient));
    setSuccess('');
    setError('');
  };

  const saveRecipients = async () => {
    if (loading || saving || loadFailed) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await httpService.put(ENDPOINTS.JOB_APPLICATION_EMAIL_RECIPIENTS, {
        recipients,
      });

      setRecipients(Array.isArray(data?.recipients) ? data.recipients : recipients);
      setSuccess('Email recipients saved successfully.');
    } catch {
      setError('Unable to save recipients. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const busy = loading || saving;

  return (
    <Modal
      isOpen={isOpen}
      toggle={busy ? undefined : onClose}
      className={darkMode ? 'text-light hgn-themed-modal--dark' : 'hgn-themed-modal'}
      aria-label="Job Application Email Settings"
    >
      <ModalHeader
        toggle={busy ? undefined : onClose}
        className={darkMode ? 'bg-space-cadet text-white' : ''}
      >
        Job Application Email Settings
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue text-white' : ''}>
        <p>Manage the email addresses that receive new job application notifications.</p>

        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="alert alert-success">
            {success}
          </div>
        )}

        {loading ? (
          <p role="status">Loading recipients...</p>
        ) : loadFailed ? (
          <p>
            Recipient settings could not be loaded. No changes can be saved until they are loaded
            successfully.
          </p>
        ) : (
          <>
            <label htmlFor="job-application-recipient-email">Email address</label>

            <div className="d-flex mb-3">
              <input
                id="job-application-recipient-email"
                type="email"
                className="form-control mr-2"
                value={email}
                onChange={event => setEmail(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addEmail();
                  }
                }}
                disabled={busy}
                placeholder="name@example.com"
              />

              <Button color="secondary" type="button" onClick={addEmail} disabled={busy}>
                Add
              </Button>
            </div>

            {recipients.length === 0 ? (
              <p>No notification recipients configured.</p>
            ) : (
              <ul className="list-unstyled" aria-label="Notification recipients">
                {recipients.map(recipient => (
                  <li
                    key={recipient}
                    className="d-flex align-items-center justify-content-between mb-2"
                  >
                    <span className="text-break mr-2">{recipient}</span>

                    <Button
                      type="button"
                      color="danger"
                      outline
                      size="sm"
                      aria-label={`Remove ${recipient}`}
                      disabled={busy}
                      onClick={() => removeEmail(recipient)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue text-white' : ''}>
        <Button type="button" color="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>

        <Button
          type="button"
          color="primary"
          onClick={saveRecipients}
          disabled={busy || loadFailed}
        >
          {saving ? 'Saving...' : 'Save Recipients'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

JobApplicationEmailSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};
