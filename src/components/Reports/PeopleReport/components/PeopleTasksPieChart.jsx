/* eslint-disable import/prefer-default-export */
import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { UserProjectPieChart } from '../../../common/PieChart/ProjectPieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import './PeopleTasksPieChart.css';
// import { ProjectPieChart } from '~/components/Reports/ProjectReport/ProjectPieChart/ProjectPieChart';

export function PeopleTasksPieChart({ darkMode }) {
  const {
    tasksWithLoggedHoursById,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    // showViewAllTasksButton,
    hoursLoggedToProjectsOnly,
  } = useSelector(peopleTasksPieChartViewData);

  const showTasksPie = showTasksPieChart;
  
  // const [showAllTasks, setShowAllTasks] = useState(false);

  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  // function handleViewAll() {
  //   setShowAllTasks(prev => !prev);
  // }


  return (
    <div className={`people-pie-charts-wrapper ${darkMode ? 'text-light' : ''}`} >
      {hoursLoggedToProjectsOnly.length!==0 && (
        <ReportPage.ReportBlock darkMode={darkMode} >
          <div style={{
    height: showTasksPie ? '' : '615px', padding: showTasksPie ? '' : '90px' 
  }}>
     <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
          {hoursLoggedToProjectsOnly.length!==0 && <UserProjectPieChart
            pieChartId="projectsPieChart"
            darkMode={darkMode}
            projectsData={hoursLoggedToProjectsOnly}
            tasksData={tasksLegend}       
          />}
  </div>
         
        </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">
            {/* {`${
            showViewAllTasksButton ? 'Last ' : ''
          } */}
          Tasks With Completed Hours
          {/* } */}
          </h5>
          <PieChart
            pieChartId="tasksPieChart"
            darkMode={darkMode}
            data={tasksWithLoggedHoursById}
            tasksData={tasksLegend}
            projectsData={hoursLoggedToProjectsOnly}
          />
          {/* {showViewAllTasksButton && (
            <div>
              <div onClick={handleViewAll} className="show-all-tasks-button">
                {showAllTasks ? 'Collapse' : 'View all'}
              </div>
            </div>
          )} */}
        </ReportPage.ReportBlock>
      )}
    </div>
  );
}
