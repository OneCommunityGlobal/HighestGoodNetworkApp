import { useState, useCallback } from 'react';

export const usePRPromotion = (defaultTeamName = 'PR Review Team') => {
  // State to track the reviewer currently undergoing promotion confirmation
  const [promotingReviewer, setPromotingReviewer] = useState(null);

  // Set to track IDs of reviewers who have been successfully promoted
  const [promotedReviewerIds, setPromotedReviewerIds] = useState(new Set());

  // Handler triggered when the Promote button is clicked
  const handlePromoteClick = useCallback(
    reviewer => {
      setPromotingReviewer({
        id: reviewer.id,
        reviewerId: reviewer.id,
        reviewerName: reviewer.reviewer,
        teamCode: reviewer.teamCode || defaultTeamName,
        teamReviewerName: reviewer.teamLeader || reviewer.teamReviewerName || 'Team Lead',
        // Pass through real history only; an empty list means "no history available".
        weeklyPRs: reviewer.weeklyPRs || [],
      });
    },
    [defaultTeamName],
  );

  // Handler triggered when the promotion is confirmed in the modal
  const handleConfirmPromotion = useCallback(() => {
    setPromotedReviewerIds(prev => {
      const next = new Set(prev);
      if (promotingReviewer) {
        const targetId = promotingReviewer.reviewerId || promotingReviewer.id;
        if (targetId) {
          next.add(targetId);
        }
      }
      return next;
    });
    setPromotingReviewer(null);
  }, [promotingReviewer]);

  // Handler triggered when the promotion confirmation is cancelled
  const handleCancelPromotion = useCallback(() => {
    setPromotingReviewer(null);
  }, []);

  return {
    promotingReviewer,
    promotedReviewerIds,
    handlePromoteClick,
    handleConfirmPromotion,
    handleCancelPromotion,
  };
};
