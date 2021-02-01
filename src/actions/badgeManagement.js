import axios from 'axios';
import {
  GET_ALL_BADGE_DATA,
  ADD_SELECT_BADGE,
  REMOVE_SELECT_BADGE,
  CLEAR_NAME_AND_SELECTED,
  GET_USER_TO_BE_ASSIGNED,
  GET_MESSAGE,
  CLOSE_ALERT
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

export const closeAlert = () => {
  return dispatch => {
    dispatch(gotCloseAlert());
  }
}

export const addSelectBadge = badgeId => ({
  type: ADD_SELECT_BADGE,
  badgeId,
});

export const removeSelectBadge = badgeId => ({
  type: REMOVE_SELECT_BADGE,
  badgeId,
});

export const clearNameAndSelected = () => ({
  type: CLEAR_NAME_AND_SELECTED,
});


export const getUserToBeAssigned = userAssigned => ({
  type: GET_USER_TO_BE_ASSIGNED,
  userAssigned
})


export const getMessage = (message, color) => ({
  type: GET_MESSAGE,
  message,
  color
})

export const gotCloseAlert = () => ({ type: CLOSE_ALERT });


export const assignBadges = (userAssigned, selectedBadges) => {

  return async (dispatch) => {

    if (userAssigned.length === 0) {
      dispatch(getMessage('Please enter the name.', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }


    if (selectedBadges.length === 0) {
      dispatch(getMessage('Please select badges to be assigned.', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }



    const res = await axios.get(ENDPOINTS.USER_PROFILE_BY_NAME(userAssigned));
    if (res.data.length === 0) {
      dispatch(getMessage('Can not find the user to be assigned.', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }
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
    try {
      await axios.put(url, { badgeCollection });
      dispatch(getMessage('Assign Success!', 'success'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } catch (e) {
      dispatch(getMessage("Opps, something wrong!", 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }

  }

};