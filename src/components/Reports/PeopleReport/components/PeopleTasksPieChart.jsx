/* eslint-disable import/prefer-default-export */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import './PeopleTasksPieChart.css';

export function PeopleTasksPieChart({ darkMode }) {
  const {
    tasksWithLoggedHoursById,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    projectsWithLoggedHoursById,
    projectsWithLoggedHoursLegend,
    displayedTasksLegend,
    showViewAllTasksButton,
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
          <div className="pie-chart-container">
            <PieChart
              pieChartId="projectsPieChart"
              data={projectsWithLoggedHoursById}
              dataLegend={projectsWithLoggedHoursLegend}
              chartLegend={projectsWithLoggedHoursLegend}
              dataLegendHeader="Hours"
              darkMode={darkMode}
            />
          </div>
        </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">{`${showViewAllTasksButton ? 'Last ' : ''
            }Tasks With Completed Hours`}</h5>
          <div className="pie-chart-container">
            <PieChart
              pieChartId="tasksPieChart"
              data={tasksWithLoggedHoursById}
              dataLegend={showAllTasks ? tasksLegend : displayedTasksLegend}
              chartLegend={tasksLegend}
              dataLegendHeader="Hours"
              darkMode={darkMode}
            />
          </div>
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
}
