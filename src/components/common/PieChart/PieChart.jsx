/* eslint-disable no-restricted-globals */
import { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import { generateArrayOfUniqColors } from './colorsGenerator';
import './UserProjectPieChart.css';

export const PieChart = ({
  tasksData = [], // New array format: [{ projectId: "123", projectName: "Project A", totalTime: 10.5 }, ...]
  pieChartId,
  darkMode,
  projectsData = []
}) => {

  if (!tasksData || tasksData.length === 0) return <div>Loading</div>;
  const [totalHours, setTotalHours] = useState(0);
  const colors = useMemo(() => generateArrayOfUniqColors(tasksData?.length), [tasksData]);
  const color = useMemo(() => d3.scaleOrdinal().range(colors), [colors]);

  const [togglePercentage, setTogglePercentage] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(tasksData?.map(project => project.projectId));

  const handleTogglePercentage = () => {
    setTogglePercentage(prev => {
      const newToggleState = !prev;
      setTogglePercentage(newToggleState);
      if (!newToggleState) {
        setSelectedProjects(tasksData?.map(project => project.projectId));
      }
    });
  };
  const calculateTotalHours = (projectsData, tasksData) => {
    const totalTaskTime = tasksData?.reduce((sum, project) => sum + project.totalTime, 0);
    const projectsDataTime= projectsData.reduce((sum, project) => sum + project.totalTime, 0);
    return totalTaskTime+projectsDataTime;
  }

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
    if(totalValue === 0) return;
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
      // ? (selectedProjects.reduce((sum, projectId) => {
      //     const project = tasksData.find(p => p.projectId === projectId);
      //     return sum + (project ? project.totalTime : 0);
      //   }, 0) / totalValue) * 100
      // : totalValue;
      ? (totalValue / calculateTotalHours(projectsData, tasksData)) * 100
    : totalValue;
  
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(
        togglePercentage
          ? `${displayValue.toFixed(2)}% of ${calculateTotalHours(projectsData,tasksData).toFixed(2)}`
          : totalValue.toFixed(2),
      );
  
    svg
      .append('foreignObject')
      .attr('x', -40)
      .attr('y', 10)
      .attr('width', 80)
      .attr('height', 40)
      .append('xhtml:div')
      .html(`
        <label class="switch">
          <input type="checkbox" ${togglePercentage ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      `)
      .select('input')
      .on('change', handleTogglePercentage); // Use the existing React handler

      return svg;
  };
  
  const pie = d3.pie().value(d => d.totalTime);

  useEffect(() => {
    if (!tasksData || tasksData.length === 0) {
      return;
  }
    const totalValue = tasksData?.reduce((sum, project) => sum + project.totalTime, 0);
    if(totalValue === 0) return;
    setTotalHours(totalValue);

    const dataReady = pie(tasksData);

    let div = d3.select('.tooltip-donut');
    if (div.empty()) {
      div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip-donut')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('pointer-events', 'none');
    }

   const svg= getCreateSvgPie(totalValue)
   if (!svg) return; // Early return if no svg created
    // Create the pie chart
      svg.selectAll('path')
      .data(dataReady)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(70)
          .outerRadius(CHART_RADIUS),
      )
      //.attr('fill', d => color(d.data[0]))
      //.style('opacity', d => (selectedTasks.includes(d.data[0]) ? 1 : 0.1))
      //.on('click', (event, d) => handleTaskClick(d.data[0]))
      //.on('mouseover', function handleMouseOver(d, i) {
      //  d3.select(this)
      //    .transition()
      //    .duration('50')
      //    .attr('opacity', '.5');
      //  div
      //    .transition()
      //   .duration(50)
      //   .style('opacity', 1)
      //    .style('visibility', 'visible');
        // const taskName = Object.keys(chartLegend).map(key => {
        //   return chartLegend[key][0];
        // });
        // const index = Object.keys(chartLegend)
        //   .map(function(e) {
        //     return e;
        //   })
        //   .indexOf(i.data[0]);
        // const legendInfo = taskName[index].toString();
      //  const taskName = chartLegend[i.data[0]][0];
      //  const taskValue = i.value;
      //  const percentage = ((taskValue / totalValue) * 100).toFixed(2);


      .attr('fill', d => color(d.data.projectId))
      .style('opacity', d => (selectedProjects.includes(d.data.projectId) ? 1 : 0.1))
      .on('click', (event, d) => handleProjectClick(d.data.projectId))
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).transition().duration(50).attr('opacity', 0.5);
        const percentage = ((d.data.totalTime / totalValue) * 100).toFixed(2);
        const legendInfo = togglePercentage
          ? `${d.data.projectName}: ${percentage}% of ${totalValue.toFixed(2)}`
          : `${d.data.projectName}: ${d.data.totalTime.toFixed(2)} Hours`;

        //const containerWidth = document.getElementById(`pie-chart-container-${pieChartId}`)
        //  .offsetWidth;
        //const tooltipWidth = div.node().offsetWidth;
        //const mouseX = d.pageX;

        //const tooltipX =
        //mouseX + 10 + tooltipWidth > containerWidth ? mouseX - tooltipWidth - 10 : mouseX + 10;

        //div.style('left', `${tooltipX}px`).style('top', `${d.pageY - 15}px`);
      //})
      //.on('mouseout', function handleMouseOut() {
      //  d3.select(this)
      //    .transition()
      //    .duration('50')
      //    .attr('opacity', '.85');
      //  div
      //    .transition()
      //    .duration('50')
      //    .style('opacity', 0)
      //   .on('end', function hideTooltip() {
      //      d3.select(this).style('visibility', 'hidden'); // Hide after transition
      //    });
        div
          .html(legendInfo)
          .style('max-width', '150px')
          .style('white-space', 'normal')
          .style('opacity', 1)
          .style('visibility', 'visible')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(50).attr('opacity', 1);
        div.transition().duration(50).style('opacity', 0).on('end', function () {
          d3.select(this).style('visibility', 'hidden');
        });
      });

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [tasksData, togglePercentage, selectedProjects]);

 

  return (
   !tasksData || tasksData?.length===0? <div>Loading</div> :<div className={`pie-chart-wrapper ${darkMode ? 'text-light' : ''}`}>
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      //<div className="pie-chart-legend-container">
      //  <div className="pie-chart-legend-header">
      //    <div>Name</div>
      //    <div>{dataLegendHeader}</div>
      //  </div>
      //  {Object.keys(dataLegend).map(key => (
      //    <div key={key} className="pie-chart-legend-item">
      //     <div className="data-legend-color" style={{ backgroundColor: color(key) }} />
      //      <div className="data-legend-info">
      //      {dataLegend[key].map((legendPart, index) => (
      //         <div
      //            className={`data-legend-info-part ${darkMode ? 'text-light' : ''}`}
                  // eslint-disable-next-line react/no-array-index-key
      //            key={index}
      //          >
      //           {legendPart}
      //          </div>
      //       ))}
      //     </div>
      //    </div>
      //  ))}
      //  <div className="data-total-value">Total Hours : {totalHours.toFixed(2)}</div>
    <div className="pie-chart-legend-container">
      <div className="pie-chart-legend-table-wrapper">
        <table className={darkMode ?"pie-chart-legend-table-dark":"pie-chart-legend-table"}>
          <thead>
            <tr>
              <th>Color</th>
              <th>Project Name</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {tasksData?.map(project => (
              <tr key={project.projectId}>
                <td>
                  <div id="project-chart-legend" style={{ backgroundColor: `${color(project.projectId)}`}}></div>
                </td>
                <td>{project.projectName}</td>
                <td>{project.totalTime.toFixed(2)} </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-total-value">
        <strong>Total Hours:</strong> {totalHours.toFixed(2)}
      </div>
    </div>
    </div>
  );
};
