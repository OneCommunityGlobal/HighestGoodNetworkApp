import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { UserProjectPieChart } from '../../../common/PieChart/ProjectPieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import './PeopleTasksPieChart.css';
// import { ProjectPieChart } from 'components/Reports/ProjectReport/ProjectPieChart/ProjectPieChart';

export const PeopleTasksPieChart = ({ darkMode }) => {
  const {
    tasksWithLoggedHoursById,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    projectsWithLoggedHoursById,
    projectsWithLoggedHoursLegend,
    displayedTasksLegend,
    showViewAllTasksButton,
    hoursLoggedToProjectsOnly,
  } = useSelector(peopleTasksPieChartViewData);
  
  const [showAllTasks, setShowAllTasks] = useState(false);

  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  function handleViewAll() {
    setShowAllTasks(prev => !prev);
  }

  return (
    <div className={`people-pie-charts-wrapper ${darkMode ? 'text-light' : ''}`}>
      {showProjectsPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
          {hoursLoggedToProjectsOnly.length!==0 && <UserProjectPieChart
            pieChartId={'projectsPieChart'}
            dataLegendHeader="Hours"
            darkMode={darkMode}
            projectsData={hoursLoggedToProjectsOnly}       
          />}
        </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">{`${
            showViewAllTasksButton ? 'Last ' : ''
          }Tasks With Completed Hours`}</h5>
          <PieChart
            pieChartId={'tasksPieChart'}
            data={tasksWithLoggedHoursById}
            dataLegend={showAllTasks ? tasksLegend : displayedTasksLegend}
            chartLegend={tasksLegend}
            dataLegendHeader="Hours"
            darkMode={darkMode}
            project={false}
          />
          {showViewAllTasksButton && (
            <div>
              <div onClick={handleViewAll} className="show-all-tasks-button">
                {showAllTasks ? 'Collapse' : 'View all'}
              </div>
            </div>
          )}
        </ReportPage.ReportBlock>
      )}
    </div>
  );
};
