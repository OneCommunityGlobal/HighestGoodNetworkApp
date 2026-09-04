import { useState, useCallback } from 'react';

export const usePRPromotion = (defaultTeamName = 'PR Review Team') => {
  const [promotingReviewer, setPromotingReviewer] = useState(null);
  const [promotedReviewerIds, setPromotedReviewerIds] = useState(new Set());

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

  const handleConfirmPromotion = useCallback(
    (_name, reviewerId) => {
      setPromotedReviewerIds(prev => {
        const next = new Set(prev);
        const targetId =
          reviewerId ||
          (promotingReviewer ? promotingReviewer.reviewerId || promotingReviewer.id : null);
        if (targetId) {
          next.add(targetId);
        }
        return next;
      });
      setPromotingReviewer(null);
    },
    [promotingReviewer],
  );

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
