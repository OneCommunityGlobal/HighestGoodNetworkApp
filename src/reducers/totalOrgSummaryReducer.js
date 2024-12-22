import * as actions from '../constants/totalOrgSummary';

const initialState = {
  volunteerstats: [],
  loading: false,
  error: null,
  volunteerRolesTeamStats:{},
  isTeamStatsLoading:false,
  isTeamStatsError:null
};

export const totalOrgSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_TOTAL_ORG_SUMMARY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_TOTAL_ORG_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        volunteerstats: action.payload.volunteerstats,
      };

    case actions.FETCH_TOTAL_ORG_SUMMARY_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_BEGIN:
      return {
        ...state,
        isTeamStatsLoading : true,
        isTeamStatsError: null,
      };

    case actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_SUCCESS:
      return {
        ...state,
        isTeamStatsLoading: false,
        volunteerRolesTeamStats: action.payload,
      };

    case actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_ERROR:
      return {
        ...state,
        isTeamStatsLoading: false,
        isTeamStatsError: action.payload.error,
      };

    default:
      return state;
  }
};
