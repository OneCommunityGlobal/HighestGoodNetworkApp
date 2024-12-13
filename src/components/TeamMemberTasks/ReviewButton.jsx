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
} from 'reactstrap';
import { useSelector } from 'react-redux';
import './style.css';
import './reviewButton.css';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ApiEndpoint } from 'utils/URL';
import httpService from '../../services/httpService';

function ReviewButton({ user, task, updateTask, userPermission }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [linkError, setLinkError] = useState(null);
  const myUserId = useSelector(state => state.auth.user.userid);
  const myRole = useSelector(state => state.auth.user.role);
  const [modal, setModal] = useState(false);
  const [link, setLink] = useState('');
  const [verifyModal, setVerifyModal] = useState(false);
  const [, setSelectedAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false); // New state for the final confirmation modal

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

  const validURL = url => {
    try {
      if (url === '') return false;

      const pattern = /^(?=.{20,})(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
      return pattern.test(url);
    } catch (err) {
      return false;
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

  const reviewStatus = useMemo(() => {
    const resource = task.resources.find(r => r.userID === user.personId);
    return resource?.reviewStatus || 'Unsubmitted';
  }, [task, user]);

  const updReviewStat = newStatus => {
    const resources = [...task.resources];
    const newResources = resources.map(resource => {
      const newResource = { ...resource, reviewStatus: newStatus };
      newResource.completedTask = newStatus === 'Reviewed';
      return newResource;
    });
    let updatedTask = { ...task, resources: newResources };
    // Add relatedWorkLinks to existing tasks
    if (!Array.isArray(task.relatedWorkLinks)) {
      // eslint-disable-next-line no-param-reassign
      task.relatedWorkLinks = [];
    }

    if (newStatus === 'Submitted' && link) {
      if (validURL(link)) {
        updatedTask = { ...updatedTask, relatedWorkLinks: [...task.relatedWorkLinks, link] };
        setLink('');
      } else {
        // eslint-disable-next-line no-alert
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
    if (validURL(link)) {
      // Show confirmation modal instead of submitting immediately
      toggleConfirmSubmitModal();
    } else {
      // eslint-disable-next-line no-alert
      alert('Invalid URL. Please enter a valid URL of at least 20 characters');
      setIsSubmitting(false);
    }
  };

  const sendReviewReq = () => {
    const data = {};
    data.myUserId = myUserId;
    data.name = user.name;
    data.taskName = task.taskName;
    httpService.post(`${ApiEndpoint}/tasks/reviewreq/${myUserId}`, data);
  };

  const handleFinalSubmit = () => {
    // Submit the review and link after confirming in the second modal
    updReviewStat('Submitted');
    toggleConfirmSubmitModal();
    sendReviewReq();
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
    }
    if (reviewStatus === 'Submitted') {
      if (
        myRole === 'Owner' ||
        myRole === 'Administrator' ||
        myRole === 'Mentor' ||
        myRole === 'Manager' ||
        userPermission
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
                task.relatedWorkLinks.map(relatedLink => (
                  <DropdownItem
                    key={relatedLink} // Use the `link` value as the key, assuming it's unique
                    href={relatedLink}
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
      }
      if (user.personId === myUserId) {
        return (
          <Button className="reviewBtn" color="info" disabled>
            Work Submitted and Awaiting Review
          </Button>
        );
      }
      return (
        <Button className="reviewBtn" color="success" disabled>
          Ready for Review
        </Button>
      );
    }
    return null;
  };

  return (
    <>
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
      {buttonFormat()}
    </>
  );
}
export default ReviewButton;
