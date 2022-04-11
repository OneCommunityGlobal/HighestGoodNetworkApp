import React from 'react';
import TextSearchBox from '../UserManagement/TextSearchBox';
import DropDownSearchBox from '../UserManagement/DropDownSearchBox';

const TableFilter = (props) => {
  const taskPriority = ['Primary','Secondary', 'Tertiary'];
  const taskStatus = ['Paused','Complete', 'Active'];
  const taskActive = ['Yes','No'];
  const taskAssign = ['Yes','No'];

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
    </tr>
  );
};

export default TableFilter;
