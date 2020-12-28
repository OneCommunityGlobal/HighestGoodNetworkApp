import {
  GET_ALL_BADGE_DATA
} from '../constants/badge';

const badgeInitial = {
  allBadgeData: []
};

export const badgeReducer = (state = badgeInitial, action) => {
  switch (action.type) {
    case GET_ALL_BADGE_DATA:
      return { ...state, allBadgeData: action.allBadges };
    default:
      return state;
  }
}