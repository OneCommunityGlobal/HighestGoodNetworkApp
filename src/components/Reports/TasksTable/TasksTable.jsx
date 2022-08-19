import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../../Teams/Team.css';
import { Dropdown, DropdownButton, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import TasksDetail from '../TasksDetail';
import { getTasksTableData } from './selectors';
import './TasksTable.css';

export const TasksTable = ({ WbsTasksID }) => {

  const {
    priority,
    status,
    classification,
    users,
    classificationList,
    priorityList,
    statusList,
    userList,
    get_tasks
  } = useSelector(state => getTasksTableData(state, { WbsTasksID }));

  const [isActive, setActive] = useState(null);
  const [isAssigned, setAssigned] = useState(null);
  const [filters, setFilters] = useState({});

  const resetAllFilters = () => {
    setActive();
    setAssigned();
    setFilters({
      priority: '',
      status: '',
      classification: '',
      users: '',
    })
  }

  const setOneFilter = (filterName, value) => {
    if (value === 'Filter Off') {
      setFilters({ ...filters, [filterName]: value, [`${filterName}List`]: [] })
    } else {
      setFilters({ ...filters, [filterName]: value, [`${filterName}List`]: filters[`${filterName}List`].concat(value) })
    }
  }

  const FilterOptions = ({ filterName }) => {
    var filtersOptions = [
      ...Array.from(new Set(get_tasks.map((item) => item[filterName]))).sort(),
    ];
    filtersOptions.unshift('Filter Off');
    return (
      <DropdownButton style={{ margin: '3px' }} exact id="dropdown-basic-button" title={filterName[0].toUpperCase() + filterName.slice(1)}>
        {filtersOptions.map((c) => (
          <Dropdown.Item onClick={() => setOneFilter(filterName, c)}>{c}</Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  const UserOptions = () => {
    let users = [];
    get_tasks.map((task) =>
      task.resources.map((resource) => users.push(resource.name)),
    );

    users = Array.from(new Set(users)).sort();
    users.unshift('Filter Off');
    return (
      <DropdownButton style={{ margin: '3px' }} exact id="dropdown-basic-button" title="Users">
        {users.map((c) => (
          <Dropdown.Item onClick={() => setOneFilter('users', c)}>{c}</Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  return (
    <div className="container">
      <table>
        <div className='tasks-table-filters'>
          <button
            style={{ margin: '3px' }}
            exact
            className="btn btn-secondary btn-bg mt-3"
            onClick={() => resetAllFilters()}
          >
            Filter Off
          </button>
          <UserOptions get_tasks={get_tasks} />
          <FilterOptions filterName={'classification'} />
          <FilterOptions filterName={'priority'} />
          <FilterOptions filterName={'status'} />
          <FilterOptions filterName={'assignment'} />
          <input
            name="radio"
            type="radio"
            style={{ margin: '5px' }}
            value="active"
            onChange={() => setActive(true)}
          />
          Active
          <input
            name="radio"
            type="radio"
            style={{ margin: '5px' }}
            value="inactive"
            onChange={() => setActive(false)}
          />
          InActive

          <button style={{ margin: '3px' }} exact className="btn btn-secondary btn-bg mt-3">
            Estimated Hours
          </button>
        </div>

        <TasksDetail
          tasks_filter={get_tasks}
          isAssigned={isAssigned}
          isActive={isActive}
          priority={priority}
          status={status}
          classification={classification}
          users={users}
          classificationList={classificationList}
          priorityList={priorityList}
          statusList={statusList}
          userList={userList}
        />
      </table>
    </div>
  );
}
