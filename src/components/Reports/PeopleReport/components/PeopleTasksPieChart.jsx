import { useSelector } from 'react-redux';
import { PieChart } from 'components/common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportBlock } from 'components/Reports/sharedComponents/ReportBlock';

export const PeopleTasksPieChart = () => {

  const { tasksWithLoggedHours, showPieChart, tasksLegend } = useSelector(peopleTasksPieChartViewData);

  if (!showPieChart) {
    return null;
  }

  return (
    <ReportBlock>
      <PieChart data={tasksWithLoggedHours} dataLegend={tasksLegend} />
    </ReportBlock>
  )

}
