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
  Dropdown,
  CustomInput,
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import styles from './AssignAtomModal.module.css';
import { getGroups, getGroupMembers, normalizeMemberIds } from '~/services/studentGroupsService';
import { assignGroupAtoms } from '~/services/atomAssignmentService';
import {
  fetchAvailableAtoms,
  assignAtoms,
  selectAtom,
  deselectAtom,
  setNote,
  hideModal,
  clearForm,
} from '~/actions/educationPortal/atomActions';

function showCompletedGroupToast(results, selectedAtoms) {
  const count = new Set(selectedAtoms).size;
  if (results.every(result => result.status === 'already assigned')) {
    toast.info('The selected atoms are already assigned to all group members.');
  } else if (results.every(result => result.status === 'assigned')) {
    toast.success(
      `${count} selected atom${count === 1 ? '' : 's'} assigned successfully to ${
        results.length
      } student${results.length === 1 ? '' : 's'}.`,
    );
  } else {
    const assignedCount = results.filter(result => result.status === 'assigned').length;
    toast.info(
      `Group assignment complete: ${assignedCount} student${
        assignedCount === 1 ? '' : 's'
      } assigned; ${results.length - assignedCount} already or previously assigned.`,
    );
  }
}

function renderStudentMatches(isLoadingUsers, filteredUsers, searchText, handleStudentSelect) {
  if (isLoadingUsers) return <div className={styles['user__auto-complete']}>Loading users...</div>;
  if (filteredUsers.length > 0)
    return filteredUsers.map(user => (
      <div
        className={styles['user__auto-complete']}
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
    ));
  if (searchText.trim()) return <div className={styles['user__auto-complete']}>No users found</div>;
  return null;
}

function renderStudentSearchResults({
  isInputFocus,
  searchText,
  allUsers,
  isUserDropdownOpen,
  darkMode,
  isLoadingUsers,
  filteredUsers,
  handleStudentSelect,
}) {
  return isInputFocus || (searchText !== '' && allUsers && allUsers.length > 0) ? (
    <div
      tabIndex="-1"
      role="menu"
      aria-hidden="false"
      className={`dropdown-menu${isUserDropdownOpen ? ' show dropdown__user-perms' : ''} ${
        darkMode ? 'bg-darkmode-liblack text-light' : ''
      }`}
      style={{ marginTop: '0px', width: '100%' }}
    >
      {renderStudentMatches(isLoadingUsers, filteredUsers, searchText, handleStudentSelect)}
    </div>
  ) : null;
}

