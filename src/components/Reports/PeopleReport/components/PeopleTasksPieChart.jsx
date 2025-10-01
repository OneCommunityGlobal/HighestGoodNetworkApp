import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import './PeopleTasksPieChart.css';

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
  } = useSelector(peopleTasksPieChartViewData);

  const [showAllTasks, setShowAllTasks] = useState(false);

  // This is a more robust way to handle the key press for accessibility
  const handleViewAllKeyPress = (event) => {
    // This allows the "button" to be activated with Enter or Space, like a real button
    if (event.key === 'Enter' || event.key === ' ') {
      setShowAllTasks(prev => !prev);
    }
  };

  const handleViewAllClick = () => {
    setShowAllTasks(prev => !prev);
  };

  return (
    <div className={`people-pie-charts-wrapper ${darkMode ? 'text-light' : ''}`}>
      {!showProjectsPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
          <PieChart
            pieChartId={'projectsPieChart'}
            data={projectsWithLoggedHoursById}
            dataLegend={projectsWithLoggedHoursLegend}
            chartLegend={projectsWithLoggedHoursLegend}
            dataLegendHeader="Hours"
            darkMode={darkMode}
          />
        </ReportPage.ReportBlock>
      )}
      {!showTasksPieChart && (
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
          />
          {showViewAllTasksButton && (
            <div>
              <div
                onClick={handleViewAllClick}
                onKeyDown={handleViewAllKeyPress}
                role="button"
                tabIndex={0}
                className="show-all-tasks-button"
              >
                {showAllTasks ? 'Collapse' : 'View all'}
              </div>
            </div>
          )}
        </ReportPage.ReportBlock>
      )}
    </div>
  );
};
