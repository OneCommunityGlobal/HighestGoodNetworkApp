import axios from 'axios';
import {
  GET_ALL_BADGE_DATA,
  ADD_SELECT_BADGE,
  REMOVE_SELECT_BADGE,
  CLEAR_NAME_AND_SELECTED,
  GET_FIRST_NAME, GET_LAST_NAME,
  GET_MESSAGE,
  CLOSE_ALERT,
} from '../constants/badge';
import { ENDPOINTS } from '../utils/URL';


const getAllBadges = allBadges => ({
  type: GET_ALL_BADGE_DATA,
  allBadges,
});

export const fetchAllBadges = () => async (dispatch) => {
  const { data } = await axios.get(ENDPOINTS.BADGE());
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


export const getFirstName = firstName => ({
  type: GET_FIRST_NAME,
  firstName
})

export const getLastName = lastName => ({
  type: GET_LAST_NAME,
  lastName
})


export const getMessage = (message, color) => ({
  type: GET_MESSAGE,
  message,
  color
})

export const gotCloseAlert = () => ({ type: CLOSE_ALERT });



export const assignBadges = (firstName, lastName, selectedBadges) => {

  return async (dispatch) => {

    if (firstName.length === 0 || lastName.length === 0) {
      dispatch(getMessage('Surprise! The Name Find function does not work without entering first and last name. Nice try though.', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    if (selectedBadges.length === 0) {
      dispatch(getMessage('Um no, that didn \'t work. Badge Select Function must include actual selection of badges to work. Better luck next time! ', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    const userAssigned = firstName + ' ' + lastName;

    const res = await axios.get(ENDPOINTS.USER_PROFILE_BY_NAME(userAssigned));
    if (res.data.length === 0) {
      dispatch(getMessage('Can\'t find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you! ', 'danger'));
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
      dispatch(getMessage('Awesomesauce! Not only have you increased a person\'s badges, you\'ve also proportionally increased their life happiness!', 'success'));
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

export const createNewBadge = (newBadge) => async (dispatch) => {
  try {
    await axios.post(ENDPOINTS.BADGE(), newBadge);
    dispatch(getMessage('Awesomesauce! You have successfully uploaded a new badge to the system!', 'success'));
    setTimeout(() => {
      dispatch(closeAlert());
    }, 6000);
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } else {
      dispatch(getMessage("Opps, something wrong!", 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  }
};

export const deleteBadge = (badgeId) => async (dispatch) => {
  try {
    const res = await axios.delete(ENDPOINTS.BADGE_BY_ID(badgeId));
    dispatch(getMessage(res.data.message, 'success'));
    setTimeout(() => {
      dispatch(closeAlert());
    }, 6000);
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } else {
      dispatch(getMessage("Opps, something wrong!", 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  }
};