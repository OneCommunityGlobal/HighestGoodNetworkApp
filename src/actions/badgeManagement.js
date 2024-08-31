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

export const gotCloseAlert = () => ({ type: CLOSE_ALERT });

export const validateBadges = (firstName, lastName) => {
  return async dispatch => {
    if (!firstName || !lastName) {
      dispatch(
        getMessage(
          'The Name Find function does not work without entering first and last name. Nice try though.',
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

export const assignBadgesByUserID = (userIds, selectedBadges) => {
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

    try {
      const response = await axios.post(ENDPOINTS.BADGE_ASSIGN, {
        userIds,
        selectedBadges,
      });

      if (response.status === 200) {
        dispatch(
          getMessage(
            "Awesomesauce! You've increased badges and proportionally increased life happiness for multiple users!",
            'success',
          ),
        );
      } else {
        throw new Error('Failed to assign badges');
      }
    } catch (error) {
      dispatch(getMessage('Oops, something went wrong while assigning badges!', 'danger'));
    } finally {
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

    try {
      const res = await axios.get(ENDPOINTS.USER_PROFILE_BY_NAME(userAssigned));

      if (res.data.length === 0) {
        throw new Error("Can't find that user.");
      }

      const userToBeAssignedBadge = res.data[0]._id;
      await dispatch(assignBadgesByUserID([userToBeAssignedBadge], selectedBadges));
    } catch (error) {
      dispatch(
        getMessage(
          error.message ||
            "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

export const updateBadgesById = (userId, updatedBadges) => {
  return async dispatch => {
    if (updatedBadges.length === 0) {
      dispatch(
        getMessage(
          "Um no, that didn't work. Badge Update Function must include actual badges to update. Better luck next time!",
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
      return;
    }

    try {
      const url = ENDPOINTS.BADGE_ASSIGN_BY_ID(userId);
      const response = await axios.put(url, {
        badgeCollection: updatedBadges,
      });

      if (response.status === 200 || response.status === 201) {
        dispatch(
          getMessage(
            "Awesomesauce! You've successfully updated the badges, potentially increasing life happiness!",
            'success',
          ),
        );
      } else {
        throw new Error('Failed to update badges');
      }
    } catch (error) {
      dispatch(getMessage(error.message || 'Oops, something went wrong!', 'danger'));
    } finally {
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
};

// Return updated badgeCollection
export const returnUpdatedBadgesCollection = (badgeCollection, selectedBadgesId) => {
  const newBadgeCollection = Array.from(badgeCollection);

  // object to track updated or newly added badges to prevent duplicates
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
            badgeObj.count = badgeObj.count ? badgeObj.count + 1 : 1;
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
