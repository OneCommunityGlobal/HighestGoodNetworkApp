import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import './FeedbackModal.css';
import StarRating from './StarRating';
import MemberSearchBar from './MemberSearchBar';

function FeedbackModal() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const [isOpen, setIsOpen] = useState(true);
  const [receivedHelp, setReceivedHelp] = useState('');
  const [ratedMembers, setRatedMembers] = useState([{ id: 'active-1', name: '', rating: 0 }]);
  const [inactiveRatedMembers, setInactiveRatedMembers] = useState([
    { id: 'inactive-1', name: '', rating: 0 },
  ]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);

  // Use refs to maintain counters for unique IDs
  const nextActiveIdRef = useRef(2);
  const nextInactiveIdRef = useRef(2);

  // Fetch user names from API
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const response = await axios.get(
          `${ENDPOINTS.APIEndpoint()}/dashboard/questionaire/userNamesList`,
        );
        if (response.data && response.data.users) {
          const users = response.data.users;
          setAllUsers(users);

          // Separate active and inactive users
          const active = users.filter(user => user.isActive);
          const inactive = users.filter(user => !user.isActive);

          setActiveUsers(active);
          setInactiveUsers(inactive);
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };

    fetchUserNames();
  }, []);

  // Placeholder for getting help request status
  useEffect(() => {
    // In a real implementation, this would check if a help request was made a week ago
    // For now, we're just showing the modal when navigating to the dashboard
    const checkHelpRequest = () => {
      // This would be replaced with actual API call to check if user made a help request a week ago
      const hasUncompletedFeedback = localStorage.getItem('feedbackNeeded') === 'true';
      const feedbackCompleted = localStorage.getItem('feedbackCompleted') === 'true';

      if (hasUncompletedFeedback && !feedbackCompleted) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set feedback needed to true for demo purposes
    if (localStorage.getItem('feedbackNeeded') === null) {
      localStorage.setItem('feedbackNeeded', 'true');
    }

    checkHelpRequest();
  }, []);

  const handleSubmit = async () => {
    if (!userProfile || !userProfile._id) {
      console.error('User ID not available');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the rated members data for the API
      const peopleYouContacted = [...ratedMembers, ...inactiveRatedMembers]
        .filter(member => member.name.trim() !== '')
        .map(member => ({
          fullName: member.name,
          rating: member.rating,
          isActive: !member.id.includes('inactive'),
        }));

      // Prepare the request payload
      const payload = {
        userId: userProfile._id,
        haveYouRecievedHelpLastWeek: receivedHelp,
        peopleYouContacted,
        additionalComments: comments,
        foundHelpSomeWhereClosePermanently: false,
        daterequestedFeedback: new Date().toISOString(),
      };

      // Make the API call
      await axios.post(
        `${ENDPOINTS.APIEndpoint()}/dashboard/questionaire/feedbackrequest`,
        payload,
      );

      // Mark feedback as completed
      localStorage.setItem('feedbackCompleted', 'true');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForever = async () => {
    if (!userProfile || !userProfile._id) {
      console.error('User ID not available');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request payload
      const payload = {
        userId: userProfile._id,
        foundHelpSomeWhereClosePermanently: true,
      };

      // Make the API call
      await axios.post(
        `${ENDPOINTS.APIEndpoint()}/dashboard/questionaire/checkUserFoundHelpSomewhere`,
        payload,
      );

      // Mark feedback as completed and prevent it from showing again
      localStorage.setItem('feedbackCompleted', 'true');
      setIsOpen(false);
    } catch (error) {
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
      // Ensure we don't remove the last entry
      if (inactiveRatedMembers.length <= 1) return;

      setInactiveRatedMembers(inactiveRatedMembers.filter(member => member.id !== id));
    } else {
      // Ensure we don't remove the last entry
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
    // Set a flag in localStorage with a timestamp to ensure it's recognized as a new request
    // This ensures repeated clicks will work and helps prevent unexpected popups
    localStorage.setItem('openSuggestionsModal', Date.now().toString());

    // Close the current feedback modal
    setIsOpen(false);

    // If we're not on the dashboard, redirect there
    if (!window.location.hash.includes('/dashboard')) {
      window.location.href = '/#/dashboard';
    } else {
      // If we're already on the dashboard, force a refresh of the SummaryBar
      // by dispatching a custom event that it can listen for
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
        <div className="feedback-form">
          <FormGroup tag="fieldset" className="mb-4">
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

          <div className="member-rating-section mt-4">
            <h5>
              Please specify who you contacted, including those who didn&apos;t assist you, and
              provide a star rating based on your experience
            </h5>

            {ratedMembers.map(member => (
              <div key={member.id} className="member-rating-row">
                <div className="member-input-container">
                  <MemberSearchBar
                    id={member.id}
                    value={member.name}
                    onChange={value => handleMemberChange(member.id, value)}
                    usersList={activeUsers}
                  />
                </div>
                <div className="rating-container">
                  <StarRating
                    id={member.id}
                    rating={member.rating}
                    onChange={rating => handleRatingChange(member.id, rating)}
                  />
                </div>
                <div className="remove-btn-container">
                  <button
                    type="button"
                    className="remove-entry-btn"
                    onClick={() => removeMember(member.id)}
                    disabled={ratedMembers.length <= 1}
                    aria-label="Remove entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center">
              <Button
                color="primary"
                className="add-member-btn"
                onClick={() => addNewMember(false)}
              >
                Add another entry
              </Button>
            </div>
          </div>

          <div className="inactive-members-section mt-4">
            <h5>Can&apos;t find who you were looking for? Check Inactive members</h5>

            {inactiveRatedMembers.map(member => (
              <div key={member.id} className="member-rating-row">
                <div className="member-input-container">
                  <MemberSearchBar
                    id={member.id}
                    value={member.name}
                    onChange={value => handleMemberChange(member.id, value, true)}
                    inactive
                    usersList={inactiveUsers}
                  />
                </div>
                <div className="rating-container">
                  <StarRating
                    id={member.id}
                    rating={member.rating}
                    onChange={rating => handleRatingChange(member.id, rating, true)}
                  />
                </div>
                <div className="remove-btn-container">
                  <button
                    type="button"
                    className="remove-entry-btn"
                    onClick={() => removeMember(member.id, true)}
                    disabled={inactiveRatedMembers.length <= 1}
                    aria-label="Remove entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center">
              <Button color="primary" className="add-member-btn" onClick={() => addNewMember(true)}>
                Add another entry
              </Button>
            </div>
          </div>

          <div className="comments-section mt-4">
            <h5>Additional comments</h5>
            <Input
              type="textarea"
              rows="5"
              placeholder="Want to send a special shout out to someone who helped you? Let us know here!"
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
          </div>

          <div className="suggestions-link mt-3 text-center">
            <p>
              If you have any suggestions please click{' '}
              <button type="button" className="link-button" onClick={openFeedbackSuggestions}>
                here
              </button>
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        <Button
          color="danger"
          className="mr-auto"
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
