import React, { useMemo, useState } from 'react';
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
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import './style.css';
import './reviewButton.css';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import httpService from '../../services/httpService';
import { ApiEndpoint } from 'utils/URL';
import hasPermission from 'utils/permissions';

const ReviewButton = ({ user, task, updateTask }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [linkError, setLinkError] = useState(null);
  const myUserId = useSelector(state => state.auth.user.userid);
  const myRole = useSelector(state => state.auth.user.role);
  const [modal, setModal] = useState(false);
  const [link, setLink] = useState('');
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const canReview = dispatch(hasPermission('putReviewStatus'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [invalidDomainModal, setInvalidDomainModal] = useState({
    isOpen: false,
    errorType: null,
    errorMessage: '',
  });

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setLinkError(null);
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

  const toggleInvalidDomainModal = (errorType = null) => {
    if (!invalidDomainModal.isOpen && errorType) {
      let errorMessage =
        'Nice try, but that link is about as useful as a chocolate teapot! We need a GitHub PR link, Google Doc, Dropbox folder, or One Community webpage.';

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

  const handleLink = e => {
    const url = e.target.value;
    setLink(url);
    if (!url) {
      setLinkError('A valid URL is required for review');
    } else if (!validURL(url)) {
      setLinkError("Please enter a valid URL starting with 'https://'.");
    } else {
      setLinkError(null);
    }
  };

  const validURL = url => {
    try {
      if (url === '') return false;

      const pattern = /^(?=.{20,})(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
      return pattern.test(url);
    } catch (err) {
      console.log(err);
      return false;
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

    // Generic invalid domain
    return { isValid: false, errorType: 'general_invalid' };
  };

  const reviewStatus = useMemo(() => {
    let status = 'Unsubmitted';
    for (let resource of task.resources) {
      if (resource.userID === user.personId) {
        status = resource.reviewStatus ? resource.reviewStatus : 'Unsubmitted';
        break;
      }
    }
    return status;
  }, [task, user]);

  const updReviewStat = newStatus => {
    const resources = [...task.resources];
    const newResources = resources.map(resource => {
      const newResource = { ...resource, reviewStatus: newStatus };
      newResource.completedTask = newStatus === 'Reviewed';
      return newResource;
    });
    let updatedTask = { ...task, resources: newResources };
    //Add relatedWorkLinks to existing tasks
    if (!Array.isArray(task.relatedWorkLinks)) {
      task.relatedWorkLinks = [];
    }

    if (newStatus === 'Submitted' && link) {
      if (validURL(link)) {
        updatedTask = { ...updatedTask, relatedWorkLinks: [...task.relatedWorkLinks, link] };
        setLink('');
      } else {
        alert('Invalid URL. Please enter a valid URL of at least 20 characters');
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

    if (!validURL(link)) {
      setLinkError('Please enter a valid URL of at least 20 characters');
      return;
    }

    const validationResult = validateAllowedDomainTypes(link);
    if (!validationResult.isValid) {
      toggleInvalidDomainModal(validationResult.errorType);
      return;
    }

    toggleConfirmSubmitModal();
  };

  const handleFinalSubmit = () => {
    // Submit the review and link after confirming in the second modal
    updReviewStat('Submitted');
    toggleConfirmSubmitModal();
    sendReviewReq();
  };

  const sendReviewReq = () => {
    var data = {};
    data['myUserId'] = myUserId;
    data['name'] = user.name;
    data['taskName'] = task.taskName;
    httpService.post(`${ApiEndpoint}/tasks/reviewreq/${myUserId}`, data);
  };

  const buttonFormat = () => {
    if (user.personId === myUserId && reviewStatus === 'Unsubmitted') {
      return (
        <Button
          className="reviewBtn"
          color="primary"
          onClick={toggleModal}
          style={darkMode ? boxStyleDark : boxStyle}
          disabled={isSubmitting}
        >
          Submit for Review
        </Button>
      );
    } else if (reviewStatus === 'Submitted') {
      if (
        myRole == 'Owner' ||
        myRole == 'Administrator' ||
        myRole == 'Mentor' ||
        myRole == 'Manager' ||
        canReview
      ) {
        return (
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn--dark-sea-green reviewBtn"
              caret
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Ready for Review
            </DropdownToggle>
            <DropdownMenu className={darkMode ? 'bg-space-cadet' : ''}>
              {task.relatedWorkLinks &&
                task.relatedWorkLinks.map((link, index) => (
                  <DropdownItem
                    key={index}
                    href={link}
                    target="_blank"
                    className={darkMode ? 'text-light dark-mode-btn' : ''}
                  >
                    View Link
                  </DropdownItem>
                ))}
              <DropdownItem
                onClick={() => {
                  setSelectedAction('Complete and Remove');
                  toggleVerify();
                }}
                className={darkMode ? 'text-light dark-mode-btn' : ''}
              >
                <FontAwesomeIcon className="team-member-tasks-done" icon={faCheck} /> as complete
                and remove task
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSelectedAction('More Work Needed');
                  toggleVerify();
                }}
                className={darkMode ? 'text-light dark-mode-btn' : ''}
              >
                More work needed, reset this button
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      } else if (user.personId === myUserId) {
        return (
          <Button className="reviewBtn" color="info" disabled>
            Work Submitted and Awaiting Review
          </Button>
        );
      } else {
        return (
          <Button className="reviewBtn" color="success" disabled>
            Ready for Review
          </Button>
        );
      }
    } else {
      return <></>;
    }
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
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
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
          {linkError && <div className="text-danger">{linkError}</div>}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            onClick={e => {
              e.preventDefault();
              if (!link || !validURL(link)) {
                setLinkError("Please enter a valid URL starting with 'https://'.");
                return;
              }

              const validationResult = validateAllowedDomainTypes(link);
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
          <p>{invalidDomainModal.errorMessage}</p>
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
};
export default ReviewButton;
