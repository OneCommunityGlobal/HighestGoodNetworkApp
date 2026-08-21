import PropTypes from 'prop-types';
import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { FiCalendar } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './TableFilter.module.css';

const InputWithCalendarIcon = forwardRef(({ value, onClick }, ref) => {
  return (
    <>
      <input
        type="text"
        className={`${styles.tableFilterDatePicker} ${styles.tableFilterItem} ${styles.tableFilterInput}`}
        value={value}
        onClick={onClick}
        ref={ref}
        readOnly
      />
      <FiCalendar className={styles.datePickerIcon} onClick={onClick} />
    </>
  );
});

function TableFilter({
  onTaskNameSearch,
  searchPriority,
  searchStatus,
  searchResources,
  searchActive,
  searchAssign,
  searchEstimatedHours,
  name,
  estimatedHours,
  resources,
  status,
  priority,
  StartDate,
  EndDate,
  UpdateStartDate,
  UpdateEndDate,
  darkMode,
}) {
  const taskPriority = ['Primary', 'Secondary', 'Tertiary'];
  const taskStatus = ['Paused', 'Complete', 'Active'];
  const [taskActive, setTaskActive] = useState(true);
  const [taskAssign, setTaskAssign] = useState(true);
  // const [startDate, setStartDate] = useState(new Date('01/01/2010'));
  // const [endDate, setEndDate] = useState(new Date());

  const selectStyles = darkMode
    ? {
        control: base => ({
          ...base,
          backgroundColor: '#1f1f1f',
          borderColor: '#3f3f3f',
          color: '#f1f1f1',
        }),
        menu: base => ({
          ...base,
          backgroundColor: '#1f1f1f',
          border: '1px solid #3f3f3f',
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? '#ca50db'
            : isFocused
            ? '#2c2c2c'
            : '#1f1f1f',
          color: isSelected ? '#fff' : '#f1f1f1',
        }),
        singleValue: base => ({ ...base, color: '#f1f1f1' }),
        input: base => ({ ...base, color: '#f1f1f1' }),
        placeholder: base => ({ ...base, color: '#8c8c8c' }),
        dropdownIndicator: base => ({ ...base, color: '#8c8c8c' }),
        indicatorSeparator: base => ({ ...base, backgroundColor: '#3f3f3f' }),
      }
    : undefined;
  return (
    <div
     className={`${styles.tableFilterWrapper} ${darkMode ? 'text-light' : ''}`}
    >
      <input
        id="name_search"
        type="text"
        value={name}
        onChange={event => onTaskNameSearch(event.target.value)}
        placeholder="Task name"
        className={`${styles.tableFilterInput} ${styles.tableFilterItem}`}
      />
      <input
        id="hour_search"
        type="text"
        value={estimatedHours}
        onChange={event => searchEstimatedHours(event.target.value)}
        placeholder="Estimated Hours"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <input
        id="resources_search"
        type="text"
        value={resources}
        onChange={event => searchResources(event.target.value)}
        placeholder="Resources"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <Select
        options={taskStatus.map(item => ({ value: item, label: item }))}
        value={status ? { value: status, label: status } : null}
        onChange={selectedOption => searchStatus(selectedOption ? selectedOption.value : '')}
        placeholder="Any status"
        styles={selectStyles}
      />
      <Select
        options={taskPriority.map(item => ({ value: item, label: item }))}
        value={priority ? { value: priority, label: priority } : null}
        onChange={selectedOption => searchPriority(selectedOption ? selectedOption.value : '')}
        placeholder="Any priority"
        styles={selectStyles}
      />
      <div>
        <DatePicker
          customInput={<InputWithCalendarIcon />}
          selected={StartDate}
          minDate={new Date('01/01/2010')}
          maxDate={new Date()}
          onChange={date => UpdateStartDate(date)}
        />
      </div>
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={EndDate}
        maxDate={new Date()}
        minDate={new Date('01/01/2010')}
        onChange={date => UpdateEndDate(date)}
      />
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="active"
          checked={taskActive}
          onChange={({ target: { checked } }) => {
            setTaskActive(checked);
            searchActive(checked ? 'Yes' : 'No');
          }}
          className={styles.tableFilterItem}
        />
        <label htmlFor="active">Active</label>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="assign"
          checked={taskAssign}
          onChange={({ target: { checked } }) => {
            setTaskAssign(checked);
            searchAssign(checked ? 'Yes' : 'No');
          }}
          className={styles.tableFilterItem}
        />
        <label htmlFor="assign">Assign</label>
      </div>
    </div>
  );
}
InputWithCalendarIcon.displayName = 'InputWithCalendarIcon';

TableFilter.propTypes = {
  onTaskNameSearch: PropTypes.func,
  searchPriority: PropTypes.func,
  searchStatus: PropTypes.func,
  searchResources: PropTypes.func,
  searchActive: PropTypes.func,
  searchAssign: PropTypes.func,
  searchEstimatedHours: PropTypes.func,
  name: PropTypes.string,
  estimatedHours: PropTypes.string,
  resources: PropTypes.string,
  status: PropTypes.string,
  priority: PropTypes.string,
  StartDate: PropTypes.instanceOf(Date),
  EndDate: PropTypes.instanceOf(Date),
  UpdateStartDate: PropTypes.func,
  UpdateEndDate: PropTypes.func,
  darkMode: PropTypes.bool,
};

TableFilter.defaultProps = {
  darkMode: false,
};

export default TableFilter;
