import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const getPromotionEligibility = async requestor => {
  const res = await axios.post(ENDPOINTS.PROMOTION_ELIGIBILITY, {
    requestor,
  });
  return res.data;
};

export const postPromotionEligibility = async (memberIds, requestor) => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS, {
    memberIds,
    requestor,
  });
  return res.data;
};

export const fetchReviewerGroups = async () => {
  const res = await axios.post(ENDPOINTS.REVIEWER_GROUPS);
  return res.data;
};

export const createReviewerGroup = async groupData => {
  const res = await axios.post(ENDPOINTS.REVIEWER_GROUPS_NEW, groupData);
  return res.data;
};

export const updateReviewerGroup = async (groupKey, groupData) => {
  const res = await axios.patch(`${ENDPOINTS.REVIEWER_GROUPS}/${groupKey}`, groupData);
  return res.data;
};

/* =========================================================
   PR GRADING
   ========================================================= */

/**
 * Get PR entries for multiple reviewers.
 *
 * Backend:
 * POST /api/promotion-eligibility/pr-entries
 */
export const fetchPREntriesBulk = async (reviewerIds, currentUser) => {
  const res = await axios.post(ENDPOINTS.PROMOTION_PR_ENTRIES_BULK, {
    reviewerIds,
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Get the available PR rating options.
 *
 * Backend:
 * POST /api/promotion-eligibility/pr-ratings
 */
export const fetchPRRatings = async currentUser => {
  const res = await axios.post(ENDPOINTS.PR_RATINGS, {
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Get PR entries for a single reviewer.
 *
 * Backend:
 * POST /api/promotion-eligibility/:reviewerId/pr-entries
 */
export const fetchPREntries = async (reviewerId, currentUser) => {
  const res = await axios.post(ENDPOINTS.PROMOTION_PR_ENTRIES(reviewerId), {
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Manually add a PR entry.
 *
 * Backend:
 * POST /api/promotion-eligibility/:reviewerId/pr-entries/new
 */
export const addPREntry = async (reviewerId, prNumber, currentUser) => {
  const res = await axios.post(ENDPOINTS.PR_GRADING_ADD_ENTRY(reviewerId), {
    prNumber,
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Import PR entries from the weekly summary.
 *
 * Backend:
 * POST /api/promotion-eligibility/:reviewerId/pr-entries/import
 */
export const importPREntries = async (reviewerId, currentUser) => {
  const res = await axios.post(`${ENDPOINTS.PROMOTION_PR_ENTRIES(reviewerId)}/import`, {
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Update or clear a PR rating.
 *
 * Backend:
 * PATCH /api/promotion-eligibility/pr-entries/:entryId/rating
 */
export const updatePRRating = async (entryId, rating, currentUser) => {
  const res = await axios.patch(ENDPOINTS.PR_GRADING_UPDATE_RATING(entryId), {
    rating,
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Owner override for PRs Needed.
 *
 * Sending a number sets an override.
 * Sending null clears the override and returns to automatic
 * committed-hours calculation.
 *
 * Backend:
 * PATCH /api/promotion-eligibility/:reviewerId/prs-needed
 */
export const updatePRsNeeded = async (reviewerId, prsNeeded, currentUser) => {
  const res = await axios.patch(`${ENDPOINTS.PROMOTION_ELIGIBILITY}/${reviewerId}/prs-needed`, {
    prsNeeded,
    requestor: {
      requestorId: currentUser?.userid,
    },
  });

  return res.data;
};

/**
 * Preview promotion team placements.
 *
 * Backend:
 * POST /api/promote-members/preview
 *
 * This does NOT promote anyone or modify team membership.
 */
export const previewPromotionEligibility = async (memberIds, requestor) => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS_PREVIEW, {
    memberIds,
    requestor,
  });

  return res.data;
};

/**
 * Process promotions and optionally assign reviewers to teams.
 *
 * Backend:
 * POST /api/promote-members
 *
 * placements:
 * [
 *   {
 *     reviewerId: '...',
 *     teamId: '...'
 *   }
 * ]
 */
export const processPromotions = async (memberIds, requestor, placements) => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS, {
    memberIds,
    requestor,
    placements,
  });

  return res.data;
};
