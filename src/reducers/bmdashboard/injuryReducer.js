import { GET_INJURY_SEVERITY } from 'constants/bmdashboard/injuryConstants';

// eslint-disable-next-line default-param-last
export const bmInjuryReducer = (severityData = [], action) => {
  if (action.type === GET_INJURY_SEVERITY) {
    return action.payload;
  }
  return severityData;
};

export default bmInjuryReducer;
