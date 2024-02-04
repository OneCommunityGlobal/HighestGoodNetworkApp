import { useSelector } from 'react-redux';
import { PieChart } from '../../../common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import { NewModal } from '../../../common/NewModal';
import './PeopleTasksPieChart.css';

export const PeopleTasksPieChart = () => {
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

  const showAllTasks = () => {};

  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  return (
    <div className="people-pie-charts-wrapper">
      {showProjectsPieChart && (
        <ReportPage.ReportBlock>
          <h5 className="people-pie-charts-header">Projects With Completed Hours</h5>
          <PieChart
            pieChartId={'projectsPieChart'}
            data={projectsWithLoggedHoursById}
            dataLegend={projectsWithLoggedHoursLegend}
            dataLegendHeader="Hours"
          />
        </ReportPage.ReportBlock>
      )}
      {showTasksPieChart && (
        <ReportPage.ReportBlock>
          <h5 className="people-pie-charts-header">{`${
            showViewAllTasksButton ? 'Last ' : ''
          }Tasks With Completed Hours`}</h5>
          <PieChart
            pieChartId={'tasksPieChart'}
            data={displayedTasksWithLoggedHoursById}
            dataLegend={displayedTasksLegend}
            dataLegendHeader="Hours"
          />
          {showViewAllTasksButton && (
            <NewModal
              header={'Tasks With Completed Hours'}
              trigger={() => (
                <div onClick={showAllTasks} className="show-all-tasks-button">
                  View all
                </div>
              )}
            >
              <PieChart
                pieChartId={'allTasksPieChart'}
                data={tasksWithLoggedHoursById}
                dataLegend={tasksLegend}
                dataLegendHeader="Hours"
              />
            </NewModal>
          )}
        </ReportPage.ReportBlock>
      )}
    </div>
  );
};
