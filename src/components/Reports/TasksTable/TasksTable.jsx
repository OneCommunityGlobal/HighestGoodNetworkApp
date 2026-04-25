/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { useState, useEffect, useRef } from 'react';
import '../../Teams/Team.module.css';
import 'react-datepicker/dist/react-datepicker.css';
// import './TasksTable.css';
import Select from 'react-select';
import { Checkbox } from '~/components/common/Checkbox';
import TextSearchBox from '~/components/UserManagement/TextSearchBox';
import { boxStyle, boxStyleDark } from '~/styles';
import { TasksDetail } from '../TasksDetail';

export function TasksTable({ darkMode, tasks, projectId }) {
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
    const options = Array.from(
      new Set(tasks.map(item => item[filterName]).filter(Boolean)),
    ).sort((a, b) => String(a).localeCompare(String(b)));
  
    return options.map(option => ({ value: option, label: option }));
  };

  const getUserOptions = () => {
    const users = Array.from(
      new Set(
        tasks.flatMap(task => task.resources?.map(r => r.name) ?? []).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  
    return users.map(user => ({ value: user, label: user }));
  };

  const handleSelectChange = (selectedOption, filterName) => {
    setOneFilter(filterName, selectedOption ? selectedOption.value : '');
  };

  const darkSelectStyles = darkMode ? {
    control: (base) => ({
      ...base,
      backgroundColor: '#1c2541',
      borderColor: '#3a506b',
      color: '#ffffff',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1c2541',
      borderColor: '#3a506b',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#3a506b' : '#1c2541',
      color: '#ffffff',
    }),
    singleValue: (base) => ({ ...base, color: '#ffffff' }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    input: (base) => ({ ...base, color: '#ffffff' }),
  } : {};
  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div>
        <h4 className="tasks-table-header" style={{ color: darkMode ? '#ffffff' : '' }}>Tasks</h4>
      </div>
      <div className="tasks-table-filters-wrapper">
        {/* added by shreya P — removed 'text-dark' which made filter text invisible;
            react-select gets darkSelectStyles for full dark mode support */}
        <div className="tasks-table-filters">
          <Select
            ref={userRef}
            options={getUserOptions()}
            placeholder="Any user"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'users')}
            className="tasks-table-filter-item tasks-table-filter-input"
            styles={darkSelectStyles}
            value={filters.users ? { value: filters.users, label: filters.users } : null}
          />
          <Select
            options={getOptions('classification')}
            placeholder="Any classification"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'classification')}
            className="tasks-table-filter-item tasks-table-filter-input"
            styles={darkSelectStyles}
            value={filters.classification ? { value: filters.classification, label: filters.classification } : null}
          />
          <Select
            options={getOptions('priority')}
            placeholder="Any priority"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'priority')}
            className="tasks-table-filter-item tasks-table-filter-input"
            styles={darkSelectStyles}
            value={filters.priority ? { value: filters.priority, label: filters.priority } : null}
          />
          <Select
            options={getOptions('status')}
            placeholder="Any status"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'status')}
            className="tasks-table-filter-item tasks-table-filter-input"
            styles={darkSelectStyles}
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
            style={darkMode ? { ...boxStyleDark, color: '#ffffff' } : boxStyle}
          >
            Edit Tasks
          </button>

          <button
            className="tasks-table-clear-filter-button"
            onClick={() => resetAllFilters()}
            style={darkMode ? { ...boxStyleDark, color: '#ffffff' } : boxStyle}
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
        projectId={projectId}
      />
    </div>
  );
}
