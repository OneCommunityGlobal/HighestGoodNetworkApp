import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dropdown,
  Table,
  CustomInput,
} from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
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

  // Student search state
  const [searchText, setSearchText] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const userSearchRef = useRef();

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

  // Load users when modal opens
  useEffect(() => {
    if (isModalOpen && allUsers.length === 0) {
      fetchAllUsers();
    }
  }, [isModalOpen, allUsers.length]);

  // Set selected student when studentId changes
  useEffect(() => {
    if (studentId && studentName) {
      setSelectedStudent({ _id: studentId, name: studentName });
      setSearchText(studentName);
    }
  }, [studentId, studentName]);

  // Fetch all users for search
  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(`${ENDPOINTS.APIEndpoint()}/userprofile`);
      setAllUsers(response.data);
    } catch (error) {
      // Handle error silently or show toast
      // console.error('Failed to fetch users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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

  // Student selection handlers
  const handleStudentSelect = user => {
    setSelectedStudent(user);
    setSearchText(`${user.firstName} ${user.lastName}`);
    setIsUserDropdownOpen(false);
    setIsInputFocus(false);
  };

  const handleSearchChange = value => {
    setSearchText(value);
    setIsUserDropdownOpen(true);
  };

  const handleSubmit = useCallback(async () => {
    // Validation
    if (selectedAtoms.length === 0) {
      setValidationError('Please select at least one atom');
      return;
    }

    if (!selectedStudent) {
      setValidationError('Please select a student');
      return;
    }

    setValidationError('');

    try {
      await assignAtoms(selectedStudent._id, selectedAtoms, localNote);
      hideModal();
    } catch (error) {
      // Error is handled by the action
      // console.error('Assignment failed:', error);
    }
  }, [selectedAtoms, localNote, selectedStudent, assignAtoms, hideModal]);

  const handleCancel = useCallback(() => {
    if (selectedAtoms.length > 0 || localNote.trim() || selectedStudent) {
      // eslint-disable-next-line no-alert
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        clearForm();
        setSelectedStudent(null);
        setSearchText('');
        hideModal();
      }
    } else {
      hideModal();
    }
  }, [selectedAtoms.length, localNote, selectedStudent, clearForm, hideModal]);

  // Filter users based on search text
  const filteredUsers = allUsers.filter(user => {
    if (!searchText.trim()) return false;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const searchLower = searchText.toLowerCase();
    return (
      (user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower)) &&
      user.isActive
    );
  });

  const handleClose = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  const getCharacterCountClass = () => {
    const count = localNote.length;
    if (count > 450) return styles.error;
    if (count > 400) return styles.warning;
    return '';
  };

  const isSubmitDisabled = isSubmitting || selectedAtoms.length === 0 || !selectedStudent;

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
        {/* Student Selection */}
        <FormGroup className={styles.formGroup}>
          <Label className={styles.formLabel}>Select Student:</Label>
          <div className={styles.studentSearchContainer}>
            <Dropdown
              isOpen={isUserDropdownOpen}
              toggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              style={{ width: '100%', marginRight: '5px' }}
            >
              <Input
                type="search"
                value={searchText}
                innerRef={userSearchRef}
                onFocus={() => {
                  setIsInputFocus(true);
                  setIsUserDropdownOpen(true);
                }}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search for a student..."
                className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
                autoComplete="off"
                name="student-search"
              />
              {isInputFocus || (searchText !== '' && allUsers && allUsers.length > 0) ? (
                <div
                  tabIndex="-1"
                  role="menu"
                  aria-hidden="false"
                  className={`dropdown-menu${
                    isUserDropdownOpen ? ' show dropdown__user-perms' : ''
                  } ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
                  style={{ marginTop: '0px', width: '100%' }}
                >
                  {isLoadingUsers ? (
                    <div className="user__auto-complete">Loading users...</div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        className="user__auto-complete"
                        key={user._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleStudentSelect(user)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleStudentSelect(user);
                          }
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </div>
                    ))
                  ) : (
                    <div className="user__auto-complete">No users found</div>
                  )}
                </div>
              ) : null}
            </Dropdown>
          </div>
        </FormGroup>

        {/* Associated Atoms */}
        <FormGroup className={styles.formGroup}>
          <Label className={styles.formLabel}>Select Atoms:</Label>
          <div className={styles.atomsContainer}>
            {isLoadingAtoms ? (
              <div className={styles.loadingMessage}>Loading atoms...</div>
            ) : (
              <div className={styles.atomsList}>
                {availableAtoms.map(atom => (
                  <div key={atom._id} className={styles.atomItem}>
                    <CustomInput
                      type="checkbox"
                      id={`atom-${atom._id}`}
                      label={atom.name || atom.title || atom.atomName}
                      checked={selectedAtoms.includes(atom._id)}
                      onChange={() => handleAtomToggle(atom._id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Atoms Summary */}
          {selectedAtoms.length > 0 && (
            <div className={styles.selectedSummary}>
              <strong>Selected Atoms ({selectedAtoms.length}):</strong>
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
  isModalOpen: state.atom?.isModalOpen || false,
  studentId: state.atom?.studentId,
  studentName: state.atom?.studentName,
  availableAtoms: state.atom?.availableAtoms || [],
  selectedAtoms: state.atom?.selectedAtoms || [],
  note: state.atom?.note || '',
  isLoadingAtoms: state.atom?.isLoadingAtoms || false,
  isSubmitting: state.atom?.isSubmitting || false,
  submitError: state.atom?.submitError,
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
