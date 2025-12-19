import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import { fetchMaterialTypes } from '../../../actions/bmdashboard/invTypeActions';
import styles from './FilterPanel.module.css';

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

    // Filter out "all" option and extract IDs
    const projectIds = selected
      .filter(option => option.value !== 'all')
      .map(option => option.value);

    // If "all" is selected, clear the filter
    if (selected.some(option => option.value === 'all')) {
      onProjectChange([]);
    } else {
      onProjectChange(projectIds);
    }
  };

  const handleMaterialTypeChange = selected => {
    if (!selected || selected.length === 0) {
      onMaterialTypeChange([]);
      return;
    }

    const materialTypeIds = selected
      .filter(option => option.value !== 'all')
      .map(option => option.value);

    if (selected.some(option => option.value === 'all')) {
      onMaterialTypeChange([]);
    } else {
      onMaterialTypeChange(materialTypeIds);
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
        newStartDate = null;
        newEndDate = null;
        break;
      default:
        return;
    }

    onDateRangeChange(newStartDate, newEndDate);
  };

  const selectedProjectOptions = projectOptions.filter(option =>
    selectedProjects.includes(option.value),
  );

  const selectedMaterialTypeOptions = materialTypeOptions.filter(option =>
    selectedMaterialTypes.includes(option.value),
  );

  return (
    <div className={`${styles.filterPanel} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.filterGrid}>
        {/* Project Filter */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Projects</div>
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjects.length === 0 ? [] : selectedProjectOptions}
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
            value={selectedMaterialTypes.length === 0 ? [] : selectedMaterialTypeOptions}
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

          {/* Preset Date Range Buttons */}
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
    </div>
  );
}

export default FilterPanel;
