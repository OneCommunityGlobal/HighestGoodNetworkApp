/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { useState, useEffect, useRef } from 'react';
import  '../../Teams/Team.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { Checkbox } from '~/components/common/Checkbox';
import TextSearchBox from '~/components/UserManagement/TextSearchBox';
import { boxStyle, boxStyleDark } from '~/styles';
import { TasksDetail } from '../TasksDetail';
import styles from './TasksTable.module.css';

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

  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div>
        <h4 className={styles['tasks-table-header']}>Tasks</h4>
      </div>
      <div className={styles['tasks-table-filters-wrapper']}>
        <div className={`${styles['tasks-table-filters']} ${darkMode ? 'text-dark' : ''}`}>
          <Select
            ref={userRef}
            options={getUserOptions()}
            placeholder="Any user"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'users')}
            className={`${styles['tasks-table-filter-item']} ${styles['tasks-table-filter-input']}`}
            classNamePrefix="tasks-table-select"
            value={filters.users ? { value: filters.users, label: filters.users } : null}
          />
          <Select
            options={getOptions('classification')}
            placeholder="Any classification"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'classification')}
            className={`${styles['tasks-table-filter-item']} ${styles['tasks-table-filter-input']}`}
            classNamePrefix="tasks-table-select"
            value={filters.classification ? { value: filters.classification, label: filters.classification } : null}
          />
          <Select
            options={getOptions('priority')}
            placeholder="Any priority"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'priority')}
            className={`${styles['tasks-table-filter-item']} ${styles['tasks-table-filter-input']}`}
            classNamePrefix="tasks-table-select"
            value={filters.priority ? { value: filters.priority, label: filters.priority } : null}
          />
          <Select
            options={getOptions('status')}
            placeholder="Any status"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'status')}
            className={`${styles['tasks-table-filter-item']} ${styles['tasks-table-filter-input']}`}
            classNamePrefix="tasks-table-select"
            value={filters.status ? { value: filters.status, label: filters.status } : null}
          />
          <TextSearchBox
            placeholder="Estimated hours"
            className={styles['tasks-table-text-search-box']}
            searchCallback={() => { }}
          />
          <Checkbox
            value={isActive}
            onChange={() => setActive(!isActive)}
            id="active_checkbox"
            wrapperClassname={styles['tasks-table-filter-item']}
            label="Active"
            darkMode={darkMode}
          />
          <Checkbox
            value={isAssigned}
            onChange={() => setAssigned(!isAssigned)}
            id="assign_checkbox"
            wrapperClassname={styles['tasks-table-filter-item']}
            label="Assign"
            darkMode={darkMode}
          />
        </div>

        <div className={styles['tasks-table-actions']}>
          <button
            className={styles['tasks-table-edit-tasks-button']}
            onClick={() => setToggleEditTasks(!toggleEditTasks)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Edit Tasks
          </button>

          <button
            className={styles['tasks-table-clear-filter-button']}
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
        projectId={projectId}
      />
    </div>
  );
}
