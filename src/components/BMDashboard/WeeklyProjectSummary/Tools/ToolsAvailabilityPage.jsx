import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';
import ToolsHorizontalBarChart from './ToolsHorizontalBarChart';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsAvailabilityPage.css';

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

  // Get styles for dark mode
  const getControlStyles = baseStyles => {
    if (darkMode) {
      return {
        ...baseStyles,
        backgroundColor: '#2c3344',
        borderColor: '#364156',
      };
    }
    return baseStyles;
  };

  const getMenuStyles = baseStyles => {
    if (darkMode) {
      return {
        ...baseStyles,
        backgroundColor: '#2c3344',
      };
    }
    return baseStyles;
  };

  const getOptionStyles = (baseStyles, state) => {
    if (darkMode) {
      return {
        ...baseStyles,
        backgroundColor: state.isFocused ? '#364156' : '#2c3344',
        color: '#e0e0e0',
      };
    }
    return baseStyles;
  };

  const getSingleValueStyles = baseStyles => {
    if (darkMode) {
      return {
        ...baseStyles,
        color: '#e0e0e0',
      };
    }
    return baseStyles;
  };

  const getPlaceholderStyles = baseStyles => {
    if (darkMode) {
      return {
        ...baseStyles,
        color: '#aaaaaa',
      };
    }
    return baseStyles;
  };

  const getDarkModeStyles = () => {
    if (darkMode) {
      return {
        backgroundColor: '#2c3344',
        color: '#e0e0e0',
        borderColor: '#364156',
      };
    }
    return {};
  };

  const getLabelStyles = () => {
    if (darkMode) {
      return { color: '#e0e0e0' };
    }
    return {};
  };

  const getButtonStyles = () => {
    if (darkMode) {
      return {
        backgroundColor: '#364156',
        color: '#e0e0e0',
      };
    }
    return {};
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

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tools-availability-content">
        <div className="tools-chart-filters">
          <div className="filter-group">
            <label htmlFor="project-select" style={getLabelStyles()}>
              Project
            </label>
            {loading ? (
              <div className="select-loading">Loading projects...</div>
            ) : error ? (
              <div className="select-error">{error}</div>
            ) : (
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
                styles={{
                  control: getControlStyles,
                  menu: getMenuStyles,
                  option: getOptionStyles,
                  singleValue: getSingleValueStyles,
                  placeholder: getPlaceholderStyles,
                }}
              />
            )}
          </div>
          <div className="filter-group">
            <label style={getLabelStyles()}>Date Range (Optional)</label>
            <div className="date-picker-group">
              <input
                type="date"
                className="date-picker"
                value={startDate}
                onChange={handleStartDateChange}
                style={getDarkModeStyles()}
              />
              <span style={getLabelStyles()}>to</span>
              <input
                type="date"
                className="date-picker"
                value={endDate}
                onChange={handleEndDateChange}
                style={getDarkModeStyles()}
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  className="clear-dates-btn"
                  onClick={handleClearDates}
                  aria-label="Clear date filters"
                  style={getButtonStyles()}
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
