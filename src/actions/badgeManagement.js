import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDate } from '~/utils/formatDate';
import { ENDPOINTS } from '~/utils/URL';
import {
  ADD_SELECT_BADGE,
  CLEAR_NAME_AND_SELECTED,
  CLEAR_SELECTED,
  CLOSE_ALERT,
  GET_ALL_BADGE_DATA,
  GET_BADGE_COUNT,
  GET_FIRST_NAME,
  GET_LAST_NAME,
  GET_MESSAGE,
  GET_USER_ID,
  REMOVE_SELECT_BADGE,
  RESET_BADGE_COUNT,
  SET_ACTIVE_TAB,
} from '../constants/badge';

export const ALERT_DELAY = process.env.NODE_ENV === 'test' ? 0 : 6000;

const BADGE_ASSIGN_PERMISSION_MESSAGE =
  'You do not have permission to assign badges. Enable the "Assign Badges" permission for your role or user profile in Permissions Management, then log out and log back in.';

const normalizeSelectedBadgeIds = selectedBadges =>
  selectedBadges.map(badgeId => {
    if (typeof badgeId === 'string' && badgeId.includes('assign-badge-')) {
      return badgeId.replace('assign-badge-', '');
    }
    return badgeId;
  });

const getServerErrorMessage = data => {
  if (!data) return null;
  if (typeof data === 'string') {
    if (data.includes('<!DOCTYPE') || data.includes('<html')) {
      const preMatch = data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      return preMatch ? preMatch[1].trim() : 'The server returned an unexpected error page.';
    }
    return data;
  }
  if (data.error) return data.error;
  if (data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors[0]?.message) return data.errors[0].message;
  return null;
};

const getBadgeAssignmentErrorMessage = (error, fallbackMessage) => {
  const status = error?.response?.status;
  const serverMessage = getServerErrorMessage(error?.response?.data);

  if (status === 403) {
    return serverMessage || BADGE_ASSIGN_PERMISSION_MESSAGE;
  }
  if (status === 401) {
    return (
      serverMessage ||
      'Your session may have expired. Log out and log back in, then try assigning badges again.'
    );
  }
  if (status === 400 || status === 404 || status === 409) {
    return serverMessage || fallbackMessage;
  }
  if (status >= 500) {
    return (
      serverMessage ||
      `Server error (${status}) while assigning badges. Try again or contact support.`
    );
  }
  if (serverMessage) {
    return serverMessage;
  }
  if (!error?.response) {
    return 'Could not reach the server to assign badges. Check that the backend is running and try again.';
  }
  return status ? `${fallbackMessage} (HTTP ${status})` : fallbackMessage;
};

const scheduleCloseAlert = dispatch => {
  if (ALERT_DELAY === 0) {
    dispatch(closeAlert());
  } else {
    setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
  }
};

const getAllBadges = allBadges => {
  const action = {
    type: GET_ALL_BADGE_DATA,
    allBadges,
  };
  return action;
};

export const fetchAllBadges = (forceRefresh = false) => {
  return async dispatch => {
    try {
      // Check the endpoint
      const baseUrl = ENDPOINTS.BADGE();
      const url = forceRefresh ? `${baseUrl}?t=${Date.now()}` : baseUrl;

      const response = await axios.get(url);

      const actionResult = getAllBadges(response.data);

      dispatch(actionResult);

      return response.status;
    } catch (err) {
      return err.response?.status || 500;
    }
  };
};
export const gotCloseAlert = () => ({ type: CLOSE_ALERT });

const getBadgeCountSuccess = badgeCount => ({
  type: GET_BADGE_COUNT,
  payload: badgeCount,
});

