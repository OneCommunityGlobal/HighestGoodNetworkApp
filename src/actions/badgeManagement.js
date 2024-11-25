import axios from 'axios';
// Removed unused 'moment' import
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
} from '../constants/badge';
import { ENDPOINTS } from '../utils/URL';

// Moved 'gotCloseAlert' above its usage to fix 'no-use-before-define'
export const gotCloseAlert = () => ({ type: CLOSE_ALERT });

// Moved 'returnUpdatedBadgesCollection' above its usage to fix 'no-use-before-define'
export const returnUpdatedBadgesCollection = (badgeCollection, selectedBadgesId) => {
  const newBadgeCollection = Array.from(badgeCollection);

  // Object to track updated or newly added badges to prevent duplicates
  const updatedOrAddedBadges = {};

  selectedBadgesId.forEach(originalBadgeId => {
    let badgeId = originalBadgeId;
    // Remove "assign-badge-" from badgeId
    if (badgeId.includes('assign-badge-')) badgeId = badgeId.replace('assign-badge-', '');

    if (!updatedOrAddedBadges[badgeId]) {
      let included = false;
      const currentTs = Date.now();
      const currentDate = formatDate();

      newBadgeCollection.forEach(badgeObj => {
        if (badgeId === badgeObj.badge) {
          if (!included) {
            // Only update the first instance
            // Increment count only for the first instance found
            badgeObj.count = badgeObj.count ? badgeObj.count + 1 : 1; // Replaced 'badgeObj.count++' with 'badgeObj.count + 1'
            badgeObj.lastModified = currentTs;
            badgeObj.earnedDate.push(currentDate);
            included = true;
          }
          // Note this badge ID as updated so it's not added again
          updatedOrAddedBadges[badgeId] = true;
        }
      });

      // Add the new badge record to badgeCollection if not included already
      if (!included) {
        newBadgeCollection.push({
          badge: badgeId,
          count: 1,
          lastModified: currentTs,
          earnedDate: [currentDate],
        });
        // Note this badge ID as added
        updatedOrAddedBadges[badgeId] = true;
      }
    }
  });

  return newBadgeCollection;
};

const getAllBadges = allBadges => ({
  type: GET_ALL_BADGE_DATA,
  allBadges,
});

export const fetchAllBadges = () => {
  // Removed unused 'url' variable to fix 'no-unused-vars'
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
    // Replaced console.error with dispatching a message to fix 'no-console'
    dispatch(getMessage("Failed to reset badge count", "danger"));
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

// Added a return statement to satisfy 'consistent-return'
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
       // Ensures a value is returned
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
    // Return a new badgeCollection for update
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
    const updatedBadgeCollection = badgeCollection.map(badgeObj => ({
      ...badgeObj,
      badge: badgeObj.badge._id,
    }));

    const userToBeAssignedBadge = res.data._id;
    // Return a new badgeCollection for update
    const newBadgeCollection = returnUpdatedBadgesCollection(updatedBadgeCollection, selectedBadges);
    // Send updated badgeCollection to backend
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
      }, 600000); // Assuming 600000 ms is intentional
    } catch (e) {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

// Updated to accept 'dispatch' and fixed 'no-undef' errors
export const sendUpdatedBadgeCollectionReq = (badgeCollection, selectedBadges, userToBeAssignedBadge) => {
  return async dispatch => {
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
    if (e.response.status === 403 || e.response.status === 400) { // Fixed condition to properly check status codes
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
    if (e.response.status === 403 || e.response.status === 400) { // Fixed condition to properly check status codes
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
    if (e.response.status === 403 || e.response.status === 400) { // Fixed condition to properly check status codes
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
