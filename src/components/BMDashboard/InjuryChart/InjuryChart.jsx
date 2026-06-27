import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';

import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

import InjuryChartForm from './InjuryChartForm';
import styles from './InjuryChart.module.css';

export default function InjuryChart() {
  const dispatch = useDispatch();

  const errors = useSelector(state => state.errors || {});
  const [isError, setIsError] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    // Fetch projects on component mount using the correct action name
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Trigger error state if an error object is populated
  useEffect(() => {
    // Check if errors object has any own properties (is not empty)
    if (Object.keys(errors).length > 0) {
      setIsError(true);
    } else {
      setIsError(false); // Reset error state if errors are cleared
    }
  }, [errors]);

  // Error state display
  if (isError) {
    return (
      <main className={`${styles.injuryChartContainer} p-4`}>
        <header className={`${styles.injuryChartHeader} mb-3`}>
          <h2>Summary Dashboard: Injury Tracking</h2>
        </header>
        <div className="alert alert-danger" role="alert">
          <h4>Error Loading Data</h4>
          <p>There was an issue fetching the necessary project data. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.injuryChartContainer} p-4 ${darkMode ? styles.wrapperDark : ''}`}>
      <header className={`${styles.injuryChartHeader} mb-4 text-center`}>
        <h2 className="h3"> Dashboard: Injury Tracking</h2>
        <div
          className={`${styles.injuryChartInfo} text-muted d-flex align-items-center justify-content-center`}
        >
          <BsInfoCircle className="me-2" />
          <span>Track injuries over time by severity level across projects.</span>
        </div>
      </header>
      <InjuryChartForm dark={darkMode} />
    </main>
  );
}
