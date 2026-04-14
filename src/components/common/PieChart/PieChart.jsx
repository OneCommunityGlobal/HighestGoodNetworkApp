/* eslint-disable testing-library/no-node-access */
import { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

import { CHART_RADIUS, CHART_SIZE } from './constants';
import { generateArrayOfUniqColors } from './colorsGenerator';
import styles from './PieChart.module.css';

export function PieChart({
  tasksData = [], // New array format: [{ projectId: "123", projectName: "Project A", totalTime: 10.5 }, ...]
  pieChartId,
  darkMode,
  projectsData = [],
}) {
  const [totalHours, setTotalHours] = useState(0);
  const colors = useMemo(() => generateArrayOfUniqColors(tasksData?.length), [tasksData]);
  const color = useMemo(() => {
    const domain = tasksData?.map(project => project.projectId) || [];
    return d3
      .scaleOrdinal()
      .domain(domain)
      .range(colors);
  }, [colors, tasksData]);

  const [togglePercentage, setTogglePercentage] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(
    tasksData?.map(project => project.projectId),
  );

  const handleTogglePercentage = () => {
    setTogglePercentage(prev => {
      const newToggleState = !prev;
      setTogglePercentage(newToggleState);
      if (!newToggleState) {
        setSelectedProjects(tasksData?.map(project => project.projectId));
      }
      return newToggleState;
    });
  };
  const calculateTotalHours = (projectsdata, tasksdata) => {
    const totalTaskTime = tasksdata?.reduce((sum, project) => sum + project.totalTime, 0);
    const projectsDataTime = projectsdata.reduce((sum, project) => sum + project.totalTime, 0);
    return totalTaskTime + projectsDataTime;
  };

  const handleProjectClick = projectId => {
    if (togglePercentage) {
      setSelectedProjects(prevSelected =>
        prevSelected.includes(projectId)
          ? prevSelected.filter(id => id !== projectId)
          : [...prevSelected, projectId],
      );
    }
  };

  const getCreateSvgPie = totalValue => {
    if (totalValue === 0) return null;
    // Clear existing SVG before creating new one
    d3.select(`#pie-chart-${pieChartId}`).remove();
    const svg = d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2}, ${CHART_SIZE / 2})`);

    const displayValue = togglePercentage
      ? (totalValue / calculateTotalHours(projectsData, tasksData)) * 100
      : totalValue;

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(
        togglePercentage
          ? `${displayValue.toFixed(2)}% of ${calculateTotalHours(projectsData, tasksData).toFixed(
              2,
            )}`
          : `${totalValue.toFixed(2)} Hrs`,
      );

    svg
      .append('foreignObject')
      .attr('x', -40)
      .attr('y', 10)
      .attr('width', 80)
      .attr('height', 40)
      .append('xhtml:div')
      .html(
        `
        <label class="switch">
          <input type="checkbox" ${togglePercentage ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      `,
      )
      .select('input')
      .on('change', handleTogglePercentage); // Use the existing React handler

    return svg;
  };

  const pie = d3.pie().value(d => d.totalTime);

  useEffect(() => {
    if (!tasksData || tasksData.length === 0) {
      return undefined;
    }
    const totalValue = tasksData?.reduce((sum, project) => sum + project.totalTime, 0);

    setTotalHours(totalValue);

    if (totalValue === 0) {
      return undefined;
    }

    if (!tasksData || tasksData.length === 0) {
      return <div>Loading</div>;
    }

    const dataReady = pie(tasksData);

    // let div = d3.select('.tooltip-donut');
    // if (div.empty()) {
    //   div = d3
    //     .select('body')
    //     .append('div')
    //     .attr('class', 'tooltip-donut')
    //     .style('opacity', 0)
    //     .style('position', 'absolute')
    //     .style('pointer-events', 'none');
    // }

    const svg = getCreateSvgPie(totalValue);
    if (!svg) return undefined; // Early return if no svg created
    // Create the pie chart
    svg
      .selectAll('path')
      .data(dataReady)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(70)
          .outerRadius(CHART_RADIUS),
      )
      .attr('fill', d => color(d.data.projectId))
      .style('opacity', d => (selectedProjects.includes(d.data.projectId) ? 1 : 0.1))
      .on('click', (event, d) => handleProjectClick(d.data.projectId));
    // .on('mouseover', (event, d) => {
    //   d3.select(event.currentTarget)
    //     .transition()
    //     .duration(50)
    //     .attr('opacity', 0.5);
    //   const percentage = ((d.data.totalTime / totalValue) * 100).toFixed(2);
    //   const legendInfo = togglePercentage
    //     ? `${d.data.projectName}: ${percentage}% of ${totalValue.toFixed(2)}`
    //     : `${d.data.projectName}: ${d.data.totalTime.toFixed(2)} Hours`;

    //   div
    //     .html(legendInfo)
    //     .style('max-width', '150px')
    //     .style('white-space', 'normal')
    //     .style('opacity', 1)
    //     .style('visibility', 'visible')
    //     .style('left', `${event.pageX + 10}px`)
    //     .style('top', `${event.pageY - 15}px`);
    // })
    // .on('mouseout', function handleMouseOut() {
    //   d3.select(this)
    //     .transition()
    //     .duration(50)
    //     .attr('opacity', 1);
    //   div
    //     .transition()
    //     .duration(50)
    //     .style('opacity', 0)
    //     .on('end', function hideToolTip() {
    //       d3.select(this).style('visibility', 'hidden');
    //     });
    // });

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
      d3.select('.tooltip-donut').remove(); // remove any leftover tooltip div
    };
  }, [tasksData, togglePercentage, selectedProjects]);

  return !tasksData || tasksData?.length === 0 ? (
    <div>Loading</div>
  ) : (
    <div className={`${styles['pie-chart-wrapper']} ${darkMode ? styles['text-light'] : ''}`}>
      <div id={`pie-chart-container-${pieChartId}`} className={styles['pie-chart']} />
      <div className={styles['pie-chart-legend-container']}>
        <div className={styles['pie-chart-legend-table-wrapper']}>
          <table
            className={
              darkMode ? styles['pie-chart-legend-table-dark'] : styles['pie-chart-legend-table']
            }
          >
            <thead>
              <tr>
                <th>Color</th>
                <th>Task Name</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {tasksData?.map(project => (
                <tr key={project.projectId}>
                  <td>
                    <div
                      className={styles['project-chart-legend']}
                      style={{ backgroundColor: `${color(project.projectId)}` }}
                    />
                  </td>
                  <td>{project.projectName}</td>
                  <td>{project.totalTime.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles['data-total-value']} style={{ marginTop: 8 }}>
          <strong className={styles['strong-text']}>Total Hours:</strong> {totalHours.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default PieChart;
