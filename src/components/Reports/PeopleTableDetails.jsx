import React, { useState, useMemo } from 'react';
import 'reactjs-popup/dist/index.css';
import { useTable } from 'react-table';
import styles from './PeopleTableDetails.module.css';
import TableFilter from './TableFilter/TableFilter';

const TaskResourceContext = React.createContext({});

function TaskResourceList({ task }) {
  const { expandedTasks, toggleMoreResources } = React.useContext(TaskResourceContext);
  const taskResources = (task.resources || []).flat();
  const isExpanded = !!expandedTasks[task._id];

  return (
    <>
      {taskResources.slice(0, 2).map((resource, index) => (
        <img
          key={`${task._id}-${resource.name}-${index}`}
          alt={resource.name}
          src={resource.profilePic || '/pfp-default.png'}
          className={styles['img-circle']}
          title={resource.name}
        />
      ))}
      {taskResources.length > 2 && (
        <button
          type="button"
          className={`${styles.name} ${styles.resourceMoreToggle}`}
          onClick={event => {
            event.stopPropagation();
            toggleMoreResources(task._id);
          }}
        >
          <span className={styles.dot}>{taskResources.length - 2}+</span>
        </button>
      )}
      <div
        id={task._id}
        className={styles.extra}
        data-testid={`extra-resources-${task._id}`}
        style={{ display: isExpanded ? 'table-cell' : 'none' }}
      >
        {taskResources.slice(2).map((resource, index) => (
          <img
            key={`${task._id}-${resource.name}-${index + 2}`}
            alt={resource.name}
            src={resource.profilePic || '/pfp-default.png'}
            className={styles['img-circle']}
            title={resource.name}
          />
        ))}
      </div>
    </>
  );
}

function PeopleTableDetails(props) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [resources, setResources] = useState('');
  const [active, setActive] = useState('');
  const [assign, setAssign] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [order, setOrder] = useState('');
  const [startDate, updateStartDate] = useState(new Date('01/01/2010'));
  const [endDate, updateEndDate] = useState(new Date());
  // State to track which task resource sections are expanded
  const [expandedTasks, setExpandedTasks] = useState({});

  const onTaskNameSearch = (text) => setName(text);
  const searchPriority = (text) => setPriority(text);
  const searchEstimatedHours = (text) => setEstimatedHours(text);
  const searchResources = (text) => setResources(text);
  const searchStatus = (text) => setStatus(text);
  const searchActive = (text) => setActive(text);
  const searchAssign = (text) => setAssign(text);

  const resetFilters = () => {
    setName('');
    setPriority('');
    setStatus('');
    setResources('');
    setOrder('');
    setActive('');
    setAssign('');
    setEstimatedHours('');
    updateStartDate(new Date('01/01/2010'));
    updateEndDate(new Date());
  };

  const filterOptions = (tasks) => {
    return tasks.filter((task) => {
      return (
        task.taskName.toLowerCase().includes(name.toLowerCase()) &&
        task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase())
      );
    });
  };

  const filterTasks = (tasks) => {
    let filteredList = tasks.filter((task) => {
      const taskStartDate = new Date(task.startDate);
      const hasStartDate = !Number.isNaN(taskStartDate.getTime());
      const isWithinDateRange = !hasStartDate || !startDate || taskStartDate <= endDate;

      return (
        task.taskName.toLowerCase().includes(name.toLowerCase()) &&
        task?.priority?.toLowerCase().includes(priority.toLowerCase()) &&
        task?.status?.toLowerCase().includes(status.toLowerCase()) &&
        task?.active?.toLowerCase().includes(active.toLowerCase()) &&
        task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase()) &&
        task?.assign?.toLowerCase().includes(assign.toLowerCase()) &&
        isWithinDateRange
      );
    });

    filteredList = filteredList.filter((task) => {
      if (!resources) return true;

      return (task.resources || [])
        .flat()
        .some(resource => resource.name?.toLowerCase().includes(resources.toLowerCase()));
    });
    return filteredList;
  };

  // REFACTORED: Toggle using state instead of direct DOM manipulation
  const toggleMoreResources = (id) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { taskData, darkMode } = props;
  const filteredTasks = filterTasks(taskData);
  const filteredOptions = filterOptions(taskData);

  const columns = useMemo(
    () => [
      { Header: 'Task', accessor: 'taskName', testId: 'task' },
      { Header: 'Priority', accessor: 'priority', testId: 'priority' },
      { Header: 'Status', accessor: 'status', testId: 'status' },
      {
        Header: 'Resources',
        accessor: 'resources',
        testId: 'resources',
        Cell: ({ row }) => <TaskResourceList task={row.original} />,
      },
      {
        Header: 'Active',
        headerClassName: styles.centerColumn,
        accessor: 'active',
        testId: 'active',
        Cell: ({ value }) => (
          <div style={{ textAlign: 'center' }}>
            {value === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}
          </div>
        ),
      },
      {
        Header: 'Assign',
        accessor: 'assign',
        headerClassName: styles.centerColumn,
        testId: 'assign',
        Cell: ({ value }) => (
          <div style={{ textAlign: 'center' }}>
            {value === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}
          </div>
        ),
      },
      {
        Header: 'Estimated Hours',
        accessor: 'estimatedHours',
        headerClassName: styles.centerColumn,
        testId: 'eh',
        Cell: ({ value }) => <div style={{ textAlign: 'center' }}>{value}</div>,
      },
      {
        Header: 'Start Date',
        accessor: 'startDate',
        headerClassName: styles.centerColumn,
        testId: 'sd',
        Cell: ({ value }) => <div style={{ textAlign: 'center' }}>{value}</div>,
      },
      {
        Header: 'End Date',
        accessor: 'endDate',
        headerClassName: styles.centerColumn,
        testId: 'ed',
        Cell: ({ value }) => <div style={{ textAlign: 'center' }}>{value}</div>,
      },
    ],
    [darkMode],
  );

  const tableInstance = useTable({ columns, data: filteredTasks });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <TaskResourceContext.Provider value={{ expandedTasks, toggleMoreResources }}>
      <div className={styles['table-filter-container']}>
        <TableFilter
          onTaskNameSearch={onTaskNameSearch}
          searchPriority={searchPriority}
          searchResources={searchResources}
          searchStatus={searchStatus}
          searchActive={searchActive}
          searchAssign={searchAssign}
          searchEstimatedHours={searchEstimatedHours}
          resetFilters={resetFilters}
          name={name}
          taskNameList={filteredOptions}
          order={order}
          priority={priority}
          status={status}
          resources={resources}
          active={active}
          assign={assign}
          estimatedHours={estimatedHours}
          StartDate={startDate}
          UpdateStartDate={updateStartDate}
          EndDate={endDate}
          UpdateEndDate={updateEndDate}
          darkMode={darkMode}
        />
        <button type="button" onClick={resetFilters} className={styles['tasks-table-clear-filter-button']}>
          Clear Filters
        </button>
      </div>
      <div className={styles['people-table-scrollable']}>
        <table {...getTableProps()} className={styles.peopleTableReact}>
          <thead className={darkMode ? styles['reports-table-head-dark'] : undefined}>
            {headerGroups.map(headerGroup => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th key={headerKey} {...headerProps} data-testid={column.testId} className={column.headerClassName}>
                        {column.render('Header')}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();
              return (
                <tr key={key} {...rowProps} className={darkMode ? styles['people-table-row-dark'] : undefined}>
                  {row.cells.map(cell => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    return (
                      <td key={cellKey} {...cellProps}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TaskResourceContext.Provider>
  );
}

export default PeopleTableDetails;
