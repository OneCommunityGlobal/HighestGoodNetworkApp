import { useSelector } from 'react-redux';
import ApplicationTimeChart from './ApplicationTimeChart';
import styles from './ApplicationTimeChart.module.css';

function ApplicationTimeChartContainer() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  return (
    <div className={`${styles.pageContainer} ${darkMode ? styles.darkMode : ''}`}>
      <ApplicationTimeChart />
    </div>
  );
}

export default ApplicationTimeChartContainer;
