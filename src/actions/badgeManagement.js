import axios from 'axios';
import {
  GET_ALL_BADGE_DATA
} from '../constants/badge';
import { ENDPOINTS } from '../utils/URL';


const getAllBadges = (allBadges) => ({
  type: GET_ALL_BADGE_DATA,
  allBadges
})

export const fetchAllBadges = (userId) => {
  return async dispatch => {
    const { data } = await axios.get(ENDPOINTS.BADGE(userId));
    dispatch(getAllBadges(data));
  }
}