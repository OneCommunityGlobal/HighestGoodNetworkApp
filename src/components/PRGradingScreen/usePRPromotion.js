import { useState, useCallback } from 'react';

export const usePRPromotion = (defaultTeamName = 'PR Review Team') => {
  // State to track the reviewer currently undergoing promotion confirmation
  const [promotingReviewer, setPromotingReviewer] = useState(null);

  // Set to track IDs of reviewers who have been successfully promoted
  const [promotedReviewerIds, setPromotedReviewerIds] = useState(new Set());

  // Handler triggered when the Promote button is clicked
  const handlePromoteClick = useCallback(
    reviewer => {
      const currentCount = reviewer.gradedPrs
        ? reviewer.gradedPrs.length
        : reviewer.prsReviewed || 0;

      setPromotingReviewer({
        id: reviewer.id,
        reviewerId: reviewer.id,
        reviewerName: reviewer.reviewer,
        teamCode: reviewer.teamCode || defaultTeamName,
        teamReviewerName: reviewer.teamLeader || reviewer.teamReviewerName || 'Team Lead',
        weeklyPRs: reviewer.weeklyPRs || [
          { week: 'Week 1', count: currentCount },
          { week: 'Week 2', count: Math.max(0, currentCount - 1) },
          { week: 'Week 3', count: currentCount >= 8 ? 9 : 5 },
        ],
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
