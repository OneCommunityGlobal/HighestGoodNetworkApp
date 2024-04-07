import {useState}from 'react';
import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import { NewModal } from '../../../common/NewModal';
import './PeopleTasksPieChart.css';

export const PeopleTasksPieChart = ({darkMode}) => {
  const {
    tasksWithLoggedHoursById,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    projectsWithLoggedHoursById,
    projectsWithLoggedHoursLegend,
    displayedTasksWithLoggedHoursById,
    displayedTasksLegend,
    showViewAllTasksButton,
  } = useSelector(peopleTasksPieChartViewData);

  const [showAllTasks, setShowAllTasks] = useState(false);

  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  function handleViewAll(){
    setShowAllTasks(prev => !prev);
  }


  return (
    <div className={`people-pie-charts-wrapper ${darkMode ? 'text-light' : ''}`}>
      {showProjectsPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
          <PieChart
            pieChartId={'projectsPieChart'}
            data={projectsWithLoggedHoursById}
            dataLegend={projectsWithLoggedHoursLegend}
            dataLegendHeader="Hours"
            darkMode={darkMode}
          />
        </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock darkMode={darkMode}>
          <h5 className="people-pie-charts-header">{`${
            showViewAllTasksButton ? 'Last ' : ''
          }Tasks With Completed Hours`}</h5>
          {!showAllTasks && <PieChart
            pieChartId={'tasksPieChart'}
            data={displayedTasksWithLoggedHoursById}
            dataLegend={displayedTasksLegend}
            dataLegendHeader="Hours"
            darkMode={darkMode}
          />}
          {showViewAllTasksButton && (
         <div>               
           {showAllTasks &&   <PieChart
                pieChartId={'allTasksPieChart'}
                data={tasksWithLoggedHoursById}
                dataLegend={tasksLegend}
                dataLegendHeader="Hours"
                darkMode={darkMode}
              />}
               <div onClick={handleViewAll} className="show-all-tasks-button">
                  {showAllTasks ? "Collapse":  "View all"}
              </div>
        </div>
          )}
        </ReportPage.ReportBlock>
      )}
    </div>
  );

};
