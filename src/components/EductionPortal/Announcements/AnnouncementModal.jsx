import React, { useState, useEffect } from 'react';
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
  Alert
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import styles from './AnnouncementModal.module.css';

const AnnouncementModal = ({
  isOpen,
  toggle,
  announcement = null,
  onSave,
  userInfo = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all'
  });
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
          audience: announcement.audience || 'all'
        });
      } else {
        setFormData({
          title: '',
          body: '',
          audience: 'all'
        });
      }
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [isOpen, announcement]);

  // Track changes to detect unsaved modifications
  useEffect(() => {
    if (!isOpen) return;
    
    const originalData = announcement ? {
      title: announcement.title || '',
      body: announcement.body || '',
      audience: announcement.audience || 'all'
    } : {
      title: '',
      body: '',
      audience: 'all'
    };

    const hasChanges = 
      formData.title !== originalData.title ||
      formData.body !== originalData.body ||
      formData.audience !== originalData.audience;

    setHasUnsavedChanges(hasChanges);
  }, [formData, announcement, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    console.log('Validating form with data:', formData);

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      console.log('Title error: Title is required');
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
      console.log('Title error: Too short');
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
      console.log('Title error: Too long');
    }

    // Body validation
    if (!formData.body.trim()) {
      newErrors.body = 'Announcement body is required';
      console.log('Body error: Body is required');
    } else if (formData.body.trim().length < 3) {
      newErrors.body = 'Announcement body must be at least 3 characters long';
      console.log('Body error: Too short');
    } else if (formData.body.trim().length > 2000) {
      newErrors.body = 'Announcement body must not exceed 2000 characters';
      console.log('Body error: Too long');
    }

    // Audience validation
    if (!['all', 'students', 'educators'].includes(formData.audience)) {
      newErrors.audience = 'Please select a valid audience';
      console.log('Audience error: Invalid audience');
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted, current formData:', formData);
    console.log('Current errors:', errors);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed, errors:', errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const announcementData = {
        ...formData,
        title: formData.title.trim(),
        body: formData.body.trim(),
        author: userInfo?.name || 'Unknown',
        ...(isEditing && { id: announcement.id }),
        ...(isEditing && { updatedAt: new Date().toISOString() }),
        ...(!isEditing && { 
          createdAt: new Date().toISOString(),
          isNew: true 
        })
      };

      console.log('Saving announcement data:', announcementData);

      if (onSave) {
        await onSave(announcementData);
      }
      
      setHasUnsavedChanges(false);
      toggle();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setErrors({ submit: 'Failed to save announcement. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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

  const getCharacterCount = (field) => {
    const maxLengths = {
      title: 100,
      body: 2000
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
                type="text"
                id="announcementTitle"
                name="title"
                value={formData.title || ''}
                onChange={(e) => {
                  console.log('Title changed:', e.target.value);
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
                type="select"
                id="announcementAudience"
                value={formData.audience}
                onChange={(e) => handleInputChange('audience', e.target.value)}
                invalid={!!errors.audience}
                className={styles.audienceSelect}
              >
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="educators">Educators Only</option>
              </Input>
              {errors.audience && <FormFeedback>{errors.audience}</FormFeedback>}
            </FormGroup>

            <FormGroup>
              <Label for="announcementBody" className={styles.fieldLabel}>
                Message <span className={styles.required}>*</span>
              </Label>
              <Input
                type="textarea"
                id="announcementBody"
                name="body"
                value={formData.body || ''}
                onChange={(e) => {
                  console.log('Body changed:', e.target.value);
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
                <h6 className={styles.previewTitle}>
                  {formData.title || 'Announcement Title'}
                </h6>
                <p className={styles.previewBody}>
                  {formData.body || 'Your announcement message will appear here...'}
                </p>
                <div className={styles.previewMeta}>
                  <span className={`badge ${
                    formData.audience === 'students' ? 'bg-primary' :
                    formData.audience === 'educators' ? 'bg-success' : 'bg-info'
                  }`}>
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
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className={styles.saveButton}
            >
              <FaSave className="me-2" />
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
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
        <ModalBody>
          You have unsaved changes. Are you sure you want to discard them?
        </ModalBody>
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

export default AnnouncementModal;