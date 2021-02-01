import {
  GET_ALL_BADGE_DATA, ADD_SELECT_BADGE, REMOVE_SELECT_BADGE, CLEAR_NAME_AND_SELECTED, GET_USER_TO_BE_ASSIGNED, GET_MESSAGE, CLOSE_ALERT
} from '../constants/badge';

const badgeInitial = {
  allBadgeData: [],
  selectedBadges: [],
  userAssigned: '',
  message: '',
  color: null,
  alertVisible: false
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
    case CLEAR_NAME_AND_SELECTED:
      return { ...state, selectedBadges: [], userAssigned: '' };
    case GET_USER_TO_BE_ASSIGNED:
      return { ...state, userAssigned: action.userAssigned }
    case GET_MESSAGE:
      return { ...state, message: action.message, alertVisible: true, color: action.color }
    case CLOSE_ALERT:
      return { ...state, alertVisible: false };
    default:
      return state;
  }
};


