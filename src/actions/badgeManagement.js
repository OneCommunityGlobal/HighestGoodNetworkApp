import axios from 'axios';
import moment from 'moment';
import { formatDate } from 'utils/formatDate';
import {
  GET_ALL_BADGE_DATA,
  ADD_SELECT_BADGE,
  REMOVE_SELECT_BADGE,
  CLEAR_NAME_AND_SELECTED,
  CLEAR_SELECTED,
  GET_FIRST_NAME,
  GET_LAST_NAME,
  GET_MESSAGE,
  CLOSE_ALERT,
  GET_USER_ID,
  GET_BADGE_COUNT,
  RESET_BADGE_COUNT,
  SET_ACTIVE_TAB,
} from '../constants/badge';
import { ENDPOINTS } from '../utils/URL';

const getAllBadges = allBadges => ({
  type: GET_ALL_BADGE_DATA,
  allBadges,
});

export const fetchAllBadges = () => {
  const url = ENDPOINTS.BADGE();
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.BADGE());
      dispatch(getAllBadges(response.data));
      return response.status;
    } catch (err) {
      return err.response.status;
    }
  };
};

const getBadgeCountSuccess = badgeCount => ({
  type: GET_BADGE_COUNT,
  payload: badgeCount,
});

export const getBadgeCount = userId => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.BADGE_COUNT(userId));
      dispatch(getBadgeCountSuccess(response.data.count));
    } catch (err) {
      return err.response.status;
    }
  };
};

export const resetBadgeCount = userId => async dispatch => {
  try {
    const updatedBadgeCountResponse = await axios.put(ENDPOINTS.BADGE_COUNT_RESET(userId));
    const updatedBadgeCount = updatedBadgeCountResponse.data.count;
    if (updatedBadgeCountResponse.status === 201) {
      dispatch({
        type: RESET_BADGE_COUNT,
        payload: updatedBadgeCount,
      });
    }
  } catch (error) {
    console.error('Failed to reset badge count', error);
  }
};

export const closeAlert = () => {
  return dispatch => {
    dispatch(gotCloseAlert());
  };
};

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

export const clearSelected = () => ({
  type: CLEAR_SELECTED,
});

export const getFirstName = firstName => ({
  type: GET_FIRST_NAME,
  firstName,
});

export const getLastName = lastName => ({
  type: GET_LAST_NAME,
  lastName,
});

export const getUserId = userId => ({
  type: GET_USER_ID,
  userId,
});

export const getMessage = (message, color) => ({
  type: GET_MESSAGE,
  message,
  color,
});
export const setActiveTab = tab => ({
  type: SET_ACTIVE_TAB,
  payload: tab,
});

export const gotCloseAlert = () => ({ type: CLOSE_ALERT });

