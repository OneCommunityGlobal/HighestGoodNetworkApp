import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { FiBox } from 'react-icons/fi';
import { getProjectDetail } from '../../../actions/project';
import { fetchAllMembers, getProjectActiveUser } from '../../../actions/projectMembers';
import { fetchAllTasks } from 'actions/task';
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
  const darkMode = useSelector(state => state.theme.darkMode);
  const [memberCount, setMemberCount] = useState(0);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [nonActiveMemberCount, setNonActiveMemberCount] = useState(0);
  const [hoursCommitted, setHoursCommitted] = useState(0);
  const dispatch = useDispatch();

  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator';
  const checkAnyPermission = permissions => {
    return permissions.some(permission => dispatch(hasPermission(permission)));
  };
  const canViewWBS = isAdmin || checkAnyPermission(viewWBSpermissionsRequired);

  const { wbs, projectMembers, isActive, projectName, wbsTasksID } = useSelector(
    projectReportViewData,
  );
  const tasks = useSelector(state => state.tasks);

  useEffect(() => {
    if (match) {
      dispatch(getProjectDetail(match.params.projectId));
      dispatch(fetchAllWBS(match.params.projectId));
      dispatch(fetchAllMembers(match.params.projectId));
    }
  }, []);

  useEffect(() => {
    if(wbs.fetching === false){
      wbs.WBSItems.forEach(wbs => {
        dispatch(fetchAllTasks(wbs._id));
      });
    }
  }, [wbs]);
  
  useEffect(() => {
    if (tasks.taskItems.length > 0) {
      setHoursCommitted(tasks.taskItems.reduce((total, task) => total + task.estimatedHours, 0));
    }
  }, [tasks]);

  useEffect(() => {
    if (projectMembers.members) {
      dispatch(getProjectActiveUser());
      const { activeCount, nonActiveCount } = projectMembers.members.reduce((counts, member) => {
        member.isActive ? counts.activeCount++ : counts.nonActiveCount++;
        return counts;
       }, { activeCount: 0, nonActiveCount: 0 });

      setActiveMemberCount(activeCount);
      setNonActiveMemberCount(nonActiveCount);
    }
  }, [projectMembers.members]);

  const handleMemberCount = elementCount => {
    setMemberCount(elementCount);
  };

  return (
    <div className={`container-project-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
    <ReportPage
      renderProfile={() => (
        <ReportPage.ReportHeader 
          isActive={isActive} 
          avatar={<FiBox />} 
          name={projectName} 
          counts={{ activeMemberCount: activeMemberCount, memberCount: nonActiveMemberCount + activeMemberCount }} 
          hoursCommitted={hoursCommitted.toFixed(0)}
          darkMode={darkMode}
        />
      )}
      darkMode={darkMode}
    >
      <div className='project-header'>{projectName}</div> 
      <div className="wbs-and-members-blocks-wrapper">
        <ReportPage.ReportBlock className="wbs-and-members-blocks" darkMode={darkMode}>
          <Paging totalElementsCount={wbs.WBSItems.length} darkMode={darkMode}>
            <WbsTable wbs={wbs} match={match} canViewWBS={canViewWBS} darkMode={darkMode}/>
          </Paging>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock className="wbs-and-members-blocks" darkMode={darkMode}>
          <Paging totalElementsCount={memberCount} darkMode={darkMode}>
            <ProjectMemberTable
              projectMembers={projectMembers}
              handleMemberCount={handleMemberCount}
              darkMode={darkMode}
            />
          </Paging>
        </ReportPage.ReportBlock>
      </div>
      <div className="tasks-block">
        <ReportPage.ReportBlock darkMode={darkMode}>
          <TasksTable WbsTasksID={wbsTasksID} darkMode={darkMode}/>
        </ReportPage.ReportBlock>
      </div>
    </ReportPage>
    </div>
  );
}
