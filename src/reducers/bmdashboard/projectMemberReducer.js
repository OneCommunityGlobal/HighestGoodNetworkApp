import GET_BM_PROJECT_MEMBERS from '~/constants/bmdashboard/projectMemberConstants';

// eslint-disable-next-line default-param-last
export const bmProjectMemberReducer = (state = { members: [] }, action) => {
  if (action.type === GET_BM_PROJECT_MEMBERS) {
    return {
      ...state,
      members: action.payload,
    };
  }
  return state;
};

export default bmProjectMemberReducer;
