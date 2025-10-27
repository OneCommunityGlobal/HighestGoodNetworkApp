import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import styles from './AssignAtomModal.module.css';
import {
  fetchAvailableAtoms,
  assignAtoms,
  selectAtom,
  deselectAtom,
  setNote,
  hideModal,
  clearForm,
} from '~/actions/educationPortal/atomActions';

const AssignAtomModal = ({
  // Redux state
  isModalOpen,
  studentId,
  studentName,
  availableAtoms,
  selectedAtoms,
  note,
  isLoadingAtoms,
  isSubmitting,
  submitError,
  darkMode,

  // Redux actions
  fetchAvailableAtoms,
  assignAtoms,
  selectAtom,
  deselectAtom,
  setNote,
  hideModal,
  clearForm,
}) => {
  const [localNote, setLocalNote] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync local note with Redux state
  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  // Load atoms when modal opens
  useEffect(() => {
    if (isModalOpen && availableAtoms.length === 0) {
      fetchAvailableAtoms();
    }
  }, [isModalOpen, availableAtoms.length, fetchAvailableAtoms]);

  const handleAtomToggle = useCallback(
    atomId => {
      if (selectedAtoms.includes(atomId)) {
        deselectAtom(atomId);
      } else {
        selectAtom(atomId);
      }
    },
    [selectedAtoms, selectAtom, deselectAtom],
  );

  const handleNoteChange = useCallback(
    e => {
      const value = e.target.value;
      if (value.length <= 500) {
        setLocalNote(value);
        setNote(value);
      }
    },
    [setNote],
  );

  const handleSubmit = useCallback(async () => {
    // Validation
    if (selectedAtoms.length === 0) {
      setValidationError('Please select at least one atom');
      return;
    }

    if (!studentId) {
      setValidationError('Student ID is required');
      return;
    }

    setValidationError('');

    try {
      await assignAtoms(studentId, selectedAtoms, localNote);
      hideModal();
    } catch (error) {
      // Error is handled by the action
      // console.error('Assignment failed:', error);
    }
  }, [selectedAtoms, localNote, studentId, assignAtoms, hideModal]);

  const handleCancel = useCallback(() => {
    if (selectedAtoms.length > 0 || localNote.trim()) {
      // eslint-disable-next-line no-alert
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        clearForm();
        hideModal();
      }
    } else {
      hideModal();
    }
  }, [selectedAtoms.length, localNote, clearForm, hideModal]);

  const handleClose = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  const getCharacterCountClass = () => {
    const count = localNote.length;
    if (count > 450) return styles.error;
    if (count > 400) return styles.warning;
    return '';
  };

  const isSubmitDisabled = isSubmitting || selectedAtoms.length === 0;

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={handleClose}
      className={`${styles.modal} ${darkMode ? 'dark-mode' : ''}`}
      size="lg"
    >
      <ModalHeader toggle={handleClose} className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Assign Atoms</h2>
      </ModalHeader>

      <ModalBody className={styles.modalContent}>
        {/* Student Information */}
        <div className={styles.studentInfo}>
          <div className={styles.studentLabel}>Student:</div>
          <div className={styles.studentName}>{studentName || 'Unknown Student'}</div>
        </div>

        {/* Associated Atoms */}
        <FormGroup className={styles.formGroup}>
          <Label className={styles.formLabel}>Associated Atoms:</Label>
          <div className={styles.dropdownContainer}>
            <Input
              type="select"
              multiple
              className={styles.dropdown}
              value={selectedAtoms}
              onChange={e => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                // Clear current selections and set new ones
                selectedAtoms.forEach(atomId => deselectAtom(atomId));
                values.forEach(atomId => selectAtom(atomId));
              }}
              disabled={isLoadingAtoms}
            >
              {isLoadingAtoms ? (
                <option>Loading atoms...</option>
              ) : (
                availableAtoms.map(atom => (
                  <option key={atom._id} value={atom._id}>
                    {atom.name || atom.title || atom.atomName}
                  </option>
                ))
              )}
            </Input>
          </div>

          {/* Selected Atoms Display */}
          {selectedAtoms.length > 0 && (
            <div className={styles.selectedItems}>
              {selectedAtoms.map(atomId => {
                const atom = availableAtoms.find(a => a._id === atomId);
                return (
                  <div key={atomId} className={styles.selectedItem}>
                    {atom?.name || atom?.title || atom?.atomName || 'Unknown Atom'}
                    <button
                      type="button"
                      className={styles.removeItem}
                      onClick={() => deselectAtom(atomId)}
                      aria-label={`Remove ${atom?.name || 'atom'}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </FormGroup>

        {/* Note Field */}
        <FormGroup className={styles.formGroup}>
          <Label className={styles.formLabel}>Note (Optional):</Label>
          <textarea
            className={styles.noteField}
            value={localNote}
            onChange={handleNoteChange}
            placeholder="Add an optional note about this badge assignment..."
            maxLength={500}
            rows={4}
          />
          <div className={`${styles.characterCount} ${getCharacterCountClass()}`}>
            {localNote.length}/500 characters
          </div>
        </FormGroup>

        {/* Error Messages */}
        {validationError && <div className={styles.errorMessage}>{validationError}</div>}

        {submitError && <div className={styles.errorMessage}>{submitError}</div>}
      </ModalBody>

      <ModalFooter className={styles.buttonGroup}>
        <Button
          color="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          color="success"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <span className={styles.loadingSpinner} />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

AssignAtomModal.propTypes = {
  // Redux state
  isModalOpen: PropTypes.bool.isRequired,
  studentId: PropTypes.string,
  studentName: PropTypes.string,
  availableAtoms: PropTypes.array.isRequired,
  selectedAtoms: PropTypes.array.isRequired,
  note: PropTypes.string.isRequired,
  isLoadingAtoms: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  submitError: PropTypes.string,
  darkMode: PropTypes.bool.isRequired,

  // Redux actions
  fetchAvailableAtoms: PropTypes.func.isRequired,
  assignAtoms: PropTypes.func.isRequired,
  selectAtom: PropTypes.func.isRequired,
  deselectAtom: PropTypes.func.isRequired,
  setNote: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  clearForm: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isModalOpen: state.atomBadge?.isModalOpen || false,
  studentId: state.atomBadge?.studentId,
  studentName: state.atomBadge?.studentName,
  availableAtoms: state.atomBadge?.availableAtoms || [],
  selectedAtoms: state.atomBadge?.selectedAtoms || [],
  note: state.atomBadge?.note || '',
  isLoadingAtoms: state.atomBadge?.isLoadingAtoms || false,
  isSubmitting: state.atomBadge?.isSubmitting || false,
  submitError: state.atomBadge?.submitError,
  darkMode: state.theme?.darkMode || false,
});

const mapDispatchToProps = {
  fetchAvailableAtoms,
  assignAtoms,
  selectAtom,
  deselectAtom,
  setNote,
  hideModal,
  clearForm,
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignAtomModal);
