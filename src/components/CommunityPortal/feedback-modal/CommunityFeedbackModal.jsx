import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';

function CommunityFeedbackModal() {
  const { activityId } = useParams();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Use a simple approach: check if feedback was submitted in this browser session
    // We'll use a combination of localStorage and a session flag
    const submittedKey = `feedback_submitted_${activityId}`;
    const sessionFlag = `session_active_${activityId}`;

    // Check if this is a new session (page refresh or new tab)
    const isNewSession = !sessionStorage.getItem(sessionFlag);

    if (isNewSession) {
      // Clear any existing submission flags for this activity
      localStorage.removeItem(submittedKey);
      // Set session flag
      sessionStorage.setItem(sessionFlag, 'true');
    }

    const alreadySubmitted = localStorage.getItem(submittedKey) === 'true';

    if (alreadySubmitted) {
      setHasSubmitted(true);
    }

    // Set the modal to open when the component mounts
    setIsOpen(true);
  }, [activityId]);

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back to the activities list
    history.push('/communityportal/Activities');
  };

  const handleFeedbackSubmitted = () => {
    // Mark feedback as submitted for this activity
    const submittedKey = `feedback_submitted_${activityId}`;
    localStorage.setItem(submittedKey, 'true');
    setHasSubmitted(true);
  };

  return (
    <div>
      <FeedbackModal
        isOpen={isOpen}
        onClose={handleClose}
        onFeedbackSubmitted={handleFeedbackSubmitted}
        hasSubmitted={hasSubmitted}
        activityId={activityId}
      />
    </div>
  );
}

export default CommunityFeedbackModal;
