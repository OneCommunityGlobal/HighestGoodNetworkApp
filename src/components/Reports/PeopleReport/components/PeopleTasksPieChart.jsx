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

  const DONUT_MIN = 260;   // px the donut needs
  const ROW_H = 26;        // legend row height
  const HEADER_H = 32;
  const VSPACE = 24;
  
  const projectsHeight = Math.max(
    DONUT_MIN,
    HEADER_H + VSPACE + ROW_H * Math.max(1, hoursLoggedToProjectsOnly.length)
  );
  const tasksHeight = Math.max(
    DONUT_MIN,
    HEADER_H + VSPACE + ROW_H * Math.max(1, tasksLegend.length)
  );

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
        <ReportPage.ReportBlock darkMode={darkMode} style={{ overflow: 'visible' }} className="pie-no-scroll">
        <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
        <div style={{ width: '100%', minHeight: projectsHeight }}>
        <div className="people-report-pie-wrapper">
          <UserProjectPieChart
            pieChartId="projectsPieChart"
            darkMode={darkMode}
            projectsData={hoursLoggedToProjectsOnly}
            tasksData={tasksLegend}
          />
          </div>
        </div>
      </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode} style={{ overflow: 'visible' }} className="pie-no-scroll">
        <h5 className="people-pie-charts-header">Tasks With Completed Hours</h5>
        <div style={{ width: '100%', minHeight: tasksHeight }}>
          <PieChart
            pieChartId="tasksPieChart"
            darkMode={darkMode}
            data={tasksWithLoggedHoursById}
            tasksData={tasksLegend}
            projectsData={hoursLoggedToProjectsOnly}
            height={tasksHeight}     // pass down
          />
        </div>
      </ReportPage.ReportBlock>
      )}
    </div>
  );
}
