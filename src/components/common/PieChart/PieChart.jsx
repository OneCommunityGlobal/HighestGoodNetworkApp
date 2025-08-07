import { useEffect, useState } from 'react';
import * as d3 from 'd3/dist/d3.min';
import { CHART_RADIUS, CHART_SIZE } from './constants';
import './PieChart.css';

export const PieChart = ({
  data,
  dataLegend,
  chartLegend,
  pieChartId,
  dataLegendHeader,
  darkMode,
}) => {
  const [totalHours, setTotalHours] = useState(0);

  // Custom vibrant color palette
  const customColors = [
    // Original 15 Colors (Top)
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFBE0B',
    '#118AB2',
    '#FF006E',
    '#8338EC',
    '#3A86FF',
    '#FB5607',
    '#38B000',
    '#7209B7',
    '#F72585',
    '#4CC9F0',
    '#80ED99',
    '#F15BB5',

    // New 35 Colors (Below)
    '#96CEB4',
    '#FFD166', // Mellow Yellow
    '#06D6A0', // Bright Mint
    '#073B4C', // Midnight Blue
    '#F94144', // Tomato Red
    '#F3722C', // Persimmon
    '#F9C74F', // Saffron
    '#90BE6D', // Pistachio
    '#43AA8B', // Zomp
    '#577590', // Slate Gray
    '#EF476F', // Paradise Pink
    '#FAD02C', // Bumblebee
    '#2A9D8F', // Persian Green
    '#E9C46A', // Jute
    '#F4A261', // Sandy Brown
    '#E76F51', // Burnt Sienna
    '#264653', // Charcoal
    '#A01A58', // Mulberry
    '#B5E48C', // Mindaro
    '#3D405B', // Gunmetal
    '#81B29A', // Cambridge Blue
    '#F2CC8F', // Buff
    '#E07A5F', // Terra Cotta
    '#D81159', // Ruby
    '#218380', // Viridian Green
    '#FFBC42', // Macaroni and Cheese
    '#6A057F', // Palatinate Purple
    '#00A896', // Green Munsell
    '#5E2B78', // Russian Violet
    '#E85D04', // Tangerine
    '#6411AD', // Veronica
    '#B9E769', // June Bud
    '#26547C', // Lapiz Lazuli
    '#00C49F', // Caribbean Green
    '#FFC658', // Goldenrod
  ];

  let color = d3.scaleOrdinal().range(customColors);

  const getCreateSvgPie = totalValue => {
    const svg = d3
      .select(`#pie-chart-container-${pieChartId}`)
      .append('svg')
      .attr('id', `pie-chart-${pieChartId}`)
      .attr('width', CHART_SIZE)
      .attr('height', CHART_SIZE)
      .append('g')
      .attr('transform', `translate(${CHART_SIZE / 2},${CHART_SIZE / 2})`);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('fill', darkMode ? 'white' : 'black')
      .text(totalValue.toFixed(2));

    return svg;
  };

  const pie = d3.pie().value(d => d[1]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    color = d3.scaleOrdinal().range(customColors);
    const data_ready = pie(Object.entries(data));

    const totalValue = data_ready.map(obj => obj.value).reduce((a, c) => a + c, 0);

    setTotalHours(totalValue);

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

    getCreateSvgPie(totalValue)
      .selectAll('whatever')
      .data(data_ready)
      .join('path')
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(70)
          .outerRadius(CHART_RADIUS),
      )
      .attr('fill', d => color(d.data[0]))
      .style('filter', 'brightness(1.1)')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '.7')
          .style('filter', 'brightness(1.2)');

        div
          .transition()
          .duration(50)
          .style('opacity', 1)
          .style('visibility', 'visible');

        const taskName = Object.keys(chartLegend).map(key => chartLegend[key][0]);
        const index = Object.keys(chartLegend)
          .map(e => e)
          .indexOf(d.data[0]);
        const legendInfo = taskName[index].toString();

        div
          .html(legendInfo)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '1')
          .style('filter', 'brightness(1.1)');

        div
          .transition()
          .duration(50)
          .style('opacity', 0)
          .on('end', function() {
            d3.select(this).style('visibility', 'hidden');
          });
      });

    return () => {
      d3.select(`#pie-chart-${pieChartId}`).remove();
    };
  }, [data]);

  return (
    <div className={`pie-chart-wrapper ${darkMode ? 'text-light' : ''}`}>
      <div id={`pie-chart-container-${pieChartId}`} className="pie-chart" />
      <div className="pie-chart-legend-container">
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {Object.keys(dataLegend).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div
              className="data-legend-color"
              style={{
                backgroundColor: dataLegend[key][0].includes('other') ? 'white' : color(key),
                filter: 'brightness(1.1)',
              }}
            />
            <div className="data-legend-info">
              {dataLegend[key].map((legendPart, index) => (
                <div
                  className={`data-legend-info-part ${darkMode ? 'text-light' : ''}`}
                  key={index}
                >
                  {legendPart}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="data-total-value">Total Hours : {totalHours.toFixed(2)}</div>
      </div>
    </div>
  );
};
