// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FiCalendar } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import './TableFilter.css';
import { Checkbox } from 'components/common/Checkbox';
import TextSearchBox from '../../UserManagement/TextSearchBox';
import DropDownSearchBox from '../../UserManagement/DropDownSearchBox';

function InputWithCalendarIcon({ value, onClick }) {
  return (
    <>
      <input
        type="text"
        className="table-filter-datePicker table-filter-item table-filter-input"
        value={value}
        onClick={onClick}
      />
      <FiCalendar className="date-picker-icon" onClick={onClick} />
    </>
  );
}

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
}) {
  const taskPriority = ['Primary', 'Secondary', 'Tertiary'];
  const taskStatus = ['Paused', 'Complete', 'Active'];
  const [taskActive, setTaskActive] = useState(true);
  const [taskAssign, setTaskAssign] = useState(true);
  const [startDate, setStartDate] = useState(new Date('01/01/2010'));
  const [endDate, setEndDate] = useState(new Date());

  return (
    <div className="table-filter-wrapper">
      <TextSearchBox
        id="name_search"
        searchCallback={onTaskNameSearch}
        value={name}
        className="table-filter-item table-filter-input"
        placeholder="Task name"
      />
      <TextSearchBox
        searchCallback={searchEstimatedHours}
        value={estimatedHours}
        placeholder="Estimated Hours"
        className="table-filter-item table-filter-input"
      />
      <TextSearchBox
        searchCallback={searchResources}
        value={resources}
        placeholder="Resources"
        className="table-filter-item table-filter-input"
      />
      <DropDownSearchBox
        items={taskStatus}
        searchCallback={searchStatus}
        value={status}
        placeholder="Any status"
        className="table-filter-item table-filter-input"
      />
      <DropDownSearchBox
        items={taskPriority}
        searchCallback={searchPriority}
        value={priority}
        placeholder="Any priority"
        className="table-filter-item table-filter-input"
      />
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={startDate}
        minDate={new Date('01/01/2010')}
        maxDate={new Date()}
        onChange={date => setStartDate(date)}
      />
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={endDate}
        maxDate={new Date()}
        minDate={new Date('01/01/2010')}
        onChange={date => setEndDate(date)}
      />
      <Checkbox
        value={taskActive}
        onChange={({ target: { checked } }) => {
          setTaskActive(checked);
          searchActive(checked ? 'Yes' : 'No');
        }}
        id="active"
        wrapperClassname="table-filter-item"
        label="Active"
      />
      <Checkbox
        value={taskAssign}
        onChange={({ target: { checked } }) => {
          setTaskAssign(checked);
          searchAssign(checked ? 'Yes' : 'No');
        }}
        id="assign"
        wrapperClassname="table-filter-item"
        label="Assign"
      />
    </div>
  );
}

export default TableFilter;
