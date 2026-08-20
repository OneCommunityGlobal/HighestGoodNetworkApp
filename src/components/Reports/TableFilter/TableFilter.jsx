import PropTypes from 'prop-types';
import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { FiCalendar } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './TableFilter.module.css';
import { Checkbox } from '~/components/common/Checkbox';
import TextSuggestion from '../../UserManagement/TextSuggestion';
import DropDownSearchBox from '../../UserManagement/DropDownSearchBox';

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
  taskNameList = [],
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
  const taskName = taskNameList.map(item => item.taskName);
  const taskHour = taskNameList.map(item => item.estimatedHours);
  const taskResource = taskNameList.map(item => (item.resources || [])
    .flat()
    .map(resource => resource.name)
    .filter(Boolean)
    .join(','));
  const uniquetaskHour = [...new Set(taskHour)];
  const uniquetaskResource = [...new Set(taskResource)];

  return (
    <div className={styles.tableFilterWrapper}>
      <TextSuggestion
        id="name_search"
        list={taskName}
        searchCallback={onTaskNameSearch}
        className={`${styles.tableFilterInput} ${styles.tableFilterItem}`}
        value={name}
        placeholder="Task name"
      />
      <TextSuggestion
        list={uniquetaskHour}
        id="hour_search"
        searchCallback={searchEstimatedHours}
        value={estimatedHours}
        placeholder="Estimated Hours"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <TextSuggestion
        list={uniquetaskResource}
        searchCallback={searchResources}
        value={resources}
        placeholder="Resources"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <DropDownSearchBox
        items={taskStatus}
        searchCallback={searchStatus}
        value={status}
        placeholder="Any status"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <DropDownSearchBox
        items={taskPriority}
        searchCallback={searchPriority}
        value={priority}
        placeholder="Any priority"
        className={`${styles.tableFilterItem} ${styles.tableFilterInput}`}
      />
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={StartDate}
        minDate={new Date('01/01/2010')}
        maxDate={new Date()}
        onChange={date => UpdateStartDate(date)}
      />
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={EndDate}
        maxDate={new Date()}
        minDate={new Date('01/01/2010')}
        onChange={date => UpdateEndDate(date)}
      />
      <Checkbox
        value={taskActive}
        onChange={({ target: { checked } }) => {
          setTaskActive(checked);
          searchActive(checked ? 'Yes' : 'No');
        }}
        id="active"
        wrapperClassname={styles.tableFilterItem}
        label="Active"
        darkMode={darkMode}
      />
      <Checkbox
        value={taskAssign}
        onChange={({ target: { checked } }) => {
          setTaskAssign(checked);
          searchAssign(checked ? 'Yes' : 'No');
        }}
        id="assign"
        wrapperClassname={styles.tableFilterItem}
        label="Assign"
        darkMode={darkMode}
      />
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
  taskNameList: PropTypes.arrayOf(PropTypes.object),
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
  taskNameList: [],
  darkMode: false,
};

export default TableFilter;
