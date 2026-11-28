import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Alert,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { getGroups } from '~/services/studentGroupsService';
import styles from './AnnouncementModal.module.css';

const getBadgeClass = audience => {
  if (audience === 'students') return 'bg-primary';
  if (audience === 'educators') return 'bg-success';
  return 'bg-info';
};

const getSubmitButtonText = (isSubmitting, isEditing) => {
  if (isSubmitting) return 'Saving...';
  return isEditing ? 'Update' : 'Create';
};

const AnnouncementModal = ({ isOpen, toggle, announcement = null, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all',
  });
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupsStatus, setGroupsStatus] = useState('idle');
  const [groupRetry, setGroupRetry] = useState(0);
  const submitLock = useRef(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const isEditing = !!announcement;

  // Initialize form data when modal opens or announcement changes
  useEffect(() => {
    if (isOpen) {
      if (announcement) {
        setFormData({
          title: announcement.title || '',
          body: announcement.body || '',
          audience: announcement.audience || 'all',
        });
      } else {
        setFormData({
          title: '',
          body: '',
          audience: 'all',
        });
      }
      setGroupId(announcement?.groupId || '');
      setShowConfirmDiscard(false);
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [isOpen, announcement]);

  useEffect(() => {
    if (!isOpen || formData.audience !== 'students') return undefined;
    let cancelled = false;
    setGroupsStatus('loading');
    getGroups()
      .then(data => {
        if (!cancelled) {
          setGroups(data);
          setGroupsStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setGroupsStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, formData.audience, groupRetry]);

  // Track changes to detect unsaved modifications
  useEffect(() => {
    if (!isOpen) return;

    const originalData = announcement
      ? {
          title: announcement.title || '',
          body: announcement.body || '',
          audience: announcement.audience || 'all',
        }
      : {
          title: '',
          body: '',
          audience: 'all',
        };

    const hasChanges =
      formData.title !== originalData.title ||
      formData.body !== originalData.body ||
      formData.audience !== originalData.audience ||
      groupId !== (announcement?.groupId || '');

    setHasUnsavedChanges(hasChanges);
  }, [formData, announcement, isOpen, groupId]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Body validation
    if (!formData.body.trim()) {
      newErrors.body = 'Announcement body is required';
    } else if (formData.body.trim().length < 3) {
      newErrors.body = 'Announcement body must be at least 3 characters long';
    } else if (formData.body.trim().length > 2000) {
      newErrors.body = 'Announcement body must not exceed 2000 characters';
    }

    // Audience validation
    if (
      !['all', 'students', 'educators'].includes(formData.audience) &&
      formData.audience !== announcement?.audience
    ) {
      newErrors.audience = 'Please select a valid audience';
    }

    if (
      groupId &&
      groupId !== announcement?.groupId &&
      (groupsStatus !== 'ready' || !groups.some(group => group.id === groupId))
    ) {
      newErrors.groupId = 'Select an available Student Group.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (submitLock.current) return;
    if (field === 'audience' && value !== 'students') setGroupId('');
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLock.current) return;

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const announcementData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        audience: formData.audience,
      };
      // Omit unchanged targeting so editing text does not refresh the recipient snapshot.
      if (groupId !== (announcement?.groupId || '')) {
        announcementData.groupId = groupId || null;
      }

      if (onSave) {
        await onSave(announcementData);
      }

      setHasUnsavedChanges(false);
      toggle();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || error.message || 'Failed to save announcement.',
      });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitLock.current) return;
    if (hasUnsavedChanges) {
      setShowConfirmDiscard(true);
    } else {
      toggle();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmDiscard(false);
    setHasUnsavedChanges(false);
    toggle();
  };

  const handleCancelDiscard = () => {
    setShowConfirmDiscard(false);
  };

  const getCharacterCount = field => {
    const maxLengths = {
      title: 100,
      body: 2000,
    };
    const current = formData[field]?.length || 0;
    const max = maxLengths[field];
    return { current, max, remaining: max - current };
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={handleClose}
        size="lg"
        className={`${styles.announcementModal} ${darkMode ? 'dark-mode text-light' : ''}`}
        backdrop="static"
      >
        <ModalHeader toggle={handleClose} className={styles.modalHeader}>
          {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody className={styles.modalBody}>
            {errors.submit && (
              <Alert color="danger" className={styles.submitError}>
                <FaExclamationTriangle className="me-2" />
                {errors.submit}
              </Alert>
            )}

            <FormGroup>
              <Label for="announcementTitle" className={styles.fieldLabel}>
                Title <span className={styles.required}>*</span>
              </Label>
              <Input
                disabled={isSubmitting}
                type="text"
                id="announcementTitle"
                name="title"
                value={formData.title || ''}
                onChange={e => {
                  handleInputChange('title', e.target.value);
                }}
                invalid={!!errors.title}
                placeholder="Enter announcement title..."
                className={styles.titleInput}
                maxLength={100}
              />
              {errors.title && <FormFeedback>{errors.title}</FormFeedback>}
              <div className={styles.characterCount}>
                {getCharacterCount('title').current}/{getCharacterCount('title').max} characters
              </div>
            </FormGroup>

            <FormGroup>
              <Label for="announcementAudience" className={styles.fieldLabel}>
                Audience <span className={styles.required}>*</span>
              </Label>
              <Input
                disabled={isSubmitting}
                type="select"
                id="announcementAudience"
                value={formData.audience}
                onChange={e => handleInputChange('audience', e.target.value)}
                invalid={!!errors.audience}
                className={styles.audienceSelect}
              >
                {announcement?.audience === 'support' && <option value="support">support</option>}
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="educators">Educators Only</option>
              </Input>
              {errors.audience && <FormFeedback>{errors.audience}</FormFeedback>}
            </FormGroup>

            {formData.audience === 'students' && (
              <FormGroup>
                <Label for="announcementGroup" className={styles.fieldLabel}>
                  Student Group (optional)
                </Label>
                <Input
                  id="announcementGroup"
                  type="select"
                  className={styles.audienceSelect}
                  value={groupId}
                  disabled={isSubmitting || groupsStatus !== 'ready'}
                  onChange={e => setGroupId(e.target.value)}
                  invalid={!!errors.groupId}
                >
                  <option value="">All students</option>
                  {groupId && !groups.some(group => group.id === groupId) && (
                    <option value={groupId}>Existing group target</option>
                  )}
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Input>
                {errors.groupId && <FormFeedback>{errors.groupId}</FormFeedback>}
                {groupsStatus === 'loading' && <output>Loading groups…</output>}
                {groupsStatus === 'error' && (
                  <Alert color="danger">
                    Could not load groups.{' '}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setGroupRetry(value => value + 1)}
                    >
                      Retry groups
                    </button>
                  </Alert>
                )}
                {groupsStatus === 'ready' && groups.length === 0 && (
                  <p>
                    No Student Groups available. Broad Students Only announcements are still
                    available.
                  </p>
                )}
              </FormGroup>
            )}

            <FormGroup>
              <Label for="announcementBody" className={styles.fieldLabel}>
                Message <span className={styles.required}>*</span>
              </Label>
              <Input
                disabled={isSubmitting}
                type="textarea"
                id="announcementBody"
                name="body"
                value={formData.body || ''}
                onChange={e => {
                  handleInputChange('body', e.target.value);
                }}
                invalid={!!errors.body}
                placeholder="Enter your announcement message..."
                className={styles.bodyTextarea}
                rows={6}
                maxLength={2000}
              />
              {errors.body && <FormFeedback>{errors.body}</FormFeedback>}
              <div className={styles.characterCount}>
                {getCharacterCount('body').current}/{getCharacterCount('body').max} characters
              </div>
            </FormGroup>

            <div className={styles.previewSection}>
              <Label className={styles.fieldLabel}>Preview</Label>
              <div className={styles.previewCard}>
                <h6 className={styles.previewTitle}>{formData.title || 'Announcement Title'}</h6>
                <p className={styles.previewBody}>
                  {formData.body || 'Your announcement message will appear here...'}
                </p>
                <div className={styles.previewMeta}>
                  <span className={`badge ${getBadgeClass(formData.audience)}`}>
                    {formData.audience === 'all' ? 'Everyone' : formData.audience}
                  </span>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className={styles.modalFooter}>
            <Button
              type="button"
              color="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting}
              className={styles.saveButton}
            >
              <FaSave className="me-2" />
              {getSubmitButtonText(isSubmitting, isEditing)}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Discard Changes Confirmation Modal */}
      <Modal
        isOpen={showConfirmDiscard}
        toggle={handleCancelDiscard}
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader toggle={handleCancelDiscard}>
          <FaExclamationTriangle className="me-2 text-warning" />
          Unsaved Changes
        </ModalHeader>
        <ModalBody>You have unsaved changes. Are you sure you want to discard them?</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelDiscard}>
            Keep Editing
          </Button>
          <Button color="danger" onClick={handleConfirmDiscard}>
            Discard Changes
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

AnnouncementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  announcement: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    body: PropTypes.string,
    audience: PropTypes.string,
    groupId: PropTypes.string,
    author: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    name: PropTypes.string,
  }),
};

export default AnnouncementModal;