export const validateBadges = (firstName, lastName) => {
  return async dispatch => {
    if (!firstName || !lastName) {
      dispatch(
        getMessage(
          'The Name Find function does not work without entering a name. Nice try though.',
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

export const assignBadges = (firstName, lastName, selectedBadges) => {
  return async dispatch => {
    if (selectedBadges.length === 0) {
      dispatch(
        getMessage(
          "Um no, that didn't work. Badge Select Function must include actual selection of badges to work. Better luck next time!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    const userAssigned = `${firstName} ${lastName}`;

    const res = await axios.get(ENDPOINTS.USER_PROFILE_BY_NAME(userAssigned));

    if (res.data.length === 0) {
      dispatch(
        getMessage(
          "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    const { badgeCollection } = res.data[0];
    const userToBeAssignedBadge = res.data[0]._id;
    // return a new badgeCollection for udpate
    const newBadgeCollection = returnUpdatedBadgesCollection(badgeCollection, selectedBadges);

    const url = ENDPOINTS.BADGE_ASSIGN(userToBeAssignedBadge);
    try {
      await axios.put(url, {
        badgeCollection: newBadgeCollection,
        newBadges: selectedBadges.length,
      });
      dispatch(
        getMessage(
          "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
          'success',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } catch (e) {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

export const assignBadgesByUserID = (userId, selectedBadges) => {
  return async dispatch => {
    if (selectedBadges.length === 0) {
      dispatch(
        getMessage(
          "Um no, that didn't work. Badge Select Function must include actual selection of badges to work. Better luck next time!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    const res = await axios.get(ENDPOINTS.USER_PROFILE(userId));

    if (res.data.length === 0) {
      dispatch(
        getMessage(
          "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }
    const { badgeCollection } = res.data;
    // Update the badgeCollection.badge object to badge._id string for backend
    for (let i = 0; i < badgeCollection.length; i++) {
      badgeCollection[i].badge = badgeCollection[i].badge._id;
    }

    const userToBeAssignedBadge = res.data._id;
    // return a new badgeCollection for udpate
    const newBadgeCollection = returnUpdatedBadgesCollection(badgeCollection, selectedBadges);
    // send updated badgeCollection to backend
    const url = ENDPOINTS.BADGE_ASSIGN(userToBeAssignedBadge);
    try {
      await axios.put(url, {
        badgeCollection: newBadgeCollection,
        newBadges: selectedBadges.length,
      });
      dispatch(
        getMessage(
          "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
          'success',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 600000);
    } catch (e) {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

// Return updated badgeCollection
export const returnUpdatedBadgesCollection = (badgeCollection, selectedBadgesId) => {
  const personalMaxBadge = '666b78265bca0bcb94080605'; // backend id for Personal Max badge
  const badgeMap = new Map(badgeCollection?.map(badge => [badge.badge, badge]));

  const currentTs = Date.now();
  const currentDate = formatDate();
  selectedBadgesId.forEach(originalBadgeId => {
    const badgeId = originalBadgeId.replace('assign-badge-', '');
    if (badgeMap.has(badgeId)) {
      // Update the existing badge record
      if (badgeId != personalMaxBadge) {
        const badge = badgeMap.get(badgeId);
        badge.count = (badge.count || 0) + 1;
        badge.lastModified = currentTs;
        badge.earnedDate.push(currentDate);
      }
    } else {
      // Add the new badge record
      badgeMap.set(badgeId, {
        badge: badgeId,
        count: 1,
        lastModified: currentTs,
        earnedDate: [currentDate],
      });
    }
  });

  return Array.from(badgeMap.values());
};

// Make API call to update badgeCollection
export const sendUpdatedBadgeCollectionReq = async (
  badgeCollection,
  selectedBadges,
  userToBeAssignedBadge,
) => {
  const url = ENDPOINTS.BADGE_ASSIGN(userToBeAssignedBadge);
  try {
    await axios.put(url, { badgeCollection, newBadges: selectedBadges.length });
    dispatch(
      getMessage(
        "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
        'success',
      ),
    );
    setTimeout(() => {
      dispatch(closeAlert());
    }, 6000);
  } catch (e) {
    dispatch(getMessage('Oops, something is wrong!', 'danger'));
    setTimeout(() => {
      dispatch(closeAlert());
    }, 6000);
  }
};

export const changeBadgesByUserID = (userId, badgeCollection) => {
  return async dispatch => {
    const url = ENDPOINTS.BADGE_ASSIGN(userId);
    try {
      await axios.put(url, { badgeCollection, newBadges: 0 });
      dispatch(
        getMessage(
          "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
          'success',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } catch (e) {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

export const createNewBadge = newBadge => async dispatch => {
  try {
    await axios.post(ENDPOINTS.BADGE(), newBadge);
    dispatch(
      getMessage(
        'Awesomesauce! You have successfully uploaded a new badge to the system!',
        'success',
      ),
    );
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
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  }
};

export const updateBadge = (badgeId, badgeData) => async dispatch => {
  try {
    await axios.put(ENDPOINTS.BADGE_BY_ID(badgeId), badgeData);
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    } else {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  }
};

export const deleteBadge = badgeId => async dispatch => {
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
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  }
};
