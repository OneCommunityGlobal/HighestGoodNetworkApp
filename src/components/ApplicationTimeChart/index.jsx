import { useSelector } from 'react-redux';
import ApplicationTimeChart from './ApplicationTimeChart';

function ApplicationTimeChartContainer() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : ''}
      style={{
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: darkMode ? '#0b1324' : '#f8f9fa',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <ApplicationTimeChart />
    </div>
  );
}

export default ApplicationTimeChartContainer;
