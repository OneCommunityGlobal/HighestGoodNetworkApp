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
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...projects.map(project => ({
      value: project.projectId,
      label: project.projectId,
    })),
  ];

  const handleProjectChange = selectedOption => {
    if (selectedOption && selectedOption.value === 'all') {
      setSelectedProject(null);
    } else {
      setSelectedProject(selectedOption);
    }
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

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tools-availability-content">
        <div className="tools-chart-filters">
          <div className="filter-group">
            <label htmlFor="project-select">Project</label>
            {loading ? (
              <div className="select-loading">Loading projects...</div>
            ) : error ? (
              <div className="select-error">{error}</div>
            ) : (
              <Select
                id="project-select"
                className="project-select"
                classNamePrefix="select"
                value={selectedProject || projectOptions[0]}
                onChange={handleProjectChange}
                options={projectOptions}
                placeholder="Select a project ID"
                isDisabled={projects.length === 0}
              />
            )}
          </div>
          <div className="filter-group">
            <label>Date Range (Optional)</label>
            <div className="date-picker-group">
              <input
                type="date"
                className="date-picker"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <span>to</span>
              <input
                type="date"
                className="date-picker"
                value={endDate}
                onChange={handleEndDateChange}
              />
              {(startDate || endDate) && (
                <button
                  className="clear-dates-btn"
                  onClick={handleClearDates}
                  aria-label="Clear date filters"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <ToolsHorizontalBarChart
          darkMode={darkMode}
          isFullPage={true}
          projectId={selectedProject?.value}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}

export default ToolsAvailabilityPage;
