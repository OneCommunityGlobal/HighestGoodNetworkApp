import axios from 'axios';
// import { ENDPOINTS } from '../utils/URL';

export const getPromotionEligibility = async () => {
  // const res = await axios.get(ENDPOINTS.PROMOTION_ELIGIBILITY);
  const res = await axios.get('http://localhost:4500/api/promotion-eligibility');
  return res.data;
};

export const postPromotionEligibility = async selectedReviewers => {
  // const res = await axios.post(ENDPOINTS.PROMOTE_MEMBERS, { users: selectedReviewers });
  const res = await axios.post('http://localhost:4500/api/promote-members', {
    users: selectedReviewers,
  });
  return res.data;
};