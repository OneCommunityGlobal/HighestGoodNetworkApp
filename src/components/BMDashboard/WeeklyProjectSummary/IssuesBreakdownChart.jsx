import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import Loading from '../../common/Loading/Loading';
import httpService from '../../../services/httpService';
import styles from './IssueBreakdownChart.module.css';

/**
 * Fixed color constants for the three issue types.
 * These colors are fixed and must not be changed or generated dynamically.
 * Colors work in both light and dark modes.
 */
const COLORS = {
  equipmentIssues: '#4F81BD', // blue - Equipment Issues (always)
  laborIssues: '#C0504D', // red - Labor Issues (always)
  materialIssues: '#F3C13A', // yellow - Materials Issues (always)
};

// Fixed issue types for filter (display names)
const FIXED_ISSUE_TYPES = ['Equipment Issues', 'Labor Issues', 'Materials Issues'];

// Map display names to API property names
const ISSUE_TYPE_MAPPING = {
  'Equipment Issues': 'equipmentIssues',
  'Labor Issues': 'laborIssues',
  'Materials Issues': 'materialIssues',
};

export default function IssuesBreakdownChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Get projects from Redux
  const reduxProjects = useSelector(state => state.bmProjects || state.allProjects?.projects || []);

  // Filter states
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState([]);

  // Available options states
  const [availableIssueTypes, setAvailableIssueTypes] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  // Ref for debouncing timeout
  const debounceTimeoutRef = useRef(null);
  // Ref for abort controller to cancel API calls on unmount
  const abortControllerRef = useRef(null);

  const rootStyles = getComputedStyle(document.body);
  const textColor = rootStyles.getPropertyValue('--text-color') || '#666';
  const gridColor = rootStyles.getPropertyValue('--grid-color') || (darkMode ? '#444' : '#ccc');
  const tooltipBg = rootStyles.getPropertyValue('--section-bg') || '#fff';

  /**
   * Process API response data to map to three fixed issue types
   * Ensures each project has equipmentIssues, laborIssues, and materialIssues properties
   */
  const processChartData = useCallback(apiData => {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(project => {
      // Extract projectId and projectName
      const processedProject = {
        projectId: project.projectId || project._id || '',
        projectName: project.projectName || project.name || '',
        equipmentIssues: 0,
        laborIssues: 0,
        materialIssues: 0,
      };

      // Track which properties we've already matched exactly
      const matchedKeys = new Set();

      // Check if API returns properties matching the fixed types directly
      if (project.equipmentIssues !== undefined) {
        processedProject.equipmentIssues = Number(project.equipmentIssues) || 0;
        matchedKeys.add('equipmentIssues');
      }
      if (project.laborIssues !== undefined) {
        processedProject.laborIssues = Number(project.laborIssues) || 0;
        matchedKeys.add('laborIssues');
      }
      if (project.materialIssues !== undefined) {
        processedProject.materialIssues = Number(project.materialIssues) || 0;
        matchedKeys.add('materialIssues');
      }
      if (project.materialsIssues !== undefined) {
        processedProject.materialIssues = Number(project.materialsIssues) || 0;
        matchedKeys.add('materialsIssues');
      }

      // Map remaining properties that don't match exactly
      // This handles cases where API returns different property names
      Object.keys(project).forEach(key => {
        // Skip project metadata and already matched keys
        if (
          key === 'projectId' ||
          key === 'projectName' ||
          key === '_id' ||
          key === 'name' ||
          matchedKeys.has(key)
        ) {
          return;
        }

        const value = Number(project[key]) || 0;
        if (value === 0) return; // Skip zero values

        const lowerKey = key.toLowerCase();

        // Map to equipmentIssues if not already set or if pattern matches
        if (
          !matchedKeys.has('equipmentIssues') &&
          (lowerKey.includes('equipment') ||
            lowerKey.includes('tool') ||
            lowerKey.includes('machine'))
        ) {
          processedProject.equipmentIssues += value;
        }
        // Map to laborIssues if not already set or if pattern matches
        else if (
          !matchedKeys.has('laborIssues') &&
          (lowerKey.includes('labor') || lowerKey.includes('labour') || lowerKey === 'labor')
        ) {
          processedProject.laborIssues += value;
        }
        // Map to materialIssues if not already set or if pattern matches
        else if (
          !matchedKeys.has('materialIssues') &&
          (lowerKey.includes('material') ||
            lowerKey.includes('supply') ||
            lowerKey.includes('resource'))
        ) {
          processedProject.materialIssues += value;
        }
        // For other types (Safety, Weather, METs quality / functionality, etc.):
        // If all three fixed types are already set from exact matches, ignore
        // Otherwise, we could aggregate into "Other" but for now we maintain the three fixed structure
      });

      return processedProject;
    });
  }, []);

  const handleStartDateChange = useCallback(e => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Validate: endDate must be >= startDate
    setEndDate(prevEndDate => {
      if (prevEndDate && newStartDate && prevEndDate < newStartDate) {
        // If endDate is before new startDate, adjust endDate to startDate
        return newStartDate;
      }
      return prevEndDate;
    });
  }, []);

  const handleEndDateChange = useCallback(e => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Validate: endDate must be >= startDate
    setStartDate(prevStartDate => {
      if (prevStartDate && newEndDate && newEndDate < prevStartDate) {
        // If new endDate is before startDate, adjust startDate to endDate
        return newEndDate;
      }
      return prevStartDate;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    // Clear all filters
    setSelectedProjects([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedIssueTypes([]);
    // Data refetch will be triggered automatically by useEffect when state changes
  }, []);

  const fetchData = useCallback(
    async filters => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);

        // Validate date range
        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          setError('Start date must be before or equal to end date');
          setLoading(false);
          return;
        }

        // Build query string with URLSearchParams
        const params = new URLSearchParams();

        // Handle empty arrays: if no projects selected, fetch all (don't send projects param)
        if (filters.projects && filters.projects.length > 0) {
          params.append('projects', filters.projects.join(','));
        }

        if (filters.startDate) {
          params.append('startDate', filters.startDate);
        }

        if (filters.endDate) {
          params.append('endDate', filters.endDate);
        }

        // Handle empty arrays: if no issue types selected, fetch all (don't send issueTypes param)
        if (filters.issueTypes && filters.issueTypes.length > 0) {
          // Map display names to API property names
          const apiIssueTypes = filters.issueTypes
            .map(displayName => ISSUE_TYPE_MAPPING[displayName] || displayName)
            .filter(Boolean); // Remove any undefined values
          if (apiIssueTypes.length > 0) {
            params.append('issueTypes', apiIssueTypes.join(','));
          }
        }

        const queryString = params.toString();
        const url = `${process.env.REACT_APP_APIENDPOINT}/issues/breakdown${
          queryString ? `?${queryString}` : ''
        }`;

        const response = await httpService.get(url, { signal: abortController.signal });

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Ensure response.data is valid
        if (!response || !response.data) {
          setError('Invalid response from server');
          setData([]);
          setLoading(false);
          return;
        }

        // Process API response to map to three fixed issue types
        const processedData = processChartData(response.data);
        setData(processedData);
        setError(null);
      } catch (err) {
        // Don't set error if request was aborted
        if (abortController.signal.aborted || err.name === 'AbortError') {
          return;
        }

        // Handle 400 errors (validation errors) with user-friendly messages
        if (err.response && err.response.status === 400) {
          const errorMessage =
            err.response.data?.error || err.response.data?.message || 'Invalid filter parameters';
          setError(errorMessage);
        } else if (err.response) {
          // Handle other HTTP errors
          const status = err.response.status;
          const errorMessage =
            err.response.data?.error ||
            err.response.data?.message ||
            `Server error (${status}). Please try again.`;
          setError(errorMessage);
        } else if (err.request) {
          // Handle network errors (no response received)
          setError('Network error. Please check your connection and try again.');
        } else {
          // Handle other errors
          setError(err.message || 'Failed to fetch issue statistics. Please try again.');
        }
        setData([]); // Clear data on error
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [processChartData],
  );

  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce API calls to prevent excessive requests
    debounceTimeoutRef.current = setTimeout(() => {
      const filters = {
        projects: selectedProjects,
        startDate,
        endDate,
        issueTypes: selectedIssueTypes,
      };
      fetchData(filters);
    }, 300);

    // Cleanup function to clear timeout on unmount or when dependencies change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedProjects, startDate, endDate, selectedIssueTypes, fetchData]);

  // Cleanup API calls on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending API request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear any pending timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await httpService.get(`${process.env.REACT_APP_APIENDPOINT}/issues/types`);
        if (response.data && response.data.issueTypes) {
          setAvailableIssueTypes(response.data.issueTypes);
        }
      } catch (err) {
        // Chart can work without issue types filter - set to empty array
        setAvailableIssueTypes([]);
      }
    };

    fetchIssueTypes();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // Use Redux store if available
      if (reduxProjects && reduxProjects.length > 0) {
        setAvailableProjects(reduxProjects);
        return;
      }

      // Fetch from API if not in Redux
      try {
        const response = await httpService.get(`${process.env.REACT_APP_APIENDPOINT}/projects`);
        if (response.data && Array.isArray(response.data)) {
          setAvailableProjects(response.data);
        }
      } catch (err) {
        // Chart can work without projects filter - set to empty array
        setAvailableProjects([]);
      }
    };

    fetchProjects();
  }, [reduxProjects]);

  // Memoize react-select options to prevent unnecessary re-renders
  const projectOptions = useMemo(
    () =>
      availableProjects.map(project => ({
        value: project._id || project.projectId,
        label: project.name || project.projectName || project._id || project.projectId,
      })),
    [availableProjects],
  );

  const selectedProjectValues = useMemo(
    () =>
      availableProjects
        .filter(project => selectedProjects.includes(project._id || project.projectId))
        .map(project => ({
          value: project._id || project.projectId,
          label: project.name || project.projectName || project._id || project.projectId,
        })),
    [availableProjects, selectedProjects],
  );

  const issueTypeOptions = useMemo(
    () =>
      FIXED_ISSUE_TYPES.map(type => ({
        value: type,
        label: type,
      })),
    [],
  );

  const selectedIssueTypeValues = useMemo(
    () =>
      selectedIssueTypes.map(type => ({
        value: type,
        label: type,
      })),
    [selectedIssueTypes],
  );

  // Memoize handlers for react-select onChange
  const handleProjectChange = useCallback(selectedOptions => {
    setSelectedProjects(selectedOptions ? selectedOptions.map(option => option.value) : []);
  }, []);

  const handleIssueTypeChange = useCallback(selectedOptions => {
    setSelectedIssueTypes(selectedOptions ? selectedOptions.map(option => option.value) : []);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>Issues breakdown by Type</h2>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span
              className={styles.legendBox}
              style={{ backgroundColor: COLORS.equipmentIssues }}
            />
            <span className={styles.legendLabel}>Equipment Issues</span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.laborIssues }} />
            <span className={styles.legendLabel}>Labor Issues</span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.materialIssues }} />
            <span className={styles.legendLabel}>Materials Issues</span>
          </span>
        </div>

        {/* Filters Section */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="project-filter" className={styles.filterLabel}>
              Project
            </label>
            <Select
              id="project-filter"
              isMulti
              classNamePrefix="customSelect"
              options={projectOptions}
              value={selectedProjectValues}
              onChange={handleProjectChange}
              placeholder="Select Projects"
              isClearable
              isDisabled={availableProjects.length === 0}
              styles={
                darkMode
                  ? {
                      control: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        borderColor: '#364156',
                        minHeight: '38px',
                        fontSize: '14px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        fontSize: '14px',
                      }),
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isSelected
                          ? '#0d55b3'
                          : state.isFocused
                          ? '#364156'
                          : '#2c3344',
                        color: state.isSelected ? '#fff' : '#e0e0e0',
                        fontSize: '14px',
                      }),
                      multiValue: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#375071',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: baseStyles => ({
                        ...baseStyles,
                        color: '#fff',
                        fontSize: '12px',
                      }),
                      multiValueRemove: baseStyles => ({
                        ...baseStyles,
                        color: '#fff',
                        ':hover': {
                          backgroundColor: '#0d55b3',
                          color: '#fff',
                        },
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
                  : {
                      control: baseStyles => ({
                        ...baseStyles,
                        minHeight: '38px',
                        fontSize: '14px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        fontSize: '14px',
                      }),
                      option: baseStyles => ({
                        ...baseStyles,
                        fontSize: '14px',
                      }),
                      multiValue: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#e2e7ee',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: baseStyles => ({
                        ...baseStyles,
                        color: '#333',
                        fontSize: '12px',
                      }),
                      multiValueRemove: baseStyles => ({
                        ...baseStyles,
                        color: '#333',
                        ':hover': {
                          backgroundColor: '#0d55b3',
                          color: '#fff',
                        },
                      }),
                    }
              }
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="start-date-picker" className={styles.filterLabel}>
              Date Range
            </label>
            <div className={styles.datePickerGroup}>
              <input
                id="start-date-picker"
                type="date"
                className={styles.datePicker}
                value={startDate || ''}
                onChange={handleStartDateChange}
                aria-label="Start date"
              />
              <span className={styles.dateSeparator}>to</span>
              <input
                id="end-date-picker"
                type="date"
                className={styles.datePicker}
                value={endDate || ''}
                onChange={handleEndDateChange}
                min={startDate || ''}
                aria-label="End date"
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="issue-type-filter" className={styles.filterLabel}>
              Issue Type
            </label>
            <Select
              id="issue-type-filter"
              isMulti
              classNamePrefix="customSelect"
              options={issueTypeOptions}
              value={selectedIssueTypeValues}
              onChange={handleIssueTypeChange}
              placeholder="Select Issue Types"
              isClearable
              styles={
                darkMode
                  ? {
                      control: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        borderColor: '#364156',
                        minHeight: '38px',
                        fontSize: '14px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        fontSize: '14px',
                      }),
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isSelected
                          ? '#0d55b3'
                          : state.isFocused
                          ? '#364156'
                          : '#2c3344',
                        color: state.isSelected ? '#fff' : '#e0e0e0',
                        fontSize: '14px',
                      }),
                      multiValue: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#375071',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: baseStyles => ({
                        ...baseStyles,
                        color: '#fff',
                        fontSize: '12px',
                      }),
                      multiValueRemove: baseStyles => ({
                        ...baseStyles,
                        color: '#fff',
                        ':hover': {
                          backgroundColor: '#0d55b3',
                          color: '#fff',
                        },
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
                  : {
                      control: baseStyles => ({
                        ...baseStyles,
                        minHeight: '38px',
                        fontSize: '14px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        fontSize: '14px',
                      }),
                      option: baseStyles => ({
                        ...baseStyles,
                        fontSize: '14px',
                      }),
                      multiValue: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#e2e7ee',
                        borderRadius: '6px',
                      }),
                      multiValueLabel: baseStyles => ({
                        ...baseStyles,
                        color: '#333',
                        fontSize: '12px',
                      }),
                      multiValueRemove: baseStyles => ({
                        ...baseStyles,
                        color: '#333',
                        ':hover': {
                          backgroundColor: '#0d55b3',
                          color: '#fff',
                        },
                      }),
                    }
              }
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className={styles.resetButtonContainer}>
          <button
            type="button"
            onClick={handleResetFilters}
            className={styles.resetButton}
            style={{
              backgroundColor: darkMode ? '#DE6A6A' : '#f44336',
              color: darkMode ? '#0d1b2a' : 'white',
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          <i className="fa fa-exclamation-circle" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loading align="center" darkMode={darkMode} />
            <div className={styles.loadingText}>Loading issue statistics...</div>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            <div className={styles.errorText}>{error}</div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className={styles.emptyContainer}>
            <i className="fa fa-chart-bar" aria-hidden="true" />
            <div className={styles.emptyText}>No data available</div>
            <div className={styles.emptySubtext}>
              Try adjusting your filters or check back later.
            </div>
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="projectName" tick={{ fill: textColor }} />
              <YAxis allowDecimals={false} tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: 'none',
                  borderRadius: '8px',
                  color: textColor,
                }}
              />
              {/* Fixed three bars: Equipment Issues, Labor Issues, Materials Issues */}
              <Bar dataKey="equipmentIssues" name="Equipment Issues" fill={COLORS.equipmentIssues}>
                <LabelList dataKey="equipmentIssues" position="top" fill={textColor} />
              </Bar>
              <Bar dataKey="laborIssues" name="Labor Issues" fill={COLORS.laborIssues}>
                <LabelList dataKey="laborIssues" position="top" fill={textColor} />
              </Bar>
              <Bar dataKey="materialIssues" name="Materials Issues" fill={COLORS.materialIssues}>
                <LabelList dataKey="materialIssues" position="top" fill={textColor} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
