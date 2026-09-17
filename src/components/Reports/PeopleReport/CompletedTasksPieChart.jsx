import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTable } from 'react-table';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FiChevronDown, FiChevronUp, FiFolder } from 'react-icons/fi';
import { CHART_RADIUS, CHART_SIZE } from '../../common/PieChart/constants';
import { generateArrayOfUniqColors } from '../../common/PieChart/colorsGenerator';
import { peopleTasksPieChartViewData } from './selectors';
import styles from './CompletedTasksPieChart.module.css';

// Hard cap on the rows rendered in the collapsed legend. Fixed rather than derived
// from the viewport so the card is the same height on every screen — these reports
// get screenshotted into work confirmation letters and the bottom edge has to line up.
export const MAX_VISIBLE_TASKS = 3;

export function ColorSwatchCell({ value, column }) {
  return (
    <div
      data-testid="color-swatch"
      className={styles['project-chart-legend']}
      style={{ backgroundColor: column.colorScale[value] }}
    />
  );
}

export function TotalHoursLabel({ total, darkMode }) {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      fill={darkMode ? '#ffffff' : '#000000'}
      fontSize={14}
      data-testid="total-hours-label"
    >
      {`${total.toFixed(2)} Hrs`}
    </text>
  );
}

export function PieTooltip({ active, payload, colors, darkMode, total }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = item.name;
  const value = Number(item.value);
  const swatch = item.payload?.fill || colors?.[item.payload?.index ?? 0];
  const hours = value.toFixed(2);
  const pct = total ? ((value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className={darkMode ? styles['tooltip-box-dark'] : styles['tooltip-box-light']}>
      <div className={styles['tooltip-row']}>
        {swatch && (
          <span
            aria-hidden="true"
            data-testid="tooltip-swatch"
            className={styles['tooltip-swatch']}
            style={{ backgroundColor: swatch }}
          />
        )}
        <span data-testid="tooltip-name" className={styles['tooltip-name']}>
          {name}
        </span>
      </div>
      <div
        data-testid="tooltip-detail"
        className={darkMode ? styles['tooltip-detail-dark'] : styles['tooltip-detail-light']}
      >
        {`${hours} hrs (${pct}%)`}
      </div>
    </div>
  );
}

function CompletedTasksPieChart({ darkMode }) {
  const { tasksWithLoggedHoursById } = useSelector(peopleTasksPieChartViewData);
  const tasks = tasksWithLoggedHoursById ?? [];

  const total = tasks.reduce((sum, t) => sum + t.totalTime, 0);
  const colors = useMemo(() => generateArrayOfUniqColors(tasks.length), [tasks.length]);

  const pieChartId = 'completedTasksPieChart';

  const [expanded, setExpanded] = useState(false);

  const hiddenCount = Math.max(0, tasks.length - MAX_VISIBLE_TASKS);
  const tasksView = expanded ? tasks : tasks.slice(0, MAX_VISIBLE_TASKS);

  const colorScale = useMemo(() => {
    const domain = tasks.map(t => t.projectId);
    const scale = {};
    domain.forEach((id, idx) => {
      scale[id] = colors[idx];
    });
    return scale;
  }, [colors, tasks]);

  const columns = useMemo(
    () => [
      {
        Header: 'Color',
        accessor: 'projectId',
        headerClassName: styles.colorColumn,
        cellClassName: styles.colorRow,
        colorScale,
        Cell: ColorSwatchCell,
      },
      {
        Header: 'Task Name',
        accessor: 'projectName',
        Cell: ({ value }) => `${value}`,
        headerClassName: styles.taskNameColumn,
        cellClassName: styles.taskNameRow,
      },
      {
        Header: 'Hours',
        accessor: 'totalTime',
        headerClassName: styles.hoursColumn,
        cellClassName: styles.hoursRow,
        Cell: ({ value }) => value.toFixed(2),
      },
    ],
    [colorScale],
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: tasksView });

  if (tasks.length === 0) {
    return (
      <div className={styles.completedTasksPieChartEmpty}>
        <div className={`${styles['report-block']} ${styles['pie-empty-state']}`}>
          <div className={styles['pie-empty-state-inner']}>
            <div className={styles['pie-empty-state-icon']} aria-hidden="true">
              <FiFolder size={20} />
            </div>
            <h5 className={styles['pie-empty-state-title']}>No completed task hours yet</h5>
            <p className={styles['pie-empty-state-body']}>
              Once this person completes a task with logged hours, a breakdown of where their time is going will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.completedTasksPieChart}>
      <div className={styles['report-block']}>
        <h5 className={styles['people-pie-charts-header']}>Tasks With Completed Hours</h5>
        <div className={styles['pie-chart-wrapper']}>
          <div
            id={`pie-chart-container-${pieChartId}`}
            className={styles['pie-chart']}
            style={{ width: CHART_SIZE, height: CHART_SIZE }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={tasks}
                  dataKey="totalTime"
                  nameKey="projectName"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={CHART_RADIUS}
                  paddingAngle={1}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {tasks.map((task, index) => (
                    <Cell key={task.projectId ?? index} fill={colors[index]} />
                  ))}
                  <Label
                    position="center"
                    content={<TotalHoursLabel total={total} darkMode={darkMode} />}
                  />
                </Pie>
                <Tooltip
                  content={
                    <PieTooltip colors={colors} darkMode={darkMode} total={total} />
                  }
                  wrapperStyle={{ zIndex: 9999 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles['pie-chart-legend-container']}>
            <div className={styles['legend-scroll-area']}>
              <table {...getTableProps()} className={styles.completedTasksTable}>
                <thead>
                  {headerGroups.map(headerGroup => {
                    const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={key} {...headerGroupProps}>
                        {headerGroup.headers.map(column => {
                          const { key: headerKey, ...headerProps } = column.getHeaderProps();
                          return (
                            <th
                              key={headerKey}
                              {...headerProps}
                              className={column.headerClassName}
                            >
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
                      <tr key={key} {...rowProps}>
                        {row.cells.map(cell => {
                          const { key: cellKey, ...cellProps } = cell.getCellProps();
                          return (
                            <td
                              key={cellKey}
                              {...cellProps}
                              className={cell.column.cellClassName}
                            >
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
            {hiddenCount > 0 && (
              <div className={styles['more-rows-footer']}>
                <button
                  type="button"
                  data-testid="toggle-more-tasks"
                  className={styles['show-more-btn']}
                  aria-expanded={expanded}
                  onClick={() => setExpanded(prev => !prev)}
                >
                  {expanded
                    ? 'Show less'
                    : `+ ${hiddenCount} more task${hiddenCount === 1 ? '' : 's'}`}
                  {expanded ? (
                    <FiChevronUp className={styles['show-more-icon']} aria-hidden="true" />
                  ) : (
                    <FiChevronDown className={styles['show-more-icon']} aria-hidden="true" />
                  )}
                </button>
              </div>
            )}
            <div className={`${styles['data-total-hours']}`}>
              <strong>Total Hours:</strong>
              {total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletedTasksPieChart;
