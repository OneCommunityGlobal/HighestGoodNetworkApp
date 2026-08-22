/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { useState, useEffect, useRef } from 'react';
import  '../../Teams/Team.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './TasksTable.module.css';
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

  // Sizing applies in both modes - it replaces the old `.select__control` CSS,
  // which never matched (no classNamePrefix on <Select>, and CSS Modules hashed it).
  // The control sizes to its label rather than to a fixed width: `Any
  // classification` / `Any priority` are wider than the shortest options, and a
  // fixed width wrapped them onto a second line that spilled out of the box.
  // minWidth keeps the short ones from collapsing so the row still reads evenly.
  const selectStyles = {
    control: (base) => ({
      ...base,
      width: 'auto',
      minWidth: 140,
      minHeight: 30,
      boxShadow: 'none',
      ...(darkMode
        ? { backgroundColor: '#1c2541', borderColor: '#3a506b', color: '#ffffff' }
        : { borderColor: '#d1cfd4' }),
    }),
    // nowrap is what actually stops the overflow; the control then grows to fit.
    valueContainer: (base) => ({ ...base, flexWrap: 'nowrap' }),
    placeholder: (base) => ({
      ...base,
      whiteSpace: 'nowrap',
      ...(darkMode ? { color: '#94a3b8' } : {}),
    }),
    singleValue: (base) => ({
      ...base,
      whiteSpace: 'nowrap',
      ...(darkMode ? { color: '#ffffff' } : {}),
    }),
    ...(darkMode ? {
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
    input: (base) => ({ ...base, color: '#ffffff' }),
    } : {}),
  };
  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div>
        <h4 className={styles['tasks-table-header']} style={{ color: darkMode ? '#ffffff' : '' }}>Tasks</h4>
      </div>
      <div className={styles['tasks-table-filters-wrapper']}>
        {/* added by shreya P — removed 'text-dark' which made filter text invisible;
            react-select gets darkSelectStyles for full dark mode support */}
        <div className={styles['tasks-table-filters']}>
          <Select
            ref={userRef}
            options={getUserOptions()}
            placeholder="Any user"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'users')}
            className={styles['tasks-table-filter-item']}
            styles={selectStyles}
            value={filters.users ? { value: filters.users, label: filters.users } : null}
          />
          <Select
            options={getOptions('classification')}
            placeholder="Any classification"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'classification')}
            className={styles['tasks-table-filter-item']}
            styles={selectStyles}
            value={filters.classification ? { value: filters.classification, label: filters.classification } : null}
          />
          <Select
            options={getOptions('priority')}
            placeholder="Any priority"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'priority')}
            className={styles['tasks-table-filter-item']}
            styles={selectStyles}
            value={filters.priority ? { value: filters.priority, label: filters.priority } : null}
          />
          <Select
            options={getOptions('status')}
            placeholder="Any status"
            onChange={(selectedOption) => handleSelectChange(selectedOption, 'status')}
            className={styles['tasks-table-filter-item']}
            styles={selectStyles}
            value={filters.status ? { value: filters.status, label: filters.status } : null}
          />
          <TextSearchBox
            placeholder="Estimated hours"
            className={`${styles['tasks-table-text-search-box']} ${
              darkMode ? styles['tasks-table-text-search-box-dark'] : ''
            }`}
            searchCallback={() => { }}
          />
          <Checkbox
            value={isActive}
            onChange={() => setActive(!isActive)}
            id="active_checkbox"
            wrapperClassname={styles['tasks-table-filter-item']}
            backgroundColorCN={darkMode ? styles.bgYinmnBlue : ''}
            textColorCN={darkMode ? styles.textLight : ''}
            label="Active"
          />
          <Checkbox
            value={isAssigned}
            onChange={() => setAssigned(!isAssigned)}
            id="assign_checkbox"
            wrapperClassname={styles['tasks-table-filter-item']}
            backgroundColorCN={darkMode ? styles.bgYinmnBlue : ''}
            textColorCN={darkMode ? styles.textLight : ''}
            label="Assign"
          />
        </div>

        <div className='d-flex'>
          <button
            className={`${styles['tasks-table-edit-tasks-button']} ${darkMode ? styles['tasks-table-button-dark'] : ''}`}
            onClick={() => setToggleEditTasks(!toggleEditTasks)}
            style={darkMode ? { ...boxStyleDark, color: '#ffffff' } : boxStyle}
          >
            Edit Tasks
          </button>

          <button
            className={`${styles['tasks-table-clear-filter-button']} ${darkMode ? styles['tasks-table-button-dark'] : ''}`}
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
