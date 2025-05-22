import GET_BM_PROJECT_MEMBERS from 'constants/bmdashboard/projectMemberConstants';

// eslint-disable-next-line default-param-last
export const bmProjectMemberReducer = (materials = [], action) => {
  if (action.type === GET_BM_PROJECT_MEMBERS) {
    return action.payload;
  }
  return materials;
};

export default bmProjectMemberReducer;
