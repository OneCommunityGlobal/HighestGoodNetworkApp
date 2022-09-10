import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart } from 'components/common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportBlock } from 'components/Reports/sharedComponents/ReportBlock';
import './PeopleTasksPieChart.css';

export const PeopleTasksPieChart = () => {

  const {
    tasksWithLoggedHours,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    projectsWithLoggedHours,
    projectsWithLoggedHoursLegend
  } = useSelector(peopleTasksPieChartViewData);

  const [hideTasksPieChart, setHideTasksPieChart] = useState(false);

  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  return (
    <ReportBlock>
      <div className='people-pie-charts-wrapper'>
        {showProjectsPieChart && <PieChart pieChartId={'projectsPieChart'} data={projectsWithLoggedHours} dataLegend={projectsWithLoggedHoursLegend} />}
        {showTasksPieChart && !hideTasksPieChart && <PieChart pieChartId={'tasksPieChart'} data={tasksWithLoggedHours} dataLegend={tasksLegend} />}
      </div>
    </ReportBlock>
  )

}
