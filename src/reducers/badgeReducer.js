import {
  GET_ALL_BADGE_DATA, ADD_SELECT_BADGE, REMOVE_SELECT_BADGE, CLEAR_SELECTED_BADGES, GET_USER_TO_BE_ASSIGNED
} from '../constants/badge';

const badgeInitial = {
  allBadgeData: [],
  selectedBadges: [],
  userAssigned: '',
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
    case CLEAR_SELECTED_BADGES:
      return { ...state, selectedBadges: [] };
    case GET_USER_TO_BE_ASSIGNED:
      return { ...state, userAssigned: action.userAssigned }
    default:
      return state;
  }
};


