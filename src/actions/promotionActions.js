import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const getPromotionEligibility = async () => {
  const res = await axios.get(ENDPOINTS.PROMOTION_ELIGIBILITY);
  return res.data;
};

export const postPromotionEligibility = async selectedReviewers => {
  const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS, { users: selectedReviewers });
  return res.data;
};