export const getBadgeCount = userId => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.BADGE_COUNT(userId));
      dispatch(getBadgeCountSuccess(response.data.count));
      return response.data.count;
    } catch (err) {
      return err.response?.status || 500;
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
    toast.error('Failed to reset badge count', error);
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

export const validateBadges = (firstName, lastName) => {
  return async dispatch => {
    if (!firstName || !lastName) {
      dispatch(
        getMessage(
          'The Name Find function does not work without entering first and last name. Nice try though.',
          'danger',
        ),
      );
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    }
  };
};



export const returnUpdatedBadgesCollection = (badgeCollection, selectedBadgesId) => {
  let newBadgeCollection = Array.from(badgeCollection);

  // Object to track updated or newly added badges to prevent duplicates
  const updatedOrAddedBadges = {};

  selectedBadgesId.forEach(originalBadgeId => {
    let badgeId = originalBadgeId;

    // Remove "assign-badge-" from badgeId
    if (badgeId.includes('assign-badge-')) badgeId = badgeId.replace('assign-badge-', '');

    if (!updatedOrAddedBadges[badgeId]) {
      // Flag to check if the badge is already in the collection
      let included = false;
      const currentTs = Date.now();
      const currentDate = formatDate();

      for (let i = 0; i < newBadgeCollection.length; i += 1) {
        const badgeObj = newBadgeCollection[i];
        if (badgeId === badgeObj.badge) {
          // If the badge is found, increment the count and mark it as included
          badgeObj.count = badgeObj.count ? badgeObj.count + 1 : 1;
          badgeObj.lastModified = currentTs;
          badgeObj.earnedDate.push(currentDate);
          included = true;
          // Mark this badge ID as updated so it's not added again
          updatedOrAddedBadges[badgeId] = true;
          break; // Exit loop after finding and updating the badge
        }
      }

      // If the badge was not already in the collection, add it as a new entry
      if (!included) {
        newBadgeCollection.push({
          badge: badgeId,
          count: 1,
          lastModified: currentTs,
          earnedDate: [currentDate],
        });
        // Mark this badge ID as added
        updatedOrAddedBadges[badgeId] = true;
      }
    }
  });

  return newBadgeCollection;
};

export const returnUpdatedBadgesCollectionSingleUser = (badgeCollection, selectedBadgesId) => {
  const newBadgeCollection = badgeCollection.map(b => ({
    ...b,
    earnedDate: [...(b.earnedDate || [])],
    badge: b.badge && typeof b.badge === 'object' ? b.badge._id : b.badge,
  }));
  const currentTs = Date.now();
  const currentDate = formatDate();

  selectedBadgesId.forEach(originalBadgeId => {
    let badgeId = originalBadgeId;
    if (badgeId.includes('assign-badge-')) badgeId = badgeId.replace('assign-badge-', '');

    const existing = newBadgeCollection.find(b => b.badge === badgeId);
    if (existing) {
      existing.count = (existing.count || 0) + 1;
      existing.lastModified = currentTs;
      existing.earnedDate.push(currentDate);
    } else {
      newBadgeCollection.push({
        badge: badgeId,
        count: 1,
        lastModified: currentTs,
        earnedDate: [currentDate],
      });
    }
  });

  return newBadgeCollection;
};

const assignBadgeToUser = async (userId, selectedBadges) => {
  try {
    const res = await axios.get(ENDPOINTS.USER_PROFILE(userId));

    if (!res.data?._id) {
      return {
        success: false,
        error: {
          response: {
            status: 404,
            data: {
              error:
                "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
            },
          },
        },
      };
    }

    const badgeCollection = [...(res.data.badgeCollection || [])];
    for (let i = 0; i < badgeCollection.length; i += 1) {
      if (badgeCollection[i].badge && typeof badgeCollection[i].badge === 'object') {
        badgeCollection[i].badge = badgeCollection[i].badge._id;
      }
    }

    const newBadgeCollection = returnUpdatedBadgesCollectionSingleUser(
      badgeCollection,
      selectedBadges,
    );

    await axios.put(ENDPOINTS.BADGE_ASSIGN(res.data._id), {
      badgeCollection: newBadgeCollection,
      newBadges: selectedBadges.length,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
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
      scheduleCloseAlert(dispatch);
      return false;
    }

    const badgeIds = normalizeSelectedBadgeIds(selectedBadges);

    try {
      const result = await assignBadgeToUser(userId, badgeIds);
      if (!result.success) {
        dispatch(
          getMessage(
            getBadgeAssignmentErrorMessage(result.error, 'Oops, something is wrong!'),
            'danger',
          ),
        );
        scheduleCloseAlert(dispatch);
        return false;
      }

      dispatch(
        getMessage(
          "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
          'success',
        ),
      );
      scheduleCloseAlert(dispatch);
      return true;
    } catch (e) {
      dispatch(
        getMessage(getBadgeAssignmentErrorMessage(e, 'Oops, something is wrong!'), 'danger'),
      );
      scheduleCloseAlert(dispatch);
      return false;
    }
  };
};

export const assignBadgesToMultipleUserID = (userIds, selectedBadges) => {
  return async dispatch => {
    if (selectedBadges.length === 0) {
      dispatch(
        getMessage(
          "Um no, that didn't work. Badge Select Function must include actual selection of badges to work. Better luck next time!",
          'danger',
        ),
      );
      scheduleCloseAlert(dispatch);
      return false;
    }

    if (!userIds?.length) {
      dispatch(
        getMessage(
          'Please select at least one user before assigning badges.',
          'danger',
        ),
      );
      scheduleCloseAlert(dispatch);
      return false;
    }

    const badgeIds = normalizeSelectedBadgeIds(selectedBadges);

    try {
      for (const userId of userIds) {
        const result = await assignBadgeToUser(userId, badgeIds);
        if (!result.success) {
          dispatch(
            getMessage(
              getBadgeAssignmentErrorMessage(
                result.error,
                'Oops, something went wrong while assigning badges!',
              ),
              'danger',
            ),
          );
          scheduleCloseAlert(dispatch);
          return false;
        }
      }

      dispatch(
        getMessage(
          userIds.length === 1
            ? "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!"
            : "Awesomesauce! You've increased badges and proportionally increased life happiness for multiple users!",
          'success',
        ),
      );
      scheduleCloseAlert(dispatch);
      return true;
    } catch (error) {
      dispatch(
        getMessage(
          getBadgeAssignmentErrorMessage(error, 'Oops, something went wrong while assigning badges!'),
          'danger',
        ),
      );
      scheduleCloseAlert(dispatch);
      return false;
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
        dispatch(
          getMessage(
            "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
            'danger',
          ),
        );
        setTimeout(() => {
          dispatch(closeAlert());
        }, 6000);
      }
      const userToBeAssignedBadge = res.data[0]._id;
      await dispatch(assignBadgesByUserID(userToBeAssignedBadge, selectedBadges));
    } catch (error) {
      dispatch(
        getMessage(
          'Oops, something is wrong!',
          'danger',
        ),
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 6000);
    }
  };
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
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    } catch (e) {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
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
    if (ALERT_DELAY === 0) {
      // test mode: fire immediately
      dispatch(closeAlert());
    } else {
      setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
    }
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || e.response.status === 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {

        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    } else {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    }
  }
};

export const updateBadge = (badgeId, badgeData) => async dispatch => {
  try {
    await axios.put(ENDPOINTS.BADGE_BY_ID(badgeId), badgeData);
    dispatch(fetchAllBadges(true));
  } catch (e) {
    if (e.response.status === 403 || e.response.status === 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    } else {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    }
  }
};

export const deleteBadge = badgeId => async dispatch => {
  try {
    const res = await axios.delete(ENDPOINTS.BADGE_BY_ID(badgeId));
    dispatch(getMessage(res.data.message, 'success'));
    if (ALERT_DELAY === 0) {
      dispatch(closeAlert());
    } else {
      setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
    }
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || e.response.status === 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    } else {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    }
  }
};
