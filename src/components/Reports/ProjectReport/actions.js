import { getProjectDetail } from '../../../actions/project';
import { fetchAllMembers } from '../../../actions/projectMembers';
import { fetchAllWBS } from '../../../actions/wbs';

export const GET_PROJECT_REPORT_BEGIN = 'GET_PROJECT_REPORT_BEGIN';
export const GET_PROJECT_REPORT_END = 'GET_PROJECT_REPORT_END';

export const getProjectReportBegin = () => ({
  type: GET_PROJECT_REPORT_BEGIN,
});

export const getProjectReportEnd = () => ({
  type: GET_PROJECT_REPORT_END,
});

export const getProjectReport = projectId => dispatch => {
  dispatch(getProjectReportBegin());

  dispatch(getProjectDetail(projectId));
  dispatch(fetchAllWBS(projectId));
  dispatch(fetchAllMembers(projectId));

  dispatch(getProjectReportEnd());
};
