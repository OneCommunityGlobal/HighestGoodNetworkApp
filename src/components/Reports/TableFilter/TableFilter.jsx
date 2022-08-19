import React, { useState } from 'react';
import TextSearchBox from '../../UserManagement/TextSearchBox';
import DropDownSearchBox from '../../UserManagement/DropDownSearchBox';
import DatePicker from "react-datepicker";
import { FiCalendar } from 'react-icons/fi';
import "react-datepicker/dist/react-datepicker.css";
import "./TableFilter.css";

const InputWithCalendarIcon = ({ value, onClick }) => {

  return (
    <>
      <input type="text" className="table-filter-datePicker table-filter-item table-filter-input" value={value} onClick={onClick} />
      <FiCalendar className="date-picker-icon" onClick={onClick} />
    </>
  );
}

const TableFilter = (props) => {
  const taskPriority = ['Primary', 'Secondary', 'Tertiary'];
  const taskStatus = ['Paused', 'Complete', 'Active'];
  const [taskActive, setTaskActive] = useState(true);
  const [taskAssign, setTaskAssign] = useState(true);
  const [startDate, setStartDate] = useState(new Date("01/01/2010"));
  const [endDate, setEndDate] = useState(new Date());
  const onTaskNameSearch = (text) => {
    props.onTaskNameSearch(text);
  }

  const searchPriority = (text) => {
    props.searchPriority(text);
  }

  const searchStatus = (text) => {
    props.searchStatus(text);
  }

  const searchTaskResources = (text) => {
    props.searchResources(text);
  }

  const searchActive = ({ target: { checked } }) => {
    setTaskActive(checked);
    props.searchActive(checked ? 'Yes' : 'No');
  }

  const searchAssign = ({ target: { checked } }) => {
    setTaskAssign(checked);
    props.searchAssign(checked ? 'Yes' : 'No');
  }

  const searchEstimatedHours = (text) => {
    props.searchEstimatedHours(text);
  }
  const searchStartDate = (text) => {
    props.searchStartDate(text);
  }
  const searchEndDate = (text) => {
    props.searchEndDate(text);
  }

  return (
    <div className='table-filter-wrapper'>
      <TextSearchBox id={"name_search"}
        searchCallback={onTaskNameSearch}
        value={props.name}
        className='table-filter-item table-filter-input'
        placeholder='Task name'
      />

      <TextSearchBox
        searchCallback={searchEstimatedHours}
        value={props.estimatedHours}
        placeholder='Estimated Hours'
        className='table-filter-item table-filter-input'
      />

      <TextSearchBox
        searchCallback={searchTaskResources}
        value={props.resources}
        placeholder='Resources'
        className='table-filter-item table-filter-input'
      />

      <DropDownSearchBox
        items={taskStatus}
        searchCallback={searchStatus}
        value={props.status}
        placeholder='Any status'
        className='table-filter-item table-filter-input'
      />

      <DropDownSearchBox
        items={taskPriority}
        searchCallback={searchPriority}
        value={props.priority}
        placeholder='Any priority'
        className='table-filter-item table-filter-input'
      />

      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={startDate}
        minDate={new Date("01/01/2010")}
        maxDate={new Date()}
        onChange={(date) => setStartDate(date)}
      />
      <DatePicker
        customInput={<InputWithCalendarIcon />}
        selected={endDate}
        maxDate={new Date()}
        minDate={new Date("01/01/2010")}
        onChange={(date) => setEndDate(date)}
      />

      <div className='table-filter-item table-filter-checkbox-wrapper'>
        <input className='table-filter-checkbox' type='checkbox' id='active' name='active' checked={taskActive} onChange={searchActive} />
        <label className='table-filter-checkbox-label' for='active'>Active</label>
      </div>

      <div className='table-filter-item table-filter-checkbox-wrapper'>
        <input className='table-filter-checkbox' type='checkbox' id='assign' name='assign' checked={taskAssign} onChange={searchAssign} />
        <label className='table-filter-checkbox-label' for='assign'>Assign</label>
      </div>
    </div>
  );
};

export default TableFilter;
