import { useSelector } from 'react-redux';
import { PieChart } from 'components/common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';

export const PeopleTasksPieChart = () => {

  const { tasksWithLoggedHours, showPieChart, tasksLegend } = useSelector(peopleTasksPieChartViewData);

  return (
    <div>
      {showPieChart && <PieChart data={tasksWithLoggedHours} dataLegend={tasksLegend} />}
    </div>
  )

}
