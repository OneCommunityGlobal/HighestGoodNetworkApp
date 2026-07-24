import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTable } from 'react-table';

import { peopleTasksPieChartViewData } from '~/components/Reports/PeopleReport/selectors';

import styles from './CompletedTasksTable.module.css';

function CompletedTasksTable() {
  const { tasksWithLoggedHoursById } = useSelector(peopleTasksPieChartViewData);
  const darkMode = useSelector(state => state.theme.darkMode);

  const data = useMemo(() => tasksWithLoggedHoursById ?? [], [tasksWithLoggedHoursById]);

  const totals = useMemo(() => {
    const totalHours = data.reduce((sum, t) => sum + (Number(t.totalTime) || 0), 0);
    return { taskCount: data.length, totalHours };
  }, [data]);

  const columns = useMemo(
    () => [
      {
        id: 'index',
        Header: '#',
        Cell: ({ row }) => <div className={styles.indexCell}>{row.index + 1}</div>,
      },
      {
        Header: 'Task',
        accessor: 'projectName',
        Cell: ({ value }) => <div className={styles.nameCell}>{value}</div>|| '—',
      },
      {
        Header: 'Total Time',
        accessor: 'totalTime',
        Cell: ({ value }) => value,
      },
    ],
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div className={styles.completedTasksTable}>
      <div className={styles.summary}>
        <div className={styles.header}>
          <h3 className={styles.title}>Tasks With Completed Hours</h3>
          <p className={styles.subtitle}>Comprehensive Task Activity Log</p>
        </div>
        <div className={styles.summaryStats}>
          <div className={styles.totalTime}>
            <span className={styles.totalTimeLabel}>Total Time</span>
            <span className={styles.totalTimeValue}>{totals.totalHours} hrs</span>
          </div>
          <div className={styles.totalTasks}>
            <span>{totals.taskCount}</span>
            <span>{totals.taskCount == 1 ? 'Task' : 'Tasks'}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className={styles['empty-message']}>No tasks with completed hours yet.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table
            {...getTableProps()}
            className={styles.table}
          >
            <thead>
              {headerGroups.map(headerGroup => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} key={column.id}>
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                const { key, ...rowProps } = row.getRowProps();
                return (
                  <tr {...rowProps} key={key}>
                    {row.cells.map(cell => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td {...cellProps} key={cellKey}>
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
      )}
    </div>
  );
}

export default CompletedTasksTable;