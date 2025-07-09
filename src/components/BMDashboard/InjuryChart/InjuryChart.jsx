// InjuryChart.jsx - Main container component
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';

// Correctly import fetchBMProjects
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions'; // Adjust path as needed

import InjuryChartForm from './InjuryChartForm';
import './InjuryChart.css'; // Your custom styles for InjuryChart

export default function InjuryChart() {
  const dispatch = useDispatch();
  // It's good practice to provide a fallback for errors if state.errors might be undefined initially
  const errors = useSelector(state => state.errors || {});
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Fetch projects on component mount using the correct action name
    dispatch(fetchBMProjects());
  }, [dispatch]); // Added dispatch to dependency array as per ESLint best practices

  // Trigger error state if an error object is populated
  useEffect(() => {
    // Check if errors object has any own properties (is not empty)
    if (Object.keys(errors).length > 0) {
      setIsError(true);
      // Optionally, you could log the error or show a toast
      // console.error("Errors from Redux store:", errors);
      // toast.error("Failed to load project data.");
    } else {
      setIsError(false); // Reset error state if errors are cleared
    }
  }, [errors]);

  // Error state display
  if (isError) {
    return (
      <main className="injury-chart-container p-4">
        <header className="injury-chart-header mb-3">
          <h2>Summary Dashboard: Injury Tracking</h2>
        </header>
        <div className="alert alert-danger" role="alert">
          <h4>Error Loading Data</h4>
          <p>There was an issue fetching the necessary project data. Please try again later.</p>
          {/* You might want to display more specific error details if available and appropriate */}
          {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
        </div>
      </main>
    );
  }

  return (
    <main className="injury-chart-container p-4">
      <header className="injury-chart-header mb-4 text-center">
        <h2 className="h3"> Dashboard: Injury Tracking</h2>
        <div className="injury-chart-info text-muted d-flex align-items-center justify-content-center">
          <BsInfoCircle className="me-2" />
          <span>Track injuries over time by severity level across projects.</span>
        </div>
      </header>
      <InjuryChartForm />
    </main>
  );
}
