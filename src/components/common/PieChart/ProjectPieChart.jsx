/* eslint-disable import/prefer-default-export */
import { useEffect, useMemo } from 'react';
import * as d3 from 'd3';
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
        Cell: ({ value }) => (
          <div className={styles['project-chart-legend']} style={{ backgroundColor: value }} />
        ),
      },
      {
        Header: 'Project Name',
        accessor: 'name',
        headerClassName: styles.projectNameColumn,
        cellClassName: styles.projectNameRow,
        Cell: ({ value }) => <span className={styles.projectNameText}>{value}</span>,
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

  useEffect(() => {
    if (!total) return undefined;

    d3.select(`#pie-chart-${pieChartId}`).remove();
    const container = d3.select(`#pie-chart-container-${pieChartId}`);
    const svg = container
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2}, ${CHART_SIZE / 2})`);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(`${total.toFixed(2)} Hrs`);

    const pie = d3.pie().value(project => project.value);
    const arcs = pie(data);
    const arcGenerator = d3
      .arc()
      .innerRadius(70)
      .outerRadius(CHART_RADIUS);

    svg
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', (_arc, index) => colors[index])
      .style('opacity', 1);

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [colors, darkMode, data, pieChartId, total]);

  if (!data.length || total === 0) return null;

  return (
    <div className={styles['pie-chart-wrapper']}>
      <div
        id={`pie-chart-container-${pieChartId}`}
        style={{ width: CHART_SIZE, height: CHART_SIZE }}
      />

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
