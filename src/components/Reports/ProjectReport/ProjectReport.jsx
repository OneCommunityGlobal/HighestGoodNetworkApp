import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { FiBox } from 'react-icons/fi';
import { getProjectDetail } from '../../../actions/project';
import { fetchAllMembers, getProjectActiveUser } from '../../../actions/projectMembers';
import { fetchAllWBS } from '../../../actions/wbs';
import { ProjectMemberTable } from '../ProjectMemberTable';
import { ReportPage } from '../sharedComponents/ReportPage';
import { Paging } from '../../common/Paging';
import { TasksTable } from '../TasksTable';
import { WbsTable } from '../WbsTable';
import hasPermission from '../../../utils/permissions';
import viewWBSpermissionsRequired from '../../../utils/viewWBSpermissionsRequired';
import { projectReportViewData } from './selectors';
import '../../Teams/Team.css';
import './ProjectReport.css';

// eslint-disable-next-line import/prefer-default-export
export function ProjectReport({ match }) {
  const dispatch = useDispatch();
  const [memberCount, setMemberCount] = useState(0);

  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator';
  const checkAnyPermission = permissions => {
    return permissions.some(permission => dispatch(hasPermission(permission)));
  };
  const canViewWBS = isAdmin || checkAnyPermission(viewWBSpermissionsRequired);

  const { wbs, projectMembers, isActive, projectName, wbsTasksID } = useSelector(
    projectReportViewData,
  );

  useEffect(() => {
    if (match) {
      dispatch(getProjectDetail(match.params.projectId));
      dispatch(fetchAllWBS(match.params.projectId));
      dispatch(fetchAllMembers(match.params.projectId));
    }
  }, []);

  useEffect(() => {
    if (projectMembers.members) {
      dispatch(getProjectActiveUser());
    }
  }, [projectMembers.members]);

  const handleMemberCount = elementCount => {
    setMemberCount(elementCount);
  };

  return (
    <ReportPage
      renderProfile={() => (
        <ReportPage.ReportHeader isActive={isActive} avatar={<FiBox />} name={projectName} />
      )}
    >
      <div className="wbs-and-members-blocks-wrapper">
        <ReportPage.ReportBlock className="wbs-and-members-blocks">
          <Paging totalElementsCount={wbs.WBSItems.length}>
            <WbsTable wbs={wbs} match={match} canViewWBS={canViewWBS} />
          </Paging>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock className="wbs-and-members-blocks">
          <Paging totalElementsCount={memberCount}>
            <ProjectMemberTable
              projectMembers={projectMembers}
              handleMemberCount={handleMemberCount}
            />
          </Paging>
        </ReportPage.ReportBlock>
      </div>
      <div className="tasks-block">
        <ReportPage.ReportBlock>
          <TasksTable WbsTasksID={wbsTasksID} />
        </ReportPage.ReportBlock>
      </div>
    </ReportPage>
  );
}
