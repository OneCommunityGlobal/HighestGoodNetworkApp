import {
  GET_ALL_BADGE_DATA,
  ADD_SELECT_BADGE,
  REMOVE_SELECT_BADGE,
  CLEAR_NAME_AND_SELECTED,
  CLEAR_SELECTED,
  GET_FIRST_NAME,
  GET_LAST_NAME,
  GET_USER_ID,
  GET_MESSAGE,
  CLOSE_ALERT,
  GET_BADGE_COUNT,
  RESET_BADGE_COUNT
} from '../constants/badge';

const badgeInitial = {
  allBadgeData: [],
  selectedBadges: [],
  firstName: '',
  lastName: '',
  userId: '',
  message: '',
  color: null,
  alertVisible: false,
  badgeCount: 0,
};

export const badgeReducer = (state = badgeInitial, action) => {
  switch (action.type) {
    case GET_ALL_BADGE_DATA:
      return { ...state, allBadgeData: action.allBadges };
    case ADD_SELECT_BADGE:
      const toAdd = state.selectedBadges;
      toAdd.push(action.badgeId);
      return { ...state, selectedBadges: toAdd };
    case REMOVE_SELECT_BADGE:
      const toRemove = state.selectedBadges;
      toRemove.splice(toRemove.indexOf(action.badgeId), 1);
      return { ...state, selectedBadges: toRemove };
    case GET_BADGE_COUNT:
      return {
        ...state,
        badgeCount: action.payload,
        error: null,
      };
    case RESET_BADGE_COUNT:
      return {
        ...state,
        badgeCount: action.payload,
      };
    case CLEAR_NAME_AND_SELECTED:
      return { ...state, selectedBadges: [], firstName: '', lastName: '', userId: '' };
    case CLEAR_SELECTED:
      return { ...state, selectedBadges: [] };
    case GET_FIRST_NAME:
      return { ...state, firstName: action.firstName };
    case GET_LAST_NAME:
      return { ...state, lastName: action.lastName };
    case GET_USER_ID:
      return { ...state, userId: action.userId };
    case GET_MESSAGE:
      return { ...state, message: action.message, alertVisible: true, color: action.color };
    case CLOSE_ALERT:
      return { ...state, alertVisible: false };
    default:
      return state;
  }
};
