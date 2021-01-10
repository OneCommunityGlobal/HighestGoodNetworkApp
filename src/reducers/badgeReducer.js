import {
  GET_ALL_BADGE_DATA, ADD_SELECT_BADGE, REMOVE_SELECT_BADGE, GET_USER_TO_BE_ASSIGNED
} from '../constants/badge';

const badgeInitial = {
  allBadgeData: [],
  selectedBadges: new Set(),
  userAssigned: '',
};

export const badgeReducer = (state = badgeInitial, action) => {
  switch (action.type) {
    case GET_ALL_BADGE_DATA:
      return { ...state, allBadgeData: action.allBadges };
    case ADD_SELECT_BADGE:
      let toAdd = state.selectedBadges;
      toAdd.add(action.badgeId);
      return { ...state, selectedBadges: toAdd };
    case REMOVE_SELECT_BADGE:
      let toRemove = state.selectedBadges;
      toRemove.delete(action.badgeId);
      return { ...state, selectedBadges: toRemove };
    case GET_USER_TO_BE_ASSIGNED:
      return { ...state, userAssigned: action.userAssigned }
    default:
      return state;
  }
};


