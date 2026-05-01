// React is needed for JSX transformation
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';
import ToolsHorizontalBarChart from './ToolsHorizontalBarChart';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsAvailabilityPage.module.css';

function ToolsAvailabilityPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
        setProjects(response.data);
      } catch (err) {
        // Error logging should be replaced with proper logging service
        // eslint-disable-next-line no-console
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const projectOptions = projects.map(project => ({
    value: project.projectId,
    label: project.projectId,
  }));

  const handleProjectChange = selectedOption => {
    setSelectedProject(selectedOption);
  };

  const handleStartDateChange = e => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = e => {
    setEndDate(e.target.value);
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Apply dark mode styles to document body when in dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    // Add dark mode CSS
    if (!document.getElementById('dark-mode-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dark-mode-styles';
      styleElement.innerHTML = `
        .dark-mode-body .tools-availability-page {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .tools-availability-content {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .recharts-wrapper,
        .dark-mode-body .recharts-surface {
          background-color: #1e2736 !important;
        }
        .dark-mode-body .recharts-layer {
          background-color: #1e2736 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  const darkModeStyles = darkMode
    ? {
        backgroundColor: '#1e2736',
        color: '#e0e0e0',
      }
    : {};

  // Render project selection based on loading and error states
  const renderProjectSelection = () => {
    if (loading) {
      return <div className="select-loading">Loading projects...</div>;
    }

    if (error) {
      return <div className="select-error">{error}</div>;
    }

    return (
      <Select
        id="project-select"
        className="project-select"
        classNamePrefix="select"
        value={selectedProject}
        onChange={handleProjectChange}
        options={projectOptions}
        placeholder="Select a project ID to view data"
        isClearable={false}
        isDisabled={projects.length === 0}
        styles={
          darkMode
            ? {
                control: baseStyles => ({
                  ...baseStyles,
                  backgroundColor: '#2c3344',
                  borderColor: '#364156',
                }),
                menu: baseStyles => ({
                  ...baseStyles,
                  backgroundColor: '#2c3344',
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                  color: '#e0e0e0',
                }),
                singleValue: baseStyles => ({
                  ...baseStyles,
                  color: '#e0e0e0',
                }),
                placeholder: baseStyles => ({
                  ...baseStyles,
                  color: '#aaaaaa',
                }),
              }
            : {}
        }
      />
    );
  };

  return (
    <div
      className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}
      style={darkModeStyles}
    >
      <div className="tools-availability-content" style={darkModeStyles}>
        <div className="tools-chart-filters">
          <div className="filter-group">
            <label htmlFor="project-select">Project</label>
            {renderProjectSelection()}
          </div>
          <div className="filter-group">
            <label htmlFor="tools-start-date">Date Range (Optional)</label>
            <div className="date-picker-group">
              <input
                id="tools-start-date"
                type="date"
                className="date-picker"
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="Start date"
                aria-label="Start date"
              />
              <span>to</span>
              <input
                type="date"
                className="date-picker"
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="End date"
                aria-label="End date"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  className="clear-dates-btn"
                  onClick={handleClearDates}
                  aria-label="Clear date filters"
                  title="Clear date filters"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <ToolsHorizontalBarChart
          darkMode={darkMode}
          isFullPage
          projectId={selectedProject?.value}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}

export default ToolsAvailabilityPage;
