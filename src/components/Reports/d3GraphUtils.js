import * as d3 from 'd3';

export function createSvgRoot(selector, containerWidth, height, margin, darkMode) {
  return d3
    .select(selector)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
    .style('background-color', darkMode ? '#1b2a41' : '#ffffff');
}

export function createAxes(svg, x, y, height, darkMode) {
  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('fill', darkMode ? '#f9fafb' : 'black');

  svg
    .append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('fill', darkMode ? '#f9fafb' : 'black');
}

export function createLine(svg, data, x, y, darkMode) {
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', darkMode ? '#f9fafb' : 'black')
    .attr('stroke-width', 1.5)
    .attr('d', d3.line().x(d => x(d.date)).y(d => y(d.count)));
}

export function createDots(svg, data, x, y) {
  return svg
    .append('g')
    .selectAll('dot')
    .data(data)
    .join('circle')
    .attr('class', 'myCircle')
    .attr('cx', d => x(d.date))
    .attr('cy', d => y(d.count))
    .attr('r', 3)
    .attr('stroke', '#69b3a2')
    .attr('stroke-width', 3)
    .attr('fill', 'white');
}

export function createLabels(svg, data, x, y, className, darkMode, textFn) {
  svg
    .append('g')
    .selectAll('text')
    .data(data)
    .join('text')
    .attr('class', className)
    .attr('x', d => x(d.date) + 10)
    .attr('y', d => y(d.count) - 5)
    .attr('fill', darkMode ? '#f9fafb' : 'black')
    .style('z-index', 999)
    .style('font-weight', 700)
    .style('display', 'none')
    .text(textFn);
}

export function createTooltip(selector, d, darkMode) {
  return d3
    .select(selector)
    .append('div')
    .style('opacity', 0)
    .attr('class', `tooltip ${d.id !== undefined ? d.id : ''}`)
    .style('background-color', darkMode ? '#1b2a41' : 'white')
    .style('color', darkMode ? '#f9fafb' : 'black')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px')
    .style('z-index', 1000);
}

export function createLegend(selector, html) {
  const legend = d3.select(selector).append('div').attr('class', 'legendContainer');
  legend.html(html);
  return legend;
}