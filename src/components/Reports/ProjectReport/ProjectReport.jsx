import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { FiBox } from 'react-icons/fi';
import {WbsPieChart}  from './WbsPiechart/WbsPieChart';
import { getProjectDetail } from '../../../actions/project';
import { getTimeEntriesForPeriod } from 'actions/timeEntries';
import {getTimeEntryByProjectSpecifiedPeriod} from '../../../actions/index'
import { fetchAllMembers, getProjectActiveUser } from '../../../actions/projectMembers';
import { fetchAllTasks } from 'actions/task';
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
import { boxStyle, boxStyleDark } from 'styles';
import { PieChartByProject } from './PiechartByProject/PieChartByProject';
import { setUserProjects } from 'actions/userProjects';


// eslint-disable-next-line import/prefer-default-export
export function ProjectReport({ match }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [memberCount, setMemberCount] = useState(0);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [nonActiveMemberCount, setNonActiveMemberCount] = useState(0);
  const [hoursCommitted, setHoursCommitted] = useState(0);
  const [loading, setLoading] = useState(true); // Agrega un nuevo estado para rastrear si las solicitudes están en curso

  const dispatch = useDispatch();

  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator';
  const checkAnyPermission = permissions => {
    return permissions.some(permission => dispatch(hasPermission(permission)));
  };
  const canViewWBS = isAdmin || checkAnyPermission(viewWBSpermissionsRequired);

  const { wbs, projectMembers, isActive, projectName, wbsTasksID } = useSelector(
    projectReportViewData
  );
  const tasks = useSelector(state => state.tasks);

  const projectId = match.params.projectId;

  const [projectUsers, setProjectUsers] = useState([]);

  const fromDate = '2016-01-01';
  const toDate = new Date().toISOString().split('T')[0]; // new data in  'YYYY-MM-DD'



  // paso 1 get members of projectID

  const projectMembersReport = useSelector(state => state.projectMembers.members);

  // console.log("🚀 ~ ProjectReport ~ projectUsers:", projectMembersReport)

  useEffect(() => {
    dispatch(getTimeEntryByProjectSpecifiedPeriod(projectId, fromDate, toDate))
    .then(response => {
      if (response) {
        console.log('Datos traidos correctamente');
        console.log(response);
        setProjectUsers(response);
      } else {
        console.log('Error al traer los datos');
      }
    }).catch(() => {
      console.log('Error al traer los datos');
    });
  }, [projectId, fromDate, toDate, dispatch]);

  useEffect(() => {
    console.log('project users', projectUsers);
    const mergedProjectUsers = projectUsers.reduce((acc, curr) => {
      // Buscar si el usuario ya existe en el array acumulador
      const existingUser = acc.find(user => user.personId === curr.personId);

      if (existingUser) {
        // Si el usuario ya existe, sumar totalSeconds al usuario existente
        existingUser.totalSeconds += curr.totalSeconds;
      } else {
        // Si el usuario no existe, agregarlo al array acumulador
        acc.push(curr);
      }

      return acc;
    }, []);

    console.log('merged project users', mergedProjectUsers);

    console.log('length of merged project users', mergedProjectUsers.length);


  }, [projectUsers]);



  useEffect(() => {

    if (match) {
      dispatch(getProjectDetail(projectId));
      dispatch(fetchAllWBS(projectId));
      dispatch(fetchAllMembers(projectId));

    }
  }, [dispatch, projectId]);


  useEffect(() => {
    if (wbs.fetching === false) {
      wbs.WBSItems.forEach(wbs => {
        dispatch(fetchAllTasks(wbs._id));
      });
    }
  }, [wbs]);

  useEffect(() => {
    if (tasks.taskItems.length > 0) {
      setHoursCommitted(tasks.taskItems.reduce((total, task) => total + task.hoursLogged, 0));
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
              />
            </Paging>
          </ReportPage.ReportBlock>
        </div>
        <div className="tasks-block">
          <ReportPage.ReportBlock darkMode={darkMode}>
            <TasksTable WbsTasksID={wbsTasksID} darkMode={darkMode}/>
          </ReportPage.ReportBlock>
        </div>
        <ReportPage.ReportBlock>
          <WbsPieChart projectMembers={projectMembers} projectName={projectName}/>
          <PieChartByProject projectMembers={projectMembers} projectName={projectName}/>
        </ReportPage.ReportBlock>
      </ReportPage>
    </div>
  );
}
