import { useSelector } from 'react-redux';
import { PieChart } from 'components/common/PieChart';
import { peopleTasksPieChartViewData } from '../selectors';
import './PeopleTasksPieChart.css';

export const PeopleTasksPieChart = () => {

  const { tasksWithLoggedHours, showPieChart } = useSelector(peopleTasksPieChartViewData);

  const getColorByTask = (tasksWithLoggedHours) => {

    return tasksWithLoggedHours.reduce((result, { _id }, index) => (
      { ...result, [_id]: color[index] }), {}
    );
  }

  return (
    <div className='pie-chart-wrapper'>
      {showPieChart && <PieChart data={tasksWithLoggedHours} />}
      <div className='pie-chart-legend'></div>
    </div>
  )

}
