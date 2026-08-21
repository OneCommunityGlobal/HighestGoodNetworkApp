import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const getPromotionEligibility = async requestor => {
  const res = await axios.post(ENDPOINTS.PROMOTION_ELIGIBILITY, { requestor });
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
