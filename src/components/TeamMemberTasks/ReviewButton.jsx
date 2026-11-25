import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Spinner,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dompurify from 'dompurify';
import styles from './style.module.css';
import style from './reviewButton.module.css';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import httpService from '../../services/httpService';
import { ApiEndpoint } from '~/utils/URL';
import hasPermission from '~/utils/permissions';

import { permissions } from '../../utils/constants';
import LinkListInput from './LinkListInput';
import {
  expandLinks,
  getLinkError,
  linkLabel,
  validURL,
  validateAllowedDomainTypes,
} from './reviewLinkUtils';

function ReviewButton({ user, task, updateTask, onTimeOff }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const myUserId = useSelector(state => state.auth.user.userid);
  const myRole = useSelector(state => state.auth.user.role);
  const [modal, setModal] = useState(false);
  const [links, setLinks] = useState(['']);
  const [showLinkErrors, setShowLinkErrors] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const canReview = dispatch(hasPermission(permissions.putReviewStatus));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [editLinkState, setEditLinkState] = useState({
    isOpen: false,
    links: [''],
    showErrors: false,
    isEditing: false,
    isSuccess: false,
    error: null,
  });

  // XSS Protection sanitizer
  const sanitizer = dompurify.sanitize;

  // Utility function to sanitize URLs
  const sanitizeUrl = url => {
    if (!url) return '';
    return sanitizer(url.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  // Utility function to sanitize text content
  const sanitizeText = text => {
    if (!text) return '';
    return sanitizer(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  // Safe link handler to prevent XSS in href attributes
  const handleSafeLink = url => {
    // Sanitize the URL and validate it's safe to use as href
    const sanitizedUrl = sanitizeUrl(url);
    const validationResult = validateAllowedDomainTypes(sanitizedUrl);

    if (validationResult.isValid && validURL(sanitizedUrl)) {
      return sanitizedUrl;
    }
    return '#'; // Fallback to safe href
  };

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setEditLinkState(prev => ({ ...prev, error: null }));
      setShowLinkErrors(false);
    }
  };

  const modalCancelButtonHandler = () => {
    toggleModal();
    setIsSubmitting(false);
  };

  const toggleVerify = () => {
    setVerifyModal(!verifyModal);
  };

  const toggleConfirmSubmitModal = () => {
    setConfirmSubmitModal(!confirmSubmitModal); // Toggle for second confirmation modal
  };

  const toggleEditLinkModal = () => {
    setEditLinkState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isEditing: false,
    }));
    if (!editLinkState.isOpen) {
      // When opening the modal, list every stored link (old "link;link" entries show as separate rows)
      const storedLinks = expandLinks(task.relatedWorkLinks).map(sanitizeUrl);
      setEditLinkState(prev => ({
        ...prev,
        links: storedLinks.length > 0 ? storedLinks : [''],
        showErrors: false,
        error: null,
      }));
    }
  };

  // Error text for each link row, shown only after the first failed attempt to submit
  const getRowErrors = (rows, show) =>
    show ? rows.map(row => getLinkError(sanitizeUrl(row))) : [];

  // After a failed attempt, move focus to the first link that needs fixing
  const focusFirstInvalid = (inputId, rows) => {
    const index = rows.findIndex(row => getLinkError(sanitizeUrl(row)));
    if (index < 0) return;
    setTimeout(() => document.getElementById(`${inputId}-${index}`)?.focus(), 0);
  };

  // helper right above the return (or inline if you prefer)
  const renderUpdateButtonContent = () => {
    if (editLinkState.isEditing) {
      return (
        <>
          <Spinner size="sm" className="mr-2" /> Updating…
        </>
      );
    }

    if (editLinkState.isSuccess) {
      return (
        <>
          <FontAwesomeIcon icon={faCheck} className="mr-2" /> Updated!
        </>
      );
    }

    return 'Update links';
  };

  const reviewStatus = useMemo(() => {
    const resource = task.resources.find(r => r.userID === user.personId);
    return resource ? resource.reviewStatus || 'Unsubmitted' : 'Unsubmitted';
  }, [task, user]);

  // Old entries typed as "link;link" are shown as separate links
  const storedLinks = useMemo(() => expandLinks(task.relatedWorkLinks), [task.relatedWorkLinks]);

  const updReviewStat = newStatus => {
    const resources = [...task.resources];
    const newResources = resources.map(resource => {
      const newResource = { ...resource, reviewStatus: newStatus };
      newResource.completedTask = newStatus === 'Reviewed';
      return newResource;
    });
    let updatedTask = { ...task, resources: newResources };
    let taskRelatedWorkLinks = task.relatedWorkLinks;
    // Add relatedWorkLinks to existing tasks
    if (!Array.isArray(task.relatedWorkLinks)) {
      taskRelatedWorkLinks = [];
    }

    if (newStatus === 'Submitted') {
      const cleanedLinks = links.map(sanitizeUrl).filter(Boolean);
      if (cleanedLinks.length === 0 || cleanedLinks.some(item => getLinkError(item))) {
        setIsSubmitting(false);
        return;
      }
      updatedTask = {
        ...updatedTask,
        relatedWorkLinks: [...taskRelatedWorkLinks, ...cleanedLinks],
      };
      setLinks(['']);
      setShowLinkErrors(false);
    }
    updateTask(task._id, updatedTask);
    setModal(false);
    setIsSubmitting(true);
  };

  const submitReviewRequest = event => {
    event.preventDefault();

    if (links.map(sanitizeUrl).some(item => getLinkError(item))) {
      setShowLinkErrors(true);
      focusFirstInvalid('review-links', links);
      return;
    }

    toggleConfirmSubmitModal();
  };

  const sendReviewReq = () => {
    const data = {};
    data.myUserId = sanitizeText(myUserId);
    data.name = sanitizeText(user.name);
    data.taskName = sanitizeText(task.taskName);
    httpService.post(`${ApiEndpoint}/tasks/reviewreq/${sanitizeText(myUserId)}`, data);
  };

  const handleFinalSubmit = () => {
    // Submit the review and link after confirming in the second modal
    updReviewStat('Submitted');
    toggleConfirmSubmitModal();
    sendReviewReq();
  };

  const sendEditLinkNotification = () => {
    const data = {};
    data.myUserId = sanitizeText(myUserId);
    data.name = sanitizeText(user.name);
    data.taskName = sanitizeText(task.taskName);
    data.isLinkUpdate = true;
    httpService.post(`${ApiEndpoint}/tasks/reviewreq/${sanitizeText(myUserId)}`, data);
  };

  const handleEditLink = () => {
    const cleanedLinks = editLinkState.links.map(sanitizeUrl);

    if (cleanedLinks.some(item => getLinkError(item))) {
      setEditLinkState(prev => ({ ...prev, showErrors: true }));
      focusFirstInvalid('edit-review-links', editLinkState.links);
      return;
    }

    // Set loading state
    setEditLinkState(prev => ({ ...prev, isEditing: true }));

    // Save the edited list as the task's links (a new array, the task prop is not changed)
    const updatedTask = { ...task, relatedWorkLinks: cleanedLinks };

    // Call the update function from props
    const result = updateTask(task._id, updatedTask);

    // Handle both Promise and non-Promise return types
    if (result && typeof result.then === 'function') {
      // It's a Promise
      result
        .then(() => {
          // Notify that the link has been updated
          sendEditLinkNotification();

          // Show success indicator
          setEditLinkState(prev => ({ ...prev, isSuccess: true }));
          setTimeout(() => {
            setEditLinkState(prev => ({
              ...prev,
              isSuccess: false,
              isOpen: false,
            }));
          }, 1500);
        })
        .catch(error => {
          toast.error('Error updating link:', error);
          setEditLinkState(prev => ({
            ...prev,
            error: 'Failed to update link. Please try again.',
          }));
        })
        .finally(() => {
          setEditLinkState(prev => ({ ...prev, isEditing: false }));
        });
    } else {
      // It's not a Promise
      // Notify that the link has been updated
      sendEditLinkNotification();

      // Show success indicator
      setEditLinkState(prev => ({ ...prev, isSuccess: true }));
      setTimeout(() => {
        setEditLinkState(prev => ({
          ...prev,
          isEditing: false,
          isSuccess: false,
          isOpen: false,
        }));
      }, 1500);
    }
  };

  const buttonFormat = () => {
    if (user.personId === myUserId && reviewStatus === 'Unsubmitted') {
      return (
        <button
          className={`${style.reviewBtn} btn btn-primary`}
          onClick={toggleModal}
          type="button"
          style={darkMode ? boxStyleDark : boxStyle}
          disabled={isSubmitting || Boolean(onTimeOff)}
          title={
            onTimeOff
              ? "You can't submit a task for review while you're on time off this week."
              : undefined
          }
        >
          Submit for Review
        </button>
      );
    }
    if (reviewStatus === 'Submitted') {
      // First check if it's the user's own task
      if (user.personId === myUserId) {
        return (
          <UncontrolledDropdown>
            <DropdownToggle
              className={`${styles['btn--dark-sea-green']} ${style.reviewBtn} ${style['reviewBtn-dropdown-wrapper']}`}
              caret
              style={{
                // Use inline styles to match the desired light green pill look
                backgroundColor: '#E5F4E8' /* Light Green background */,
                color: '#326749' /* Dark Green Text */,
                borderColor: '#C3E6CB' /* Light Green Border */,

                ...(darkMode ? boxStyleDark : boxStyle),
              }}
            >
              Ready for Review
            </DropdownToggle>

            <DropdownMenu
              container="body"
              strategy="fixed"
              className={style['review-button-dropdown']}
            >
              {storedLinks.map((storedLink, index) => (
                <DropdownItem
                  key={`${index}-${sanitizeText(storedLink)}`} // eslint-disable-line react/no-array-index-key
                  href={handleSafeLink(storedLink)}
                  target="_blank"
                  className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} /> View {linkLabel(storedLink)}
                </DropdownItem>
              ))}
              <DropdownItem
                onClick={toggleEditLinkModal}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                <FontAwesomeIcon icon={faPencilAlt} /> Edit links
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      }
      if (
        myRole === 'Owner' ||
        myRole === 'Administrator' ||
        myRole === 'Mentor' ||
        myRole === 'Manager' ||
        canReview
      ) {
        return (
          <UncontrolledDropdown>
            <DropdownToggle
              className={`${styles['btn--dark-sea-green']} ${style['reviewBtn']}`}
              caret
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Ready for Review
            </DropdownToggle>
            <DropdownMenu
              container="body"
              strategy="fixed"
              className={style['review-button-dropdown']}
            >
              {storedLinks.map((storedLink, index) => (
                <DropdownItem
                  key={`${index}-${sanitizeText(storedLink)}`} // eslint-disable-line react/no-array-index-key
                  href={handleSafeLink(storedLink)}
                  target="_blank"
                  className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} /> View {linkLabel(storedLink)}
                </DropdownItem>
              ))}
              <DropdownItem
                onClick={toggleEditLinkModal}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                <FontAwesomeIcon icon={faPencilAlt} /> Edit links
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedAction('Complete and Remove');
                  toggleVerify();
                }}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                <div className={styles['review-dropdown-item']}>
                  <FontAwesomeIcon className={styles['team-member-tasks-done']} icon={faCheck} />
                  <span>as complete and remove task</span>
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedAction('More Work Needed');
                  toggleVerify();
                }}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                More work needed, reset this button
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      }
      return (
        <Button className={style.reviewBtn} color="success" disabled>
          Ready for Review
        </Button>
      );
    }
    return null;
  };

  const conditionalBoxStyle = darkMode ? boxStyleDark : boxStyle;
  const modalClassName = darkMode ? 'text-light dark-mode' : '';
  const headerClassName = darkMode ? 'bg-space-cadet' : '';
  const panelClassName = darkMode ? 'bg-yinmn-blue' : '';

  return (
    <>
      {/* Verification Modal */}
      <Modal isOpen={verifyModal} toggle={toggleVerify} className={modalClassName}>
        <ModalHeader toggle={toggleVerify} className={headerClassName}>
          {selectedAction === 'Complete and Remove' &&
            'Are you sure you have completed the review?'}
          {selectedAction === 'More Work Needed' && 'Are you sure?'}
        </ModalHeader>
        <ModalFooter className={panelClassName}>
          <Button
            onClick={e => {
              toggleVerify();
              if (selectedAction === 'More Work Needed') {
                updReviewStat('Unsubmitted');
                setIsSubmitting(false);
              } else if (reviewStatus === 'Unsubmitted') {
                submitReviewRequest(e);
              } else {
                updReviewStat('Reviewed');
              }
            }}
            color="primary"
            className="float-left"
            style={conditionalBoxStyle}
          >
            {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
          </Button>
          <Button onClick={toggleVerify} style={conditionalBoxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      {/* Second Confirmation Modal */}
      <Modal
        isOpen={confirmSubmitModal}
        toggle={toggleConfirmSubmitModal}
        className={modalClassName}
      >
        <ModalHeader toggle={toggleConfirmSubmitModal} className={headerClassName}>
          Confirm Submission
        </ModalHeader>
        <ModalBody className={panelClassName}>
          {links.length > 1
            ? 'You are about to submit these links for review:'
            : 'You are about to submit this link for review:'}
          <ul className="mt-2 pl-3" style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
            {links.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>{sanitizeText(item)}</li>
            ))}
          </ul>
          {links.length > 1
            ? 'Please confirm these are the correct links.'
            : 'Please confirm this is the correct link.'}
        </ModalBody>
        <ModalFooter className={panelClassName}>
          <Button color="primary" onClick={handleFinalSubmit} style={conditionalBoxStyle}>
            Confirm and Submit
          </Button>
          <Button onClick={toggleConfirmSubmitModal} style={conditionalBoxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Submission Modal */}
      <Modal isOpen={modal} toggle={toggleModal} className={modalClassName}>
        <ModalHeader toggle={toggleModal} className={headerClassName}>
          Change Review Status
        </ModalHeader>
        <ModalBody className={panelClassName}>
          {reviewStatus === 'Unsubmitted'
            ? `Are you sure you want to submit for review?`
            : `Are you sure you have completed the review?`}
        </ModalBody>
        <ModalBody className={panelClassName}>
          <LinkListInput
            id="review-links"
            label="Links to your work"
            links={links}
            errors={getRowErrors(links, showLinkErrors)}
            onChange={setLinks}
            darkMode={darkMode}
          />
        </ModalBody>
        <ModalFooter className={panelClassName}>
          <Button
            onClick={e => {
              e.preventDefault();
              if (reviewStatus === 'Unsubmitted') {
                submitReviewRequest(e);
              } else {
                updReviewStat('Reviewed');
              }
            }}
            color="primary"
            className="float-left"
            style={conditionalBoxStyle}
          >
            {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
          </Button>
          <Button onClick={modalCancelButtonHandler} style={conditionalBoxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Link Modal */}
      <Modal isOpen={editLinkState.isOpen} toggle={toggleEditLinkModal} className={modalClassName}>
        <ModalHeader toggle={toggleEditLinkModal} className={headerClassName}>
          Edit submitted links
        </ModalHeader>
        <ModalBody className={panelClassName}>
          <LinkListInput
            id="edit-review-links"
            label="Links to your submitted work"
            links={editLinkState.links}
            errors={getRowErrors(editLinkState.links, editLinkState.showErrors)}
            onChange={nextLinks => setEditLinkState(prev => ({ ...prev, links: nextLinks }))}
            darkMode={darkMode}
          />
          {editLinkState.error && (
            <div className="text-danger" role="alert">
              {sanitizeText(editLinkState.error)}
            </div>
          )}
        </ModalBody>
        <ModalFooter className={panelClassName}>
          <Button
            onClick={handleEditLink}
            color="primary"
            className="float-left"
            style={conditionalBoxStyle}
            disabled={editLinkState.isEditing}
          >
            {renderUpdateButtonContent()}
          </Button>

          <Button
            onClick={toggleEditLinkModal}
            style={conditionalBoxStyle}
            disabled={editLinkState.isEditing}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {buttonFormat()}
    </>
  );
}
ReviewButton.propTypes = {
  user: PropTypes.shape({
    personId: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  task: PropTypes.object.isRequired,
  updateTask: PropTypes.func.isRequired,
  onTimeOff: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default ReviewButton;
