/* eslint-disable import/prefer-default-export */
import { useMemo } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTable } from 'react-table';
import { CHART_RADIUS, CHART_SIZE } from './constants'; // use same numbers as the D3 chart
import styles from './UserProjectPieChart.module.css';

const BASE_COLORS = [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#651067',
  '#329262',
];

function toChartData(projectsData) {
  return (projectsData || [])
    .map(p => ({
      id: p.projectId,
      name: p.projectName || 'Unnamed',
      value: Number(p.totalTime || 0),
    }))
    .filter(d => d.value > 0);
}

export function ProjectColorCell({ value }) {
  return (
    <div
      data-testid="project-color-cell"
      className={styles['project-chart-legend']}
      style={{ backgroundColor: value }}
    />
  );
}

export function ProjectNameCell({ value }) {
  return <span className={styles.projectNameText}>{value}</span>;
}

export function ProjectPieTooltip({ active, payload, colors, darkMode, total }) {
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

const renderCenterLabel = (total, darkMode) => (
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="central"
    fill={darkMode ? '#ffffff' : '#000000'}
    fontSize={14}
  >
    {`${total.toFixed(2)} Hrs`}
  </text>
);

export default function UserProjectD3PieChart({
  projectsData,
  darkMode,
  pieChartId = 'projectsPieChart',
}) {
  const data = useMemo(() => toChartData(projectsData), [projectsData]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const colors = useMemo(() => data.map((_, i) => BASE_COLORS[i % BASE_COLORS.length]), [
    data.length,
  ]);
  const tableData = useMemo(
    () => data.map((project, index) => ({ ...project, color: colors[index] })),
    [colors, data],
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Color',
        accessor: 'color',
        headerClassName: styles.colorColumn,
        cellClassName: styles.colorRow,
        Cell: ProjectColorCell,
      },
      {
        Header: 'Project Name',
        accessor: 'name',
        headerClassName: styles.projectNameColumn,
        cellClassName: styles.projectNameRow,
        Cell: ProjectNameCell,
      },
      {
        Header: 'Hours',
        accessor: 'value',
        headerClassName: styles.hoursColumn,
        cellClassName: styles.hoursRow,
        Cell: ({ value }) => value.toFixed(2),
      },
    ],
    [],
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: tableData,
  });

  if (!data.length || total === 0) return null;

  return (
    <div className={styles['pie-chart-wrapper']}>
      <div
        id={`pie-chart-container-${pieChartId}`}
        style={{ width: CHART_SIZE, height: CHART_SIZE }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={CHART_RADIUS}
              paddingAngle={1}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.id ?? index} fill={colors[index]} />
              ))}
              <Label position="center" content={() => renderCenterLabel(total, darkMode)} />
            </Pie>
            <Tooltip
              content={<ProjectPieTooltip colors={colors} darkMode={darkMode} total={total} />}
              wrapperStyle={{ zIndex: 9999 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles['pie-chart-table-container']}>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th key={headerKey} {...headerProps} className={column.headerClassName}>
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
                      <td key={cellKey} {...cellProps} className={cell.column.cellClassName}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          className={`${styles['data-total-value']} ${darkMode ? styles['text-light'] : ''}`}
          style={{ marginTop: 8, color: darkMode ? '#f5f5f5' : 'inherit' }}
        >
          <strong>Total Hours:</strong> {total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export { UserProjectD3PieChart };
