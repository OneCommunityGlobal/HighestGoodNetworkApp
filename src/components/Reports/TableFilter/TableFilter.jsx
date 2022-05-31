import React, { useState } from 'react';
import TextSearchBox from '../../UserManagement/TextSearchBox';
import DropDownSearchBox from '../../UserManagement/DropDownSearchBox';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TableFilter.css";



const TableFilter = (props) => {
  const taskPriority = ['Primary','Secondary', 'Tertiary'];
  const taskStatus = ['Paused','Complete', 'Active'];
  const taskActive = ['Yes','No'];
  const taskAssign = ['Yes','No'];
  const [startDate, setStartDate] = useState(new Date("01/01/2010"));
  const [endDate, setEndDate]=useState(new Date());
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

  const searchActive = (text) => {
    props.searchActive(text);
  }

  const searchAssign = (text) => {
    props.searchAssign(text);
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
    <tr>
      <td id="name">
        <TextSearchBox id={"name_search"}
                       searchCallback={onTaskNameSearch}
                       value={props.name}
        />
      </td>
      <td id="task_priority">
        <DropDownSearchBox
                           items={taskPriority}
                           searchCallback={searchPriority}
                           value={props.priority}
        />
      </td>
      <td id="task_status">
        <DropDownSearchBox
          items={taskStatus}
          searchCallback={searchStatus}
          value={props.status}
        />
      </td>
      <td id="task_resources">
        <TextSearchBox
                       searchCallback={searchTaskResources}
                       value={props.resources}
        />
      </td>
      <td id="task_active">
        <DropDownSearchBox
                           items={taskActive}
                           searchCallback={searchActive}
                           value={props.active}
        />
      </td>

      <td id="task_assign">
        <DropDownSearchBox
                          items={taskAssign}
                          searchCallback={searchAssign}
                          value={props.assign}
        />
      </td>
      <td id="task_estimatedHours">
        <TextSearchBox
                       searchCallback={searchEstimatedHours}
                       value={props.estimatedHours}
        />
      </td>
      <td id="task_startDate">
        <DatePicker className="table-filter-datePicker" selected={startDate} minDate={new Date("01/01/2010")} maxDate={new Date()} onChange={(date) => setStartDate(date)} />
      </td>
      <td id="task_EndDate">
        <DatePicker className="table-filter-datePicker" selected={endDate} maxDate={new Date()} minDate={new Date("01/01/2010")} onChange={(date) => setEndDate(date)} />
      </td>
    </tr>
  );
};

export default TableFilter;
