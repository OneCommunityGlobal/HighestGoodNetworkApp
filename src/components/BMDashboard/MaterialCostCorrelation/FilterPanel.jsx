import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import { fetchMaterialTypes } from '../../../actions/bmdashboard/invTypeActions';
import styles from './FilterPanel.module.css';
import PropTypes from 'prop-types';

/**
 * Filter Panel Component
 * Provides filtering controls for projects, material types, and date ranges
 * Includes preset date range buttons and reset functionality
 * @param {Array} selectedProjects - Array of selected project IDs
 * @param {Array} selectedMaterialTypes - Array of selected material type IDs
 * @param {Date|null} startDate - Start date for date range filter
 * @param {Date|null} endDate - End date for date range filter
 * @param {Function} onProjectChange - Callback when project selection changes
 * @param {Function} onMaterialTypeChange - Callback when material type selection changes
 * @param {Function} onDateRangeChange - Callback when date range changes
 * @param {Function} onResetFilters - Callback to reset all filters
 * @param {boolean} darkMode - Whether dark mode is enabled
 */
function FilterPanel({
  selectedProjects,
  selectedMaterialTypes,
  startDate,
  endDate,
  onProjectChange,
  onMaterialTypeChange,
  onDateRangeChange,
  onResetFilters,
  darkMode,
}) {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects || []);
  const materialTypes = useSelector(state => state.bmInvTypes?.list || []);

  const [projectOptions, setProjectOptions] = useState([]);
  const [materialTypeOptions, setMaterialTypeOptions] = useState([]);

  // Fetch projects on mount
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Fetch material types on mount
  useEffect(() => {
    dispatch(fetchMaterialTypes());
  }, [dispatch]);

  // Build project options
  useEffect(() => {
    const options = [
      { value: 'all', label: 'All Projects' },
      ...projects.map(project => ({
        value: project._id,
        label: project.name,
      })),
    ];
    setProjectOptions(options);
  }, [projects]);

  // Build material type options
  useEffect(() => {
    const options = [
      { value: 'all', label: 'All Materials' },
      ...materialTypes.map(material => ({
        value: material._id,
        label: material.name,
      })),
    ];
    setMaterialTypeOptions(options);
  }, [materialTypes]);

  const handleProjectChange = selected => {
    if (!selected || selected.length === 0) {
      onProjectChange([]);
      return;
    }

    const hasAll = selected.some(option => option.value === 'all');
    const realSelections = selected.filter(option => option.value !== 'all');

    // If the user just picked "All Projects" alongside existing real selections,
    // treat it as resetting to "all" (clear filter). If they picked a real
    // project while "all" was already selected, drop "all" and keep the real one.
    if (hasAll && realSelections.length === selected.length - 1 && realSelections.length > 0) {
      onProjectChange(realSelections.map(option => option.value));
    } else if (hasAll) {
      onProjectChange([]);
    } else {
      onProjectChange(realSelections.map(option => option.value));
    }
  };

  const handleMaterialTypeChange = selected => {
    if (!selected || selected.length === 0) {
      onMaterialTypeChange([]);
      return;
    }

    const hasAll = selected.some(option => option.value === 'all');
    const realSelections = selected.filter(option => option.value !== 'all');

    if (hasAll && realSelections.length === selected.length - 1 && realSelections.length > 0) {
      onMaterialTypeChange(realSelections.map(option => option.value));
    } else if (hasAll) {
      onMaterialTypeChange([]);
    } else {
      onMaterialTypeChange(realSelections.map(option => option.value));
    }
  };

  const handlePresetDateRange = preset => {
    const today = new Date();
    let newStartDate = null;
    let newEndDate = null;

    switch (preset) {
      case 'lastWeek':
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - 7);
        newEndDate = today;
        break;
      case 'lastMonth':
        newStartDate = new Date(today);
        newStartDate.setMonth(today.getMonth() - 1);
        newEndDate = today;
        break;
      case 'last3Months':
        newStartDate = new Date(today);
        newStartDate.setMonth(today.getMonth() - 3);
        newEndDate = today;
        break;
      case 'allTime':
        break;
      default:
        return;
    }

    onDateRangeChange(newStartDate, newEndDate);
  };

  const selectedProjectOptions =
    selectedProjects.length === 0
      ? [{ value: 'all', label: 'All Projects' }]
      : projectOptions.filter(option => selectedProjects.includes(option.value));

  const selectedMaterialTypeOptions =
    selectedMaterialTypes.length === 0
      ? [{ value: 'all', label: 'All Materials' }]
      : materialTypeOptions.filter(option => selectedMaterialTypes.includes(option.value));

  return (
    <div className={`${styles.filterPanel} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.filterGrid}>
        {/* Project Filter */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Projects</div>
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjectOptions}
            onChange={handleProjectChange}
            placeholder="Select projects..."
            classNamePrefix="select"
            classNames={{
              control: () => (darkMode ? styles.controlDark : styles.controlLight),
              menu: () => (darkMode ? styles.menuDark : styles.menuLight),
              option: () => (darkMode ? styles.optionDark : styles.optionLight),
              multiValue: () => (darkMode ? styles.multiValueDark : styles.multiValueLight),
              multiValueLabel: () =>
                darkMode ? styles.multiValueLabelDark : styles.multiValueLabelLight,
            }}
          />
        </div>

        {/* Material Type Filter */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Material Types</div>
          <Select
            isMulti
            options={materialTypeOptions}
            value={selectedMaterialTypeOptions}
            onChange={handleMaterialTypeChange}
            placeholder="Select material types..."
            classNamePrefix="select"
            classNames={{
              control: () => (darkMode ? styles.controlDark : styles.controlLight),
              menu: () => (darkMode ? styles.menuDark : styles.menuLight),
              option: () => (darkMode ? styles.optionDark : styles.optionLight),
              multiValue: () => (darkMode ? styles.multiValueDark : styles.multiValueLight),
              multiValueLabel: () =>
                darkMode ? styles.multiValueLabelDark : styles.multiValueLabelLight,
            }}
          />
        </div>

        {/* Date Range */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Date Range</div>
          <div className={styles.dateRangeContainer}>
            <DatePicker
              selected={startDate}
              onChange={date => onDateRangeChange(date, endDate)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
              className={darkMode ? styles.datePickerDark : styles.datePickerLight}
              isClearable
            />
            <span className={styles.dateSeparator}>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => onDateRangeChange(startDate, date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
              className={darkMode ? styles.datePickerDark : styles.datePickerLight}
              isClearable
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>&nbsp;</div>
          <button
            type="button"
            onClick={onResetFilters}
            className={`${styles.resetButton} ${
              darkMode ? styles.resetButtonDark : styles.resetButtonLight
            }`}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Preset date-range shortcuts — full-width horizontal row below the filter grid */}
      <div className={styles.presetButtons}>
        <button
          type="button"
          onClick={() => handlePresetDateRange('lastWeek')}
          className={darkMode ? styles.presetButtonDark : styles.presetButtonLight}
        >
          Last Week
        </button>
        <button
          type="button"
          onClick={() => handlePresetDateRange('lastMonth')}
          className={darkMode ? styles.presetButtonDark : styles.presetButtonLight}
        >
          Last Month
        </button>
        <button
          type="button"
          onClick={() => handlePresetDateRange('last3Months')}
          className={darkMode ? styles.presetButtonDark : styles.presetButtonLight}
        >
          Last 3 Months
        </button>
        <button
          type="button"
          onClick={() => handlePresetDateRange('allTime')}
          className={darkMode ? styles.presetButtonDark : styles.presetButtonLight}
        >
          All Time
        </button>
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  selectedProjects: PropTypes.arrayOf(PropTypes.string),
  selectedMaterialTypes: PropTypes.arrayOf(PropTypes.string),
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onProjectChange: PropTypes.func,
  onMaterialTypeChange: PropTypes.func,
  onDateRangeChange: PropTypes.func,
  onResetFilters: PropTypes.func,
  darkMode: PropTypes.bool,
};

FilterPanel.defaultProps = {
  selectedProjects: [],
  selectedMaterialTypes: [],
  startDate: null,
  endDate: null,
  onProjectChange: () => {},
  onMaterialTypeChange: () => {},
  onDateRangeChange: () => {},
  onResetFilters: () => {},
  darkMode: false,
};

export default FilterPanel;
