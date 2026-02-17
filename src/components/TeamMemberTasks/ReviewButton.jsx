import { useMemo, useState } from 'react';
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
  Input,
  Spinner,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dompurify from 'dompurify';
import styles from './style.module.css';
import style from './reviewButton.module.css';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import httpService from '../../services/httpService';
import { ApiEndpoint } from '~/utils/URL';
import hasPermission from '~/utils/permissions';

function ReviewButton({ user, task, updateTask }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const myUserId = useSelector(state => state.auth.user.userid);
  const myRole = useSelector(state => state.auth.user.role);
  const [modal, setModal] = useState(false);
  const [link, setLink] = useState('');
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const canReview = dispatch(hasPermission('putReviewStatus'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [editLinkState, setEditLinkState] = useState({
    isOpen: false,
    link: '',
    isEditing: false,
    isSuccess: false,
    error: null,
  });
  const [invalidDomainModal, setInvalidDomainModal] = useState({
    isOpen: false,
    errorType: null,
    errorMessage: '',
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
      // When opening the modal, find the link associated with this user
      const userLink = task.relatedWorkLinks?.[task.relatedWorkLinks.length - 1] || '';
      const sanitizedUserLink = sanitizeUrl(userLink);
      setEditLinkState(prev => ({ ...prev, link: sanitizedUserLink, error: null }));
    }
  };

  const toggleInvalidDomainModal = (errorType = null) => {
    if (!invalidDomainModal.isOpen && errorType) {
      let errorMessage =
        'Nice try, but that link is about as useful as a chocolate teapot! We need a GitHub PR link, Google Doc, Dropbox folder, Figma design, or One Community webpage.';

      if (errorType === 'invalid_dropbox_link') {
        errorMessage =
          'Oops! That link\'s about as helpful as a screen door on a submarine. Please use the "Share" or "Copy link to" option to create a DropBox link that works for people other than just you.';
      }

      setInvalidDomainModal({
        isOpen: true,
        errorType,
        errorMessage,
      });
    } else {
      setInvalidDomainModal({
        isOpen: false,
        errorType: null,
        errorMessage: '',
      });
    }
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

    return 'Update Link';
  };

  const validURL = url => {
    try {
      if (!url || url.trim() === '') return false;

      // Check minimum length requirement
      if (url.length < 20) return false;

      // Secure URL validation pattern that prevents catastrophic backtracking
      // Split validation into parts to avoid nested quantifiers
      const protocolPattern = /^https?:\/\//;
      const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
      const pathPattern = /^[\/\w\-._~:?#[\]@!$&'()*+,;=%]*$/;

      // If URL doesn't start with http/https, add https:// for validation
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;

      // Test protocol
      if (!protocolPattern.test(urlToTest)) return false;

      // Extract domain and path parts
      const urlWithoutProtocol = urlToTest.replace(protocolPattern, '');
      const slashIndex = urlWithoutProtocol.indexOf('/');
      const domain =
        slashIndex === -1 ? urlWithoutProtocol : urlWithoutProtocol.substring(0, slashIndex);
      const path = slashIndex === -1 ? '' : urlWithoutProtocol.substring(slashIndex);

      // Validate domain and path separately
      if (!domainPattern.test(domain)) return false;
      if (path && !pathPattern.test(path)) return false;

      // Additional validation using URL constructor
      try {
        new URL(urlToTest);
        return true;
      } catch (e) {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const handleLink = e => {
    const url = sanitizeUrl(e.target.value);
    setLink(url);
    if (!url) {
      setEditLinkState(prev => ({ ...prev, error: 'A valid URL is required for review' }));
    } else if (!validURL(url)) {
      setEditLinkState(prev => ({
        ...prev,
        error: "Please enter a valid URL starting with 'https://'.",
      }));
    } else {
      setEditLinkState(prev => ({ ...prev, error: null }));
    }
  };

  /**
   * Validates if the provided URL is one of the accepted domain types
   * @param {string} url - The URL to validate
   * @returns {object} - { isValid: boolean, errorType: string|null }
   */
  const validateAllowedDomainTypes = url => {
    if (!url) {
      return { isValid: false, errorType: 'missing_url' };
    }

    // Normalize the URL
    const normalizedUrl = url.toLowerCase();

    // 1. Google Doc check
    if (normalizedUrl.includes('docs.google.com')) {
      if (
        normalizedUrl.includes('/document/d/') ||
        normalizedUrl.includes('/spreadsheets/d/') ||
        normalizedUrl.includes('/presentation/d/') ||
        normalizedUrl.includes('/forms/d/')
      ) {
        return { isValid: true, errorType: null };
      }
      return { isValid: false, errorType: 'general_invalid' };
    }

    // 2. Dropbox check
    if (normalizedUrl.includes('dropbox.com')) {
      if (normalizedUrl.includes('dropbox.com/s/') || normalizedUrl.includes('dropbox.com/scl/')) {
        return { isValid: true, errorType: null };
      }
      return { isValid: false, errorType: 'invalid_dropbox_link' };
    }

    // 3. GitHub PR check
    if (normalizedUrl.includes('github.com')) {
      if (normalizedUrl.includes('/pull/')) {
        return { isValid: true, errorType: null };
      }
      return { isValid: false, errorType: 'general_invalid' };
    }

    // 4. One Community check
    if (
      normalizedUrl.includes('onecommunityglobal.org') ||
      normalizedUrl.includes('onecommunityglobal.com') ||
      normalizedUrl.includes('onecommunity.org') ||
      normalizedUrl.includes('onecommunity.com')
    ) {
      return { isValid: true, errorType: null };
    }
    // 5. Figma design file check
    if (normalizedUrl.includes('figma.com')) {
      if (normalizedUrl.includes('/design/')) {
        return { isValid: true, errorType: null };
      }
      return { isValid: false, errorType: 'general_invalid' };
    }

    // Generic invalid domain
    return { isValid: false, errorType: 'general_invalid' };
  };

  const reviewStatus = useMemo(() => {
    const resource = task.resources.find(r => r.userID === user.personId);
    return resource ? resource.reviewStatus || 'Unsubmitted' : 'Unsubmitted';
  }, [task, user]);

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

    if (newStatus === 'Submitted' && link) {
      const sanitizedLink = sanitizeUrl(link);
      if (validURL(sanitizedLink)) {
        updatedTask = {
          ...updatedTask,
          relatedWorkLinks: [...taskRelatedWorkLinks, sanitizedLink],
        };
        setLink('');
      } else {
        setIsSubmitting(false);
        return;
      }
    }
    updateTask(task._id, updatedTask);
    setModal(false);
    setIsSubmitting(true);
  };

  const submitReviewRequest = event => {
    event.preventDefault();

    const sanitizedLink = sanitizeUrl(link);
    if (!validURL(sanitizedLink)) {
      setEditLinkState(prev => ({
        ...prev,
        error:
          'Please enter a valid URL (must start with http:// or https:// and be at least 20 characters)',
      }));
      return;
    }

    const validationResult = validateAllowedDomainTypes(sanitizedLink);
    if (!validationResult.isValid) {
      toggleInvalidDomainModal(validationResult.errorType);
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
    const sanitizedLink = sanitizeUrl(editLinkState.link);

    if (!validURL(sanitizedLink)) {
      setEditLinkState(prev => ({
        ...prev,
        error:
          'Please enter a valid URL (must start with http:// or https:// and be at least 20 characters)',
      }));
      return;
    }

    const validationResult = validateAllowedDomainTypes(sanitizedLink);
    if (!validationResult.isValid) {
      toggleInvalidDomainModal(validationResult.errorType);
      return;
    }

    // Set loading state
    setEditLinkState(prev => ({ ...prev, isEditing: true }));

    // Update the task with the new link
    const updatedTask = { ...task };

    // If there are related work links, replace the last one (assuming it's the one for this user)
    if (Array.isArray(updatedTask.relatedWorkLinks) && updatedTask.relatedWorkLinks.length > 0) {
      updatedTask.relatedWorkLinks[updatedTask.relatedWorkLinks.length - 1] = sanitizedLink;
    } else {
      // If no related work links exist yet, add this one
      updatedTask.relatedWorkLinks = [sanitizedLink];
    }

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

  const handleEditLinkChange = e => {
    // Safely extract and sanitize the value first
    const rawValue = e && e.target && e.target.value !== undefined ? e.target.value : '';
    const sanitizedValue = sanitizeUrl(rawValue);
    // Then use the sanitized value in the state update
    setEditLinkState(prev => ({ ...prev, link: sanitizedValue }));
  };

  const buttonFormat = () => {
    if (user.personId === myUserId && reviewStatus === 'Unsubmitted') {
      return (
        // <Button
        //   className={style['reviewBtn']}
        //   color="primary"
        //   onClick={toggleModal}
        //   style={darkMode ? boxStyleDark : boxStyle}
        //   disabled={isSubmitting}
        // >
        //   Submit for Review
        // </Button>
        <button
          className={`${style.reviewBtn} btn btn-primary`}
          onClick={toggleModal}
          style={darkMode ? boxStyleDark : boxStyle}
          disabled={isSubmitting}
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
              {task.relatedWorkLinks &&
                // eslint-disable-next-line no-shadow
                task.relatedWorkLinks.map(link => (
                  <DropdownItem
                    key={sanitizeText(link)}
                    href={handleSafeLink(link)}
                    target="_blank"
                    className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} /> View Link
                  </DropdownItem>
                ))}
              <DropdownItem
                onClick={toggleEditLinkModal}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                <FontAwesomeIcon icon={faPencilAlt} /> Edit Link
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
              {task.relatedWorkLinks &&
                task.relatedWorkLinks.map(dropLink => (
                  <DropdownItem
                    key={sanitizeText(dropLink)}
                    href={handleSafeLink(dropLink)}
                    target="_blank"
                    className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} /> View Link
                  </DropdownItem>
                ))}
              <DropdownItem
                onClick={toggleEditLinkModal}
                className={`${darkMode ? 'text-light' : ''} ${style['dark-mode-btn']}`}
              >
                <FontAwesomeIcon icon={faPencilAlt} /> Edit Link
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

  return (
    <>
      {/* Verification Modal */}
      <Modal
        isOpen={verifyModal}
        toggle={toggleVerify}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={toggleVerify} className={darkMode ? 'bg-space-cadet' : ''}>
          {selectedAction === 'Complete and Remove' &&
            'Are you sure you have completed the review?'}
          {selectedAction === 'More Work Needed' && 'Are you sure?'}
        </ModalHeader>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
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
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
          </Button>
          <Button onClick={toggleVerify} style={darkMode ? boxStyleDark : boxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      {/* Second Confirmation Modal */}
      <Modal
        isOpen={confirmSubmitModal}
        toggle={toggleConfirmSubmitModal}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={toggleConfirmSubmitModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Confirm Submission
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          You are about to submit the following link for review:
          <div className="mt-2" style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
            <span>{sanitizeText(link)}</span>
          </div>
          Please confirm if this is the correct link.
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="primary"
            onClick={handleFinalSubmit}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Confirm and Submit
          </Button>
          <Button onClick={toggleConfirmSubmitModal} style={darkMode ? boxStyleDark : boxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Submission Modal */}
      <Modal isOpen={modal} toggle={toggleModal} className={darkMode ? 'text-light dark-mode' : ''}>
        <ModalHeader toggle={toggleModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Change Review Status
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {reviewStatus === 'Unsubmitted'
            ? `Are you sure you want to submit for review?`
            : `Are you sure you have completed the review?`}
        </ModalBody>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          Please add link to related work:
          <Input type="text" required value={link} onChange={handleLink} />
          {editLinkState.error && (
            <div className="text-danger">{sanitizeText(editLinkState.error)}</div>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            onClick={e => {
              e.preventDefault();
              const sanitizedLink = sanitizeUrl(link);
              if (!sanitizedLink || !validURL(sanitizedLink)) {
                setEditLinkState(prev => ({
                  ...prev,
                  error: "Please enter a valid URL starting with 'https://'.",
                }));
                return;
              }

              const validationResult = validateAllowedDomainTypes(sanitizedLink);
              if (!validationResult.isValid) {
                toggleInvalidDomainModal(validationResult.errorType);
                return;
              }

              if (reviewStatus === 'Unsubmitted') {
                submitReviewRequest(e);
              } else {
                updReviewStat('Reviewed');
              }
            }}
            color="primary"
            className="float-left"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {reviewStatus === 'Unsubmitted' ? `Submit` : `Complete`}
          </Button>
          <Button onClick={modalCancelButtonHandler} style={darkMode ? boxStyleDark : boxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Link Modal */}
      <Modal
        isOpen={editLinkState.isOpen}
        toggle={toggleEditLinkModal}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={toggleEditLinkModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Edit Submitted Link
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p>Update the link to your submitted work:</p>
          <Input type="text" required value={editLinkState.link} onChange={handleEditLinkChange} />
          {editLinkState.error && (
            <div className="text-danger">{sanitizeText(editLinkState.error)}</div>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            onClick={handleEditLink}
            color="primary"
            className="float-left"
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={editLinkState.isEditing}
          >
            {renderUpdateButtonContent()}
          </Button>

          <Button
            onClick={toggleEditLinkModal}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={editLinkState.isEditing}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Dynamic Invalid Domain Type Warning Modal */}
      <Modal
        isOpen={invalidDomainModal.isOpen}
        toggle={() => toggleInvalidDomainModal()}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          toggle={() => toggleInvalidDomainModal()}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          Invalid Domain Type
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="text-center mb-3">
            <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>
              ⚠️
            </span>
          </div>
          <p>{sanitizeText(invalidDomainModal.errorMessage)}</p>
          <div className="mt-3">
            <strong>Acceptable link types:</strong>
            <ul className="mt-2" style={{ paddingLeft: '25px' }}>
              <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                Google Doc (docs.google.com)
              </li>
              <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                Dropbox shared link (must contain /s/ or /scl/)
              </li>
              <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                GitHub PR link (must contain /pull/)
              </li>
              <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                One Community webpage (onecommunityglobal.org)
              </li>
              <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>Figma design (figma.com)</li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="primary"
            onClick={() => toggleInvalidDomainModal()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Got it!
          </Button>
        </ModalFooter>
      </Modal>

      {buttonFormat()}
    </>
  );
}
export default ReviewButton;
