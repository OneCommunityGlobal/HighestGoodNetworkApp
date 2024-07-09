/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import '../../Teams/Team.css';
import 'react-datepicker/dist/react-datepicker.css';
// eslint-disable-next-line import/order
import { getTasksTableData } from './selectors';
import './TasksTable.css';
import Select from 'react-select';
import { Checkbox } from 'components/common/Checkbox';
import TextSearchBox from 'components/UserManagement/TextSearchBox';
import { boxStyle, boxStyleDark } from 'styles';
import { TasksDetail } from '../TasksDetail';

export function TasksTable({ darkMode, tasks }) {
  const [isActive, setActive] = useState(true);
  const [isAssigned, setAssigned] = useState(true);
  const [toggleEditTasks, setToggleEditTasks] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    classification: '',
    users: '',
  });

  const userRef = useRef(null);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  const resetAllFilters = () => {
    setActive(true);
    setAssigned(true);
    setFilters({
      priority: '',
      status: '',
      classification: '',
      users: '',
    });
  };

  const setOneFilter = (filterName, value) => {
    setFilters(prevState => ({ ...prevState, [filterName]: value }));
  };

  const getOptions = (filterName) => {
    const options = [...Array.from(new Set(tasks.map(item => item[filterName]))).sort()];
    return options.map(option => ({ value: option, label: option }));
  };

  const getUserOptions = () => {
    let users = [];
    tasks.forEach(task => task.resources?.forEach(resource => users.push(resource.name)));
    users = Array.from(new Set(users)).sort();
    return users.map(user => ({ value: user, label: user }));
  };

  const handleSelectChange = (selectedOption, filterName) => {
    setOneFilter(filterName, selectedOption ? selectedOption.value : '');
  };

  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div>
        <h4 className="tasks-table-header">Tasks</h4>
      </div>
      <div className="tasks-table-filters-wrapper">
        <div className="tasks-table-filters">
          <Select
            ref={userRef}
            options={getUserOptions()}
            placeholder="Any user"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'users')}
            className="tasks-table-filter-item tasks-table-filter-input"
            value={filters.users ? { value: filters.users, label: filters.users } : null}
          />
          <Select
            options={getOptions('classification')}
            placeholder="Any classification"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'classification')}
            className="tasks-table-filter-item tasks-table-filter-input"
            value={filters.classification ? { value: filters.classification, label: filters.classification } : null}
          />
          <Select
            options={getOptions('priority')}
            placeholder="Any priority"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'priority')}
            className="tasks-table-filter-item tasks-table-filter-input"
            value={filters.priority ? { value: filters.priority, label: filters.priority } : null}
          />
          <Select
            options={getOptions('status')}
            placeholder="Any status"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'status')}
            className="tasks-table-filter-item tasks-table-filter-input"
            value={filters.status ? { value: filters.status, label: filters.status } : null}
          />
          <TextSearchBox
            placeholder="Estimated hours"
            className="tasks-table-text-search-box"
            searchCallback={() => { }}
          />
          <Checkbox
            value={isActive}
            onChange={() => setActive(!isActive)}
            id="active_checkbox"
            wrapperClassname="tasks-table-filter-item"
            label="Active"
          />
          <Checkbox
            value={isAssigned}
            onChange={() => setAssigned(!isAssigned)}
            id="assign_checkbox"
            wrapperClassname="tasks-table-filter-item"
            label="Assign"
          />
        </div>

        <div className='d-flex'>
          <button
            className="tasks-table-edit-tasks-button"
            onClick={() => setToggleEditTasks(!toggleEditTasks)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Edit Tasks
          </button>

          <button
            className="tasks-table-clear-filter-button"
            onClick={() => resetAllFilters()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Clear filters
          </button>
        </div>
        
      </div>

      <TasksDetail
        tasks_filter={tasks}
        toggleEditTasks={toggleEditTasks}
        darkMode={darkMode}
        isAssigned={isAssigned}
        isActive={isActive}
        priority={filters.priority}
        status={filters.status}
        classification={filters.classification}
        users={filters.users}
      />
    </div>
  );
}
