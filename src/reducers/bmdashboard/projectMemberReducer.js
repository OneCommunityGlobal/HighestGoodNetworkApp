import GET_BM_PROJECT_MEMBERS from 'constants/bmdashboard/projectMemberConstants';

// eslint-disable-next-line default-param-last
export const bmProjectMemberReducer = (state = { members: [] }, action) => {
  switch (action.type) {
    case GET_BM_PROJECT_MEMBERS:
      return { ...state, members: action.payload };
    default:
      return state;
  }
};

export default bmProjectMemberReducer;
