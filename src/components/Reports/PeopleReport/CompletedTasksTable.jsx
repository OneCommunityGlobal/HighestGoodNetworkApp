import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FiClipboard } from 'react-icons/fi';
import { usePagination, useTable } from 'react-table';

import { peopleTasksPieChartViewData } from '~/components/Reports/PeopleReport/selectors';

import styles from './CompletedTasksTable.module.css';

function CompletedTasksTable() {
  const { tasksWithLoggedHoursById } = useSelector(peopleTasksPieChartViewData);
  const darkMode = useSelector(state => state.theme.darkMode);

  const data = useMemo(() => {
    return tasksWithLoggedHoursById ?? [];
  }, [tasksWithLoggedHoursById]);

  const totals = useMemo(() => {
    const totalHours = data.reduce((sum, t) => sum + (Number(t.totalTime) || 0), 0).toFixed(2);
    return { taskCount: data.length, totalHours };
  }, [data]);

  const columns = useMemo(
    () => [
      {
        id: 'index',
        Header: '#',
        Cell: ({ row, state }) => (
          <div className={styles.indexCell}>
            {state.pageIndex * state.pageSize + row.index + 1}
          </div>
        ),
      },
      {
        Header: 'Task',
        accessor: 'projectName',
        Cell: ({ value }) => <div className={styles.nameCell}>{value}</div> || '—',
      },
      {
        Header: 'Total Time',
        accessor: 'totalTime',
        Cell: ({ value }) => (
          <div className={styles.totalTimeCell}>{value.toFixed(2)} hrs</div>
        ),
      },
    ],
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination,
  );

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
            <span>{totals.taskCount > 1 ? 'Tasks' : 'Task'}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className={styles.emptyState}
          role="status"
          aria-live="polite"
          data-testid="completed-tasks-empty-state"
        >
          <div className={styles.emptyIcon} aria-hidden="true">
            <FiClipboard size={32} />
          </div>
          <h4 className={styles.emptyTitle}>No completed tasks yet</h4>
          <p className={styles.emptyDescription}>
            Once people log hours against a task, it will show up here with a running total of the
            time they&apos;ve spent on it.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table {...getTableProps()} className={styles.table}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps()} key={column.id}>
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map(row => {
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

          <div className={styles.pagination} role="navigation" aria-label="Table pagination">
            <div className={styles.pageControl}>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                aria-label="First page"
              >
                «
              </button>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                aria-label="Previous page"
              >
                ‹
              </button>
              <span className={styles.pageIndicator}>
                Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
              </span>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => nextPage()}
                disabled={!canNextPage}
                aria-label="Next page"
              >
                ›
              </button>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                aria-label="Last page"
              >
                »
              </button>
            </div>
            
            <div className={styles.rowsControl}>
              <p className={styles.pageSizeLabel}>
                Rows per page:
              </p>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 25, 50].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CompletedTasksTable;