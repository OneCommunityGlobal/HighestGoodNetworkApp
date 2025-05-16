import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { FiBox } from 'react-icons/fi';
import {WbsPieChart}  from './WbsPiechart/WbsPieChart';
import { getProjectDetail } from '../../../actions/project';
import {getTimeEntryByProjectSpecifiedPeriod} from '../../../actions/index'
import { fetchAllMembers, getProjectActiveUser } from '../../../actions/projectMembers';
import { fetchAllTasks} from '../../../actions/task';
import { fetchAllWBS } from '../../../actions/wbs';
import { ProjectMemberTable } from '../ProjectMemberTable';
import { ReportPage } from '../sharedComponents/ReportPage';
import Paging from '../../common/Paging';
import { TasksTable } from '../TasksTable';
import { WbsTable } from '../WbsTable';
import hasPermission from '../../../utils/permissions';
import viewWBSpermissionsRequired from '../../../utils/viewWBSpermissionsRequired';
import { projectReportViewData } from './selectors';
import '../../Teams/Team.css';
import './ProjectReport.css';
import { boxStyle, boxStyleDark } from '../../../styles';
import { PieChartByProject } from './PiechartByProject/PieChartByProject';


// eslint-disable-next-line import/prefer-default-export
export function ProjectReport({ match }) {
  const [memberCount, setMemberCount] = useState(0);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [nonActiveMemberCount, setNonActiveMemberCount] = useState(0);
  const [hoursCommitted, setHoursCommitted] = useState(0);
  const [tasks, setTasks] = useState([]);
  const dispatch = useDispatch();

  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator';
  const checkAnyPermission = permissions => {
    return permissions.some(permission => dispatch(hasPermission(permission)));
  };
  const canViewWBS = isAdmin || checkAnyPermission(viewWBSpermissionsRequired);

  const { wbs, projectMembers, isActive, projectName} = useSelector(
    projectReportViewData
  );
  const darkMode = useSelector(state => state.theme.darkMode);
  const tasksState = useSelector(state => state.tasks);

  let projectId = '';
  if (match && match.params) {
  projectId = match.params.projectId;
  }

  const [projectUsers, setProjectUsers] = useState([]);
  const [mergedProjectUsersArray, setMergedProjectUsersArray] = useState([]);

  const fromDate = '2016-01-01';
  const toDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dispatch(getTimeEntryByProjectSpecifiedPeriod(projectId, fromDate, toDate))
    .then(response => {
      if (response && Array.isArray(response)) {
        setProjectUsers(response);
      }
    })
  }, [projectId]);

  useEffect(() => {
    const mergedProjectUsers = projectUsers.reduce((acc, curr) => {
      if (curr.personId && !acc[curr.personId._id]) {
        acc[curr.personId._id] = {...curr};
      } else if (curr.personId) {
        acc[curr.personId._id].totalSeconds += curr.totalSeconds;
      }
      return acc;
    }, {});
    setMergedProjectUsersArray(Object.values(mergedProjectUsers));
  }, [projectUsers]);

  useEffect(() => {

    setMemberCount(0);
    setActiveMemberCount(0);
    setNonActiveMemberCount(0);
    setHoursCommitted(0);

    if (match) {
      dispatch(getProjectDetail(match.params.projectId));
      dispatch(fetchAllWBS(match.params.projectId));
      dispatch(fetchAllMembers(match.params.projectId));
      setTasks([]);
    }
  }, [match?.params.projectId]);

  useEffect(() => {
    if (wbs.fetching === false) {
      wbs.WBSItems.forEach(wbsItem => {
        dispatch(fetchAllTasks(wbsItem._id));
      });
    }
  }, [dispatch, wbs]);

  useEffect(() => {
    if (tasksState.taskItems.length > 0) {
      setTasks(tasksState.taskItems);
      return setHoursCommitted(tasksState.taskItems.reduce((total, task) => total + task.estimatedHours, 0));
    }

    return setHoursCommitted(0);

  }, [tasksState, wbs]);

  useEffect(() => {
    if (projectMembers.members) {
      dispatch(getProjectActiveUser());
      const { activeCount, nonActiveCount } = projectMembers.members.reduce((acc, member) => {
        if (member.isActive) {
          return { ...acc, activeCount: acc.activeCount + 1 };
        } 
        return { ...acc, nonActiveCount: acc.nonActiveCount + 1 };
      }, { activeCount: 0, nonActiveCount: 0 });

      setActiveMemberCount(activeCount);
      setNonActiveMemberCount(nonActiveCount);
    }
  }, [dispatch, projectMembers.members]);

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
          counts={{ activeMemberCount, memberCount: nonActiveMemberCount + activeMemberCount }}
          hoursCommitted={hoursCommitted.toFixed(0)}
          darkMode={darkMode}
        />
      )}
      darkMode={darkMode}
    >
      <div className={`project-header ${darkMode ? 'bg-yinmn-blue text-light' : ''}`} style={darkMode ? boxStyleDark : boxStyle}>{projectName}</div>
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
              counts={{ activeMemberCount, memberCount: nonActiveMemberCount + activeMemberCount }}
            />
          </Paging>
        </ReportPage.ReportBlock>
      </div>
        <ReportPage.ReportBlock darkMode={darkMode}>
          <TasksTable darkMode={darkMode} tasks={tasks}/>
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock darkMode={darkMode}>
          <PieChartByProject mergedProjectUsersArray={mergedProjectUsersArray} projectName={projectName} darkMode={darkMode}/>
          <hr />
          <WbsPieChart projectMembers={projectMembers} projectName={projectName} darkMode={darkMode}/>
        </ReportPage.ReportBlock>
      </ReportPage>
    </div>
  );
}
