/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import '../../Teams/Team.css';
import 'react-datepicker/dist/react-datepicker.css';
// eslint-disable-next-line import/order
import { getTasksTableData } from './selectors';
import './TasksTable.css';
import DropDownSearchBox from 'components/UserManagement/DropDownSearchBox';
import { Checkbox } from 'components/common/Checkbox';
import TextSearchBox from 'components/UserManagement/TextSearchBox';
import { boxStyle, boxStyleDark } from 'styles';
import { TasksDetail } from '../TasksDetail';

export function TasksTable({ WbsTasksID, darkMode }) {
  const { get_tasks } = useSelector(state => getTasksTableData(state, { WbsTasksID }));

  const [isActive, setActive] = useState(true);
  const [isAssigned, setAssigned] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    classification: '',
    users: '',
  });

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

  function FilterOptions({ filterName, width }) {
    const filtersOptions = [...Array.from(new Set(get_tasks.map(item => item[filterName]))).sort()];
    return (
      <DropDownSearchBox
        items={filtersOptions}
        searchCallback={value => setOneFilter(filterName, value)}
        placeholder={`Any ${filterName}`}
        className="tasks-table-filter-item tasks-table-filter-input"
        width={width}
        value={filters[filterName]}
      />
    );
  }

  function UserOptions({ tasks }) {
    let users = [];
    tasks.forEach(task => task.resources?.forEach(resource => users.push(resource.name)));

    users = Array.from(new Set(users)).sort();
    return (
      <DropDownSearchBox
        items={users}
        placeholder="Any user"
        searchCallback={value => setOneFilter('users', value)}
        className="tasks-table-filter-item tasks-table-filter-input"
        value={filters.users}
      />
    );
  }

  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div>
        <h4 className="tasks-table-header">Tasks</h4>
      </div>
      <div className="tasks-table-filters-wrapper">
        <div className="tasks-table-filters">
          <UserOptions tasks={get_tasks} />
          <FilterOptions filterName="classification" width="180px" />
          <FilterOptions filterName="priority" />
          <FilterOptions filterName="status" />

          <TextSearchBox
            placeholder="Estimated hours"
            className="tasks-table-filter-item tasks-table-filter-input"
            searchCallback={() => {}}
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

        <button
          className="tasks-table-clear-filter-button"
          onClick={() => resetAllFilters()}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Clear filters
        </button>
      </div>

      <TasksDetail
        tasks_filter={get_tasks}
        isAssigned={isAssigned}
        isActive={isActive}
        priority={filters.priority}
        status={filters.status}
        classification={filters.classification}
        users={filters.users}
        darkMode={darkMode}
      />
    </div>
  );
}
