import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { ENDPOINTS } from '../../utils/URL';
import styles from './FeedbackModal.module.css';
import MemberSearchBar from './MemberSearchBar';
import StarRating from './StarRating';

function FeedbackModal() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const [isOpen, setIsOpen] = useState(false); // ← start as false, let API decide
  const [receivedHelp, setReceivedHelp] = useState('');
  const [ratedMembers, setRatedMembers] = useState([{ id: 'active-1', name: '', rating: 0 }]);
  const [inactiveRatedMembers, setInactiveRatedMembers] = useState([
    { id: 'inactive-1', name: '', rating: 0 },
  ]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);

  const nextActiveIdRef = useRef(2);
  const nextInactiveIdRef = useRef(2);

  // Check backend if modal should show
  useEffect(() => {
    const checkHelpRequest = async () => {
      try {
        const response = await axios.get(ENDPOINTS.QUESTIONNAIRE_CHECK_MODAL(userProfile._id));
        if (response.data.showModal) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking help request:', error);
        setIsOpen(false);
      }
    };

    if (userProfile?._id) {
      checkHelpRequest();
    }
  }, [userProfile]);

  // Fetch active and inactive user names
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const response = await axios.get(ENDPOINTS.QUESTIONNAIRE_USER_NAMES_LIST());
        if (response.data && response.data.users) {
          const { users } = response.data;
          setActiveUsers(users.filter(user => user.isActive));
          setInactiveUsers(users.filter(user => !user.isActive));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user names:', error);
      }
    };

    fetchUserNames();
  }, []);

  const handleSubmit = async () => {
    if (!userProfile || !userProfile._id) {
      // eslint-disable-next-line no-console
      console.error('User ID not available');
      return;
    }

    // Validate that all filled member names are valid users from the list
    const allUsers = [...activeUsers, ...inactiveUsers];

    const invalidActive = ratedMembers.find(
      m =>
        m.name.trim() !== '' &&
        !allUsers.some(
          u => `${u.firstName} ${u.lastName}`.toLowerCase() === m.name.trim().toLowerCase(),
        ),
    );

    const invalidInactive = inactiveRatedMembers.find(
      m =>
        m.name.trim() !== '' &&
        !allUsers.some(
          u => `${u.firstName} ${u.lastName}`.toLowerCase() === m.name.trim().toLowerCase(),
        ),
    );

    if (invalidActive || invalidInactive) {
      toast.warn('Please select valid members from the dropdown only.');
      return;
    }
    console.log('allUsers:', allUsers);
    console.log('ratedMembers:', ratedMembers);
    console.log('invalidActive:', invalidActive);
    console.log('invalidInactive:', invalidInactive);

    setIsSubmitting(true);

    try {
      const peopleYouContacted = [...ratedMembers, ...inactiveRatedMembers]
        .filter(member => member.name.trim() !== '')
        .map(member => ({
          fullName: member.name,
          rating: member.rating,
          isActive: !member.id.includes('inactive'),
        }));

      const payload = {
        userId: userProfile._id,
        haveYouRecievedHelpLastWeek: receivedHelp,
        peopleYouContacted,
        additionalComments: comments,
        foundHelpSomeWhereClosePermanently: false,
        daterequestedFeedback: new Date().toISOString(),
      };

      await axios.post(ENDPOINTS.QUESTIONNAIRE_FEEDBACK_REQUEST(), payload);
      setIsOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForever = async () => {
    if (!userProfile || !userProfile._id) {
      // eslint-disable-next-line no-console
      console.error('User ID not available');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: userProfile._id,
        foundHelpSomeWhereClosePermanently: true,
      };

      await axios.post(ENDPOINTS.QUESTIONNAIRE_CLOSE_PERMANENTLY(), payload);
      setIsOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error closing feedback permanently:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewMember = (isInactive = false) => {
    if (isInactive) {
      const newId = `inactive-${nextInactiveIdRef.current}`;
      nextInactiveIdRef.current += 1;
      setInactiveRatedMembers([...inactiveRatedMembers, { id: newId, name: '', rating: 0 }]);
    } else {
      const newId = `active-${nextActiveIdRef.current}`;
      nextActiveIdRef.current += 1;
      setRatedMembers([...ratedMembers, { id: newId, name: '', rating: 0 }]);
    }
  };

  const removeMember = (id, isInactive = false) => {
    if (isInactive) {
      if (inactiveRatedMembers.length <= 1) return;
      setInactiveRatedMembers(inactiveRatedMembers.filter(member => member.id !== id));
    } else {
      if (ratedMembers.length <= 1) return;
      setRatedMembers(ratedMembers.filter(member => member.id !== id));
    }
  };

  const handleMemberChange = (id, value, isInactive = false) => {
    if (isInactive) {
      setInactiveRatedMembers(
        inactiveRatedMembers.map(member =>
          member.id === id ? { ...member, name: value } : member,
        ),
      );
    } else {
      setRatedMembers(
        ratedMembers.map(member => (member.id === id ? { ...member, name: value } : member)),
      );
    }
  };

  const handleRatingChange = (id, rating, isInactive = false) => {
    if (isInactive) {
      setInactiveRatedMembers(
        inactiveRatedMembers.map(member => (member.id === id ? { ...member, rating } : member)),
      );
    } else {
      setRatedMembers(
        ratedMembers.map(member => (member.id === id ? { ...member, rating } : member)),
      );
    }
  };

  const openFeedbackSuggestions = () => {
    localStorage.setItem('openSuggestionsModal', Date.now().toString());
    setIsOpen(false);

    if (!window.location.hash.includes('/dashboard')) {
      window.location.href = '/#/dashboard';
    } else {
      window.dispatchEvent(new CustomEvent('openSuggestionModal'));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} size="lg" className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader
        className={darkMode ? 'bg-space-cadet text-light' : ''}
        toggle={() => setIsOpen(false)}
      >
        <h4>Help Request Feedback</h4>
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        <div className={`${styles.feedbackForm}`}>
          <FormGroup tag="fieldset" className={styles['mb-4']}>
            <legend>Were we able to help you last week?</legend>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="receivedHelp"
                  value="Yes"
                  onChange={e => setReceivedHelp(e.target.value)}
                />{' '}
                Yes
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="receivedHelp"
                  value="No"
                  onChange={e => setReceivedHelp(e.target.value)}
                />{' '}
                No
              </Label>
            </FormGroup>
          </FormGroup>

          <div className={`${styles.memberRatingSection} mt-4`}>
            <h5>
              Please specify who you contacted, including those who didn&apos;t assist you, and
              provide a star rating based on your experience
            </h5>

            {ratedMembers.map(member => (
              <div key={member.id} className={`${styles.memberRatingRow}`}>
                <div className={`${styles.memberInputContainer}`}>
                  <MemberSearchBar
                    id={member.id}
                    value={member.name}
                    onChange={value => handleMemberChange(member.id, value)}
                    usersList={activeUsers}
                  />
                </div>
                <div className={`${styles.ratingContainer}`}>
                  <StarRating
                    id={member.id}
                    rating={member.rating}
                    onChange={rating => handleRatingChange(member.id, rating)}
                  />
                </div>
                <div className={`${styles.removeBtnContainer}`}>
                  <button
                    type="button"
                    className={`${styles.removeEntryBtn}`}
                    onClick={() => removeMember(member.id)}
                    disabled={ratedMembers.length <= 1}
                    aria-label="Remove entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className={`${styles.textCenter}`}>
              <Button
                color="primary"
                className={`${styles.addMemberBtn}`}
                onClick={() => addNewMember(false)}
              >
                Add another entry
              </Button>
            </div>
          </div>

          <div className={`${styles.inactiveMembersSection} mt-4`}>
            <h5>Can&apos;t find who you were looking for? Check Inactive members</h5>

            {inactiveRatedMembers.map(member => (
              <div key={member.id} className={`${styles.memberRatingRow}`}>
                <div className={`${styles.memberInputContainer}`}>
                  <MemberSearchBar
                    id={member.id}
                    value={member.name}
                    onChange={value => handleMemberChange(member.id, value, true)}
                    inactive
                    usersList={inactiveUsers}
                  />
                </div>
                <div className={`${styles.ratingContainer}`}>
                  <StarRating
                    id={member.id}
                    rating={member.rating}
                    onChange={rating => handleRatingChange(member.id, rating, true)}
                  />
                </div>
                <div className={`${styles.removeBtnContainer}`}>
                  <button
                    type="button"
                    className={`${styles.removeEntryBtn}`}
                    onClick={() => removeMember(member.id, true)}
                    disabled={inactiveRatedMembers.length <= 1}
                    aria-label="Remove entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className={`${styles.textCenter}`}>
              <Button
                color="primary"
                className={`${styles.addMemberBtn}`}
                onClick={() => addNewMember(true)}
              >
                Add another entry
              </Button>
            </div>
          </div>

          <div className={`${styles.commentsSection} mt-4`}>
            <h5>Additional comments</h5>
            <Input
              type="textarea"
              rows="5"
              placeholder="Want to send a special shout out to someone who helped you? Let us know here!"
              value={comments}
              onChange={e => setComments(e.target.value)}
              maxLength={1000}
            />
            <small className="text-muted">{comments.length}/1000 characters</small>
          </div>

          <div className={`${styles.suggestionsLink} mt-3 ${styles.textCenter}`}>
            <p>
              If you have any suggestions please click{' '}
              <button
                type="button"
                className={`${styles.linkButton}`}
                onClick={openFeedbackSuggestions}
              >
                here
              </button>
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        <Button
          color="danger"
          className={styles['mr-auto']}
          onClick={handleCloseForever}
          disabled={isSubmitting}
        >
          Found help another way. Close Permanently
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={!receivedHelp || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default FeedbackModal;
