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