export const AssignAtomModal = ({
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

  const [target, setTarget] = useState('student');
  const [groups, setGroups] = useState([]);
  const [groupsStatus, setGroupsStatus] = useState('idle');
  const [groupId, setGroupId] = useState('');
  const [membership, setMembership] = useState({ id: '', status: 'idle' });
  const [groupPending, setGroupPending] = useState(false);
  const [groupResults, setGroupResults] = useState(null);
  const groupLock = useRef(false);
  const assignmentLedger = useRef(new Map());

  useEffect(() => {
    if (!isModalOpen || target !== 'group') return undefined;
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
  }, [isModalOpen, target]);

  useEffect(() => {
    if (!isModalOpen || target !== 'group' || !groupId) return undefined;
    let cancelled = false;
    setMembership({ id: groupId, status: 'loading' });
    getGroupMembers(groupId)
      .then(data => {
        if (!cancelled)
          setMembership({
            id: groupId,
            status: 'ready',
            ids: [...new Set(normalizeMemberIds(data))],
          });
      })
      .catch(() => {
        if (!cancelled) setMembership({ id: groupId, status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [isModalOpen, target, groupId]);

  const groupReady =
    groupsStatus === 'ready' &&
    groups.some(group => group.id === groupId) &&
    membership.id === groupId &&
    membership.status === 'ready' &&
    membership.ids.length > 0;

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

  const submissionKey = JSON.stringify([
    target,
    groupId,
    [...selectedAtoms].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }),
    localNote,
  ]);
  const visibleGroupResults =
    groupResults?.snapshot === submissionKey ? groupResults.results : null;

  const handleSubmit = useCallback(async () => {
    if (groupLock.current) return;
    if (target === 'group') {
      if (!groupReady || selectedAtoms.length === 0) return;
      groupLock.current = true;
      setGroupPending(true);
      setGroupResults(null);
      setValidationError('');
      try {
        const results = await assignGroupAtoms(
          [...membership.ids],
          [...selectedAtoms],
          localNote,
          assignmentLedger.current,
        );
        if (
          results.length > 0 &&
          !results.some(result => ['failed', 'unconfirmed'].includes(result.status))
        ) {
          showCompletedGroupToast(results, selectedAtoms);
          clearForm();
          setGroupId('');
          setMembership({ id: '', status: 'idle' });
          setTarget('student');
          assignmentLedger.current.forEach((status, key) => {
            if (status !== 'unconfirmed') assignmentLedger.current.delete(key);
          });
          hideModal();
        } else {
          setGroupResults({ snapshot: submissionKey, results });
        }
      } finally {
        groupLock.current = false;
        setGroupPending(false);
      }
      return;
    }
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
  }, [
    selectedAtoms,
    localNote,
    selectedStudent,
    assignAtoms,
    hideModal,
    target,
    groupReady,
    membership,
    submissionKey,
    clearForm,
  ]);

  const handleCancel = useCallback(() => {
    if (groupLock.current) return;
    const selectedTarget = target === 'group' ? groupId : selectedStudent;
    const dirty = selectedAtoms.length > 0 || localNote.trim() || selectedTarget;
    // eslint-disable-next-line no-alert
    if (dirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?'))
      return;
    if (dirty) {
      clearForm();
      setSelectedStudent(null);
      setSearchText('');
    }
    setGroupId('');
    setMembership({ id: '', status: 'idle' });
    setGroupResults(null);
    setTarget('student');
    // A new flow must consult the server again, except for unresolved requests that
    // may already have written. Those cannot safely be retried without reconciliation.
    assignmentLedger.current.forEach((status, key) => {
      if (status !== 'unconfirmed') assignmentLedger.current.delete(key);
    });
    hideModal();
  }, [selectedAtoms.length, localNote, selectedStudent, target, groupId, clearForm, hideModal]);

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

  const isSubmitDisabled =
    isSubmitting ||
    groupPending ||
    selectedAtoms.length === 0 ||
    (target === 'group' ? !groupReady : !selectedStudent);

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={handleClose}
      className={`${styles.modal} ${darkMode ? 'dark-mode' : ''} ${
        darkMode ? styles.darkMode : ''
      }`}
      size="lg"
    >
      <ModalHeader toggle={handleClose} className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Assign Atoms</h2>
      </ModalHeader>

      <ModalBody className={styles.modalContent}>
        <FormGroup className={styles.formGroup}>
          <Label for="assignment-target" className={styles.formLabel}>
            Assign to:
          </Label>
          <Input
            id="assignment-target"
            type="select"
            className={styles.dropdown}
            value={target}
            disabled={groupPending || isSubmitting}
            onChange={e => {
              setTarget(e.target.value);
              setValidationError('');
              setGroupResults(null);
            }}
          >
            <option value="student">Individual student</option>
            <option value="group">Student Group</option>
          </Input>
        </FormGroup>
        {target === 'group' && (
          <FormGroup className={styles.formGroup}>
            <Label for="assignment-group" className={styles.formLabel}>
              Student Group:
            </Label>
            <Input
              id="assignment-group"
              type="select"
              className={styles.dropdown}
              value={groupId}
              disabled={groupPending || groupsStatus !== 'ready'}
              onChange={e => {
                setGroupId(e.target.value);
                setGroupResults(null);
              }}
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Input>
            {groupsStatus === 'loading' && <output className="d-block">Loading groups…</output>}
            {groupsStatus === 'error' && (
              <div role="alert" className={styles.errorMessage}>
                Could not load groups. Switch targets to retry.
              </div>
            )}
            {groupsStatus === 'ready' && groups.length === 0 && <div>No groups available.</div>}
            {groupId && membership.id === groupId && membership.status === 'loading' && (
              <output className="d-block">Loading members…</output>
            )}
            {groupId && membership.id === groupId && membership.status === 'error' && (
              <div role="alert" className={styles.errorMessage}>
                Could not load members. Reselect the group to retry.
              </div>
            )}
            {groupId && membership.id === groupId && membership.status === 'ready' && (
              <div>
                {membership.ids.length
                  ? `${membership.ids.length} group members`
                  : 'This group has no members to assign.'}
              </div>
            )}
          </FormGroup>
        )}
        {/* Existing individual selection stays independent of the group target. */}
        {target === 'student' && (
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
                {renderStudentSearchResults({
                  isInputFocus,
                  searchText,
                  allUsers,
                  isUserDropdownOpen,
                  darkMode,
                  isLoadingUsers,
                  filteredUsers,
                  handleStudentSelect,
                })}
              </Dropdown>
            </div>
          </FormGroup>
        )}

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
                      disabled={groupPending}
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
                        disabled={groupPending}
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
            disabled={groupPending}
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

        {target === 'group' && visibleGroupResults && (
          <output className={`${styles.selectedSummary} d-block`}>
            <strong>Group assignment results</strong>
            <span className="d-block">
              {visibleGroupResults.filter(result => result.status === 'assigned').length} assigned;{' '}
              {visibleGroupResults.filter(result => result.status === 'already assigned').length}{' '}
              already assigned;{' '}
              {visibleGroupResults.filter(result => result.status === 'failed').length} failed;{' '}
              {visibleGroupResults.filter(result => result.status === 'unconfirmed').length}{' '}
              unconfirmed;{' '}
              {visibleGroupResults.filter(result => result.status === 'previously assigned').length}{' '}
              previously assigned (not resent).
            </span>
            {visibleGroupResults
              .filter(result => ['failed', 'unconfirmed'].includes(result.status))
              .map(result => (
                <span className="d-block" key={result.studentId}>
                  Student {result.studentId}: {result.status}
                </span>
              ))}
            {visibleGroupResults.some(result => result.status === 'failed') && (
              <span className="d-block">Submit again to retry confirmed failures.</span>
            )}
            {visibleGroupResults.some(result => result.status === 'unconfirmed') && (
              <span className="d-block">
                Unconfirmed requests are not resent. Check individual assignments before retrying
                them.
              </span>
            )}
            {visibleGroupResults.some(result =>
              ['assigned', 'already assigned', 'previously assigned'].includes(result.status),
            ) && (
              <span className="d-block">
                Existing or successful assignments are not resent, and their notes are not updated.
              </span>
            )}
            <span className="d-block">Selected atoms and note are preserved.</span>
          </output>
        )}
        {/* Error Messages */}
        {validationError && <div className={styles.errorMessage}>{validationError}</div>}

        {target === 'student' && submitError && (
          <div className={styles.errorMessage}>{submitError}</div>
        )}
      </ModalBody>

      <ModalFooter className={styles.buttonGroup}>
        <Button
          color="danger"
          onClick={handleCancel}
          disabled={isSubmitting || groupPending}
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
          {isSubmitting || groupPending ? (
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
