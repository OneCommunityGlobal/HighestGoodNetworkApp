import axios from 'axios';
import {
  GET_ALL_BADGE_DATA,
  ADD_SELECT_BADGE,
  REMOVE_SELECT_BADGE,
  GET_USER_TO_BE_ASSIGNED
} from '../constants/badge';
import { ENDPOINTS } from '../utils/URL';


const getAllBadges = allBadges => ({
  type: GET_ALL_BADGE_DATA,
  allBadges,
});

export const fetchAllBadges = userId => async (dispatch) => {
  const { data } = await axios.get(ENDPOINTS.BADGE(userId));
  dispatch(getAllBadges(data));
};

export const addSelectBadge = badgeId => ({
  type: ADD_SELECT_BADGE,
  badgeId,
});

export const removeSelectBadge = badgeId => ({
  type: REMOVE_SELECT_BADGE,
  badgeId,
});


export const getUserToBeAssigned = userAssigned => ({
  type: GET_USER_TO_BE_ASSIGNED,
  userAssigned
})

/**
 * Assigning badge(s) to an existing user
 */

export const assignBadges = async (userAssigned, selectedBadges) => {
  const res = await axios.get(ENDPOINTS.USER_PROFILE_BY_NAME(userAssigned));
  const badgeCollection = res.data[0].badgeCollection;
  const UserToBeAssigned = res.data[0]._id;

  selectedBadges.forEach((badgeId) => {
    let included = false;
    badgeCollection.forEach((badgeObj) => {
      if (badgeId === badgeObj.badge) {
        badgeObj.count++;
        badgeObj.lastModified = Date.now();
        included = true;
      }
    });
    if (!included) {
      badgeCollection.push({ badge: badgeId, count: 1, lastModified: Date.now() });
    }
  });

  const url = ENDPOINTS.BADGE_ASSIGN(UserToBeAssigned);
  await axios.put(url, { badgeCollection });
};