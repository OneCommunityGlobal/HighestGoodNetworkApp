import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import styles from './FeedbackModal.module.css';

function FeedbackModal({ authUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpRequestId, setHelpRequestId] = useState(null);
  const [receivedHelp, setReceivedHelp] = useState('');
  const [activeMembers, setActiveMembers] = useState([{ name: '', rating: 0, selectedUser: null }]);
  const [inactiveMembers, setInactiveMembers] = useState([
    { name: '', rating: 0, selectedUser: null },
  ]);
  const [comments, setComments] = useState('');

  // Team members data
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Autocomplete states
  const [activeSearchTerm, setActiveSearchTerm] = useState({});
  const [inactiveSearchTerm, setInactiveSearchTerm] = useState({});
  const [showActiveDropdown, setShowActiveDropdown] = useState({});
  const [showInactiveDropdown, setShowInactiveDropdown] = useState({});

  useEffect(() => {
    const checkModal = async () => {
      try {
        const userId = authUser?.userid || 'test-user-id';

        const response = await axios.get(
          `http://localhost:4500/api/helprequest/check-modal/${userId}`,
        );

        if (response.data.shouldShow) {
          setIsOpen(true);
          setHelpRequestId(response.data.helpRequestId);
        }
      } catch (error) {
        // Silently fail - modal simply won't show
      }
    };

    checkModal();
  }, [authUser]);

  // Fetch team members on mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:4500/api/hgnform/ranked');
        setAllTeamMembers(response.data || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClosePermanently = async () => {
    try {
      const userId = authUser?.userid || 'test-user-id';

      await axios.post('http://localhost:4500/api/feedback/close-permanently', { userId });
      toast.success('This modal will not appear again.');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!receivedHelp) {
      toast.error('Please answer if we were able to help you last week.');
      return;
    }

    const userId = authUser?.userid || 'test-user-id';

    const feedbackData = {
      userId,
      helpRequestId,
      receivedHelp,
      activeMembers: activeMembers
        .filter(m => m.name && m.rating > 0)
        .map(m => ({
          name: m.name,
          rating: m.rating,
        })),
      inactiveMembers: inactiveMembers
        .filter(m => m.name && m.rating > 0)
        .map(m => ({
          name: m.name,
          rating: m.rating,
        })),
      comments,
    };

    try {
      await axios.post('http://localhost:4500/api/feedback/submit', feedbackData);
      toast.success('Thank you for your feedback!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleAddActiveMember = () => {
    setActiveMembers([...activeMembers, { name: '', rating: 0, selectedUser: null }]);
  };

  const handleAddInactiveMember = () => {
    setInactiveMembers([...inactiveMembers, { name: '', rating: 0, selectedUser: null }]);
  };

  const handleActiveMemberSearch = (index, value) => {
    setActiveSearchTerm({ ...activeSearchTerm, [index]: value });
    setShowActiveDropdown({ ...showActiveDropdown, [index]: value.length > 0 });

    const updated = [...activeMembers];
    updated[index].name = value;
    setActiveMembers(updated);
  };

  const handleInactiveMemberSearch = (index, value) => {
    setInactiveSearchTerm({ ...inactiveSearchTerm, [index]: value });
    setShowInactiveDropdown({ ...showInactiveDropdown, [index]: value.length > 0 });

    const updated = [...inactiveMembers];
    updated[index].name = value;
    setInactiveMembers(updated);
  };

  const selectActiveMember = (index, user) => {
    // FIX ISSUE #2: Check for duplicates
    const isDuplicate = activeMembers.some(
      (member, idx) => idx !== index && member.selectedUser?._id === user._id,
    );

    if (isDuplicate) {
      toast.warning(`${user.name} is already added!`);
      return;
    }

    const updated = [...activeMembers];
    updated[index].name = user.name;
    updated[index].selectedUser = user;
    setActiveMembers(updated);

    setShowActiveDropdown({ ...showActiveDropdown, [index]: false });
    setActiveSearchTerm({ ...activeSearchTerm, [index]: user.name });
  };

  const selectInactiveMember = (index, user) => {
    // FIX ISSUE #2: Check for duplicates
    const isDuplicate = inactiveMembers.some(
      (member, idx) => idx !== index && member.selectedUser?._id === user._id,
    );

    if (isDuplicate) {
      toast.warning(`${user.name} is already added!`);
      return;
    }

    const updated = [...inactiveMembers];
    updated[index].name = user.name;
    updated[index].selectedUser = user;
    setInactiveMembers(updated);

    setShowInactiveDropdown({ ...showInactiveDropdown, [index]: false });
    setInactiveSearchTerm({ ...inactiveSearchTerm, [index]: user.name });
  };

  const handleActiveMemberRating = (index, rating) => {
    const updated = [...activeMembers];
    updated[index].rating = rating;
    setActiveMembers(updated);
  };

  const handleInactiveMemberRating = (index, rating) => {
    const updated = [...inactiveMembers];
    updated[index].rating = rating;
    setInactiveMembers(updated);
  };

  const getFilteredMembers = (searchTerm, isActive = true) => {
    if (!searchTerm || searchTerm.length < 2) return [];

    return allTeamMembers
      .filter(member => {
        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = member.isActive === isActive; // FIX ISSUE #8: Filter by active status
        return matchesSearch && matchesStatus;
      })
      .slice(0, 10);
  };

  const renderStarRating = (currentRating, onRatingChange) => {
    return (
      <div className={styles['star-rating']}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`${styles.star} ${star <= currentRating ? styles.selected : ''}`}
            onClick={() => onRatingChange(star)}
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRatingChange(star);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderMemberInput = (member, index, isActive = true) => {
    const searchTerm = isActive ? activeSearchTerm[index] || '' : inactiveSearchTerm[index] || '';
    const showDropdown = isActive ? showActiveDropdown[index] : showInactiveDropdown[index];
    const filteredMembers = getFilteredMembers(searchTerm, isActive);

    const handleSearch = value => {
      if (isActive) {
        handleActiveMemberSearch(index, value);
      } else {
        handleInactiveMemberSearch(index, value);
      }
    };

    const selectMember = user => {
      if (isActive) {
        selectActiveMember(index, user);
      } else {
        selectInactiveMember(index, user);
      }
    };

    const handleRating = rating => {
      if (isActive) {
        handleActiveMemberRating(index, rating);
      } else {
        handleInactiveMemberRating(index, rating);
      }
    };

    return (
      <div key={index} className={styles['member-rating-row']}>
        <div className={styles['autocomplete-wrapper']}>
          <Input
            type="text"
            placeholder="Full Name"
            value={member.name}
            onChange={e => handleSearch(e.target.value)}
            onBlur={() => {
              setTimeout(() => {
                if (isActive) {
                  setShowActiveDropdown({ ...showActiveDropdown, [index]: false });
                } else {
                  setShowInactiveDropdown({ ...showInactiveDropdown, [index]: false });
                }
              }, 300); // INCREASED FROM 200ms TO 300ms
            }}
            onFocus={() => {
              if (searchTerm.length > 0) {
                if (isActive) {
                  setShowActiveDropdown({ ...showActiveDropdown, [index]: true });
                } else {
                  setShowInactiveDropdown({ ...showInactiveDropdown, [index]: true });
                }
              }
            }}
            className={styles['name-input']}
          />

          {showDropdown && filteredMembers.length > 0 && (
            <div className={styles['autocomplete-dropdown']}>
              {filteredMembers.map(user => (
                <div
                  key={user._id}
                  className={styles['autocomplete-item']}
                  onMouseDown={() => selectMember(user)} // CHANGED FROM onClick
                  onKeyPress={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      selectMember(user);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <strong>{user.name}</strong>
                  <div className={styles['user-details']}>
                    Score: {user.score}/10 | Skills: {user.topSkills.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {renderStarRating(member.rating, handleRating)}
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading feedback form...</div>;
  }

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" className={styles['feedback-modal']}>
      <ModalHeader toggle={handleClose}>Help Request Feedback</ModalHeader>
      <ModalBody>
        {/* Question: Were we able to help you? */}
        <div className={styles.section}>
          <h5>Were we able to help you last week?</h5>
          <div className={styles['radio-group']}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <input
                type="radio"
                name="receivedHelp"
                value="yes"
                checked={receivedHelp === 'yes'}
                onChange={e => setReceivedHelp(e.target.value)}
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <input
                type="radio"
                name="receivedHelp"
                value="no"
                checked={receivedHelp === 'no'}
                onChange={e => setReceivedHelp(e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        {/* Section: Rate Active Members */}
        <div className={styles.section}>
          <h5>
            Please specify who you contacted, including those who didn&apos;t assist you, and
            provide a star rating based on your experience
          </h5>
          {activeMembers.map((member, index) => renderMemberInput(member, index, true))}
          <Button color="primary" onClick={handleAddActiveMember} className={styles['add-button']}>
            Add another entry
          </Button>
        </div>

        {/* Section: Rate Inactive Members */}
        <div className={styles.section}>
          <h5>Can&apos;t find who you were looking for? Check Inactive members</h5>
          {inactiveMembers.map((member, index) => renderMemberInput(member, index, false))}
          <Button
            color="primary"
            onClick={handleAddInactiveMember}
            className={styles['add-button']}
          >
            Add another entry
          </Button>
        </div>

        {/* Additional Comments */}
        <div className={styles.section}>
          <h5>Additional comments</h5>
          <Input
            type="textarea"
            placeholder="Want to send a special shout out to someone who helped you? Let us know here!"
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', marginBottom: '8px' }}>
            {comments.length}/1000 characters
          </p>
          <p className={styles['suggestion-link']}>
            If you have any suggestions please click{' '}
            <a href="/suggestions" target="_blank" rel="noopener noreferrer">
              here
            </a>
          </p>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button color="danger" onClick={handleClosePermanently}>
          Found help another way. Close Permanently
        </Button>
      </ModalFooter>
    </Modal>
  );
}

FeedbackModal.propTypes = {
  authUser: PropTypes.shape({
    userid: PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

export default connect(mapStateToProps)(FeedbackModal);
