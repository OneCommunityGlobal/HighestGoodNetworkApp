import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const getPromotionEligibility = async (requestor, groupKey) => {
  const res = await axios.post(ENDPOINTS.PROMOTION_ELIGIBILITY, { requestor, groupKey });
  return res.data;
};

export const postPromotionEligibility = async (memberIds, requestor, placements) => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS, {
    memberIds,
    requestor,
    ...(placements ? { placements } : {}),
  });
  return res.data;
};

export const previewPromotions = async (memberIds, requestor) => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS_PREVIEW, {
    memberIds,
    requestor,
  });
  return res.data;
};

export const getReviewerGroups = async requestor => {
  const res = await axios.post(ENDPOINTS.REVIEWER_GROUPS, { requestor });
  return res.data;
};

export const createReviewerGroup = async (requestor, { label, rangeStart, rangeEnd }) => {
  const res = await axios.post(ENDPOINTS.REVIEWER_GROUPS_NEW, {
    requestor,
    label,
    rangeStart,
    rangeEnd,
  });
  return res.data;
};

export const updateReviewerGroup = async (requestor, groupKey, { label, rangeStart, rangeEnd }) => {
  const res = await axios.patch(ENDPOINTS.REVIEWER_GROUP_UPDATE(groupKey), {
    requestor,
    label,
    rangeStart,
    rangeEnd,
  });
  return res.data;
};

export const updatePrsNeeded = async (requestor, reviewerId, prsNeeded) => {
  const res = await axios.patch(ENDPOINTS.PRS_NEEDED_UPDATE(reviewerId), {
    requestor,
    prsNeeded,
  });
  return res.data;
};

export const getPrRatings = async requestor => {
  const res = await axios.post(ENDPOINTS.PR_RATINGS, { requestor });
  return res.data;
};

export const getPrEntriesForReviewers = async (requestor, reviewerIds) => {
  const res = await axios.post(ENDPOINTS.PR_ENTRIES_BULK, { requestor, reviewerIds });
  return res.data;
};

export const getPrEntries = async (requestor, reviewerId) => {
  const res = await axios.post(ENDPOINTS.PR_ENTRIES(reviewerId), { requestor });
  return res.data;
};

export const addPrEntry = async (requestor, reviewerId, { prNumber, rating, year, week }) => {
  const res = await axios.post(ENDPOINTS.PR_ENTRY_NEW(reviewerId), {
    requestor,
    prNumber,
    rating,
    year,
    week,
  });
  return res.data;
};

export const updatePrEntryRating = async (requestor, entryId, rating) => {
  const res = await axios.patch(ENDPOINTS.PR_ENTRY_RATING(entryId), { requestor, rating });
  return res.data;
};

export const importPrEntriesFromSummary = async (requestor, reviewerId) => {
  const res = await axios.post(ENDPOINTS.PR_ENTRY_IMPORT(reviewerId), { requestor });
  return res.data;
};

// For the promotion confirmation modal's manual team-override dropdown. Reuses the same
// endpoint as getAllUserTeams (src/actions/allTeamsAction.js) via a plain GET, consistent
// with this file's non-Redux style rather than wiring a thunk for one read.
export const getTeamsForPlacement = async () => {
  const res = await axios.get(ENDPOINTS.TEAM);
  return res.data;
};
