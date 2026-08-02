import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { FiFolder } from 'react-icons/fi';
import { CHART_RADIUS, CHART_SIZE } from '../../common/PieChart/constants';
import { generateArrayOfUniqColors } from '../../common/PieChart/colorsGenerator';
import { peopleTasksPieChartViewData } from './selectors';
import styles from './CompletedTasksPieChart.module.css';

// Reserve space for the "Show more" footer so it doesn't push the last visible row offscreen.
const FOOTER_RESERVED_ROWS = 1;

function CompletedTasksPieChart({ darkMode }) {
  const { tasksWithLoggedHoursById } = useSelector(peopleTasksPieChartViewData);
  const tasks = tasksWithLoggedHoursById ?? [];

  const total = tasks.reduce((sum, t) => sum + t.totalTime, 0);
  const colors = useMemo(
    () => generateArrayOfUniqColors(tasks.length),
    [tasks.length],
  );
  const colorScale = useMemo(() => {
    const domain = tasks.map(t => t.projectId);
    return d3.scaleOrdinal().domain(domain).range(colors);
  }, [colors, tasks]);

  const pieChartId = 'completedTasksPieChart';

  // How many rows we can fit in the available height. When `expanded` is true we
  // render every row regardless of this number. The renderer slices in half: the
  // measurement effect owns the cap, the JSX owns the slice.
  const tbodyRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(tasks.length);
  const [expanded, setExpanded] = useState(false);

  // Draw the donut (same look as common/PieChart's D3 render).
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

    const pie = d3.pie().value(d => d.totalTime);
    const arcs = pie(tasks);
    const arcGen = d3.arc().innerRadius(70).outerRadius(CHART_RADIUS);

    svg
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arcGen)
      .attr('fill', d => colorScale(d.data.projectId))
      .style('opacity', 1);

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [colorScale, darkMode, tasks, total]);

  // Measure how many rows fit in the clamped tbody height. Uses the height of the
  // first measured row — every row in the table has the same layout, so a single
  // sample is enough. `expanded` short-circuits the measurement so all rows render.
  useEffect(() => {
    if (expanded) return undefined;

    const tbody = tbodyRef.current;
    if (!tbody) return undefined;

    const recompute = () => {
      // Budget comes from CSS (max-height on .legend-scroll-area tbody), NOT from
      // the tbody's rendered height — that would feed back on itself because the
      // tbody's height is a function of how many rows we render into it.
      const styles = window.getComputedStyle(tbody);
      const maxHeightPx = parseFloat(styles.maxHeight);
      if (!Number.isFinite(maxHeightPx) || maxHeightPx <= 0) {
        setVisibleCount(tasks.length);
        return;
      }
      const firstCell = tbody.querySelector('td');
      const rowHeight = firstCell ? firstCell.getBoundingClientRect().height : 0;
      if (!rowHeight) {
        setVisibleCount(tasks.length);
        return;
      }
      const fits = Math.max(
        0,
        Math.floor(maxHeightPx / rowHeight) - FOOTER_RESERVED_ROWS,
      );
      setVisibleCount(Math.min(tasks.length, fits));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(tbody);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [tasks.length, expanded]);

  const hiddenCount = expanded ? 0 : Math.max(0, tasks.length - visibleCount);
  const renderedTasks = expanded ? tasks : tasks.slice(0, visibleCount);

  if (tasks.length === 0) {
    return (
      <div className={styles.completedTasksPieChartEmpty}>
        <div className={`${styles['report-block']} ${styles['pie-empty-state']}`}>
          <div className={styles['pie-empty-state-inner']} role="status">
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
      <div
        className={styles['report-block']}
      >
        <h5 className={styles['people-pie-charts-header']}>Tasks With Completed Hours</h5>
        <div className={styles['pie-chart-wrapper']}>
          {/* Donut chart rendered with D3, matching the existing PieChart look. */}
          <div id={`pie-chart-container-${pieChartId}`} className={styles['pie-chart']} />
          <div
            className={styles['pie-chart-legend-container']}
          >
            <div
              className={styles['legend-scroll-area']}
            >
              <table
                className={styles['pie-chart-legend-table']}
              >
                <thead>
                  <tr>
                    <th className={styles.colorColumn}>Color</th>
                    <th className={styles.taskNameColumn}>Task Name</th>
                    <th className={styles.hoursColumn}>Hours</th>
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {renderedTasks.map(project => (
                    <tr key={project.projectId}>
                      <td className={styles.colorRow}>
                        <div
                          className={styles['project-chart-legend']}
                          style={{ backgroundColor: `${colorScale(project.projectId)}` }}
                        />
                      </td>
                      <td className={styles.projectNameRow}>{project.projectName}</td>
                      <td className={styles.totalTimeRow}>{project.totalTime.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hiddenCount > 0 && (
              <div className={styles['more-rows-footer']}>
                <button
                  type="button"
                  className={styles['show-more-btn']}
                  onClick={() => setExpanded(true)}
                >
                  + {hiddenCount} more task{hiddenCount === 1 ? '' : 's'}
                </button>
              </div>
            )}
            {expanded && (
              <div className={styles['more-rows-footer']}>
                <button
                  type="button"
                  className={styles['show-more-btn']}
                  onClick={() => setExpanded(false)}
                >
                  Show less
                </button>
              </div>
            )}
            <div
              className={`${styles['data-total-hours']}`}
            >
              <strong>
                Total Hours:
              </strong>
              {total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletedTasksPieChart;
