import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function DonutChart({ data, width, height, innerRadius, outerRadius, totalBlueSquares, colors }) {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll('*')
      .remove();

    const expandedRadius = outerRadius + 10;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width + 200} ${height + 100}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${(width + 200) / 2 - 100}, ${(height + 100) / 2})`);

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map(colorScaleD => colorScaleD.label))
      .range(colors);

    const pieGenerator = d3.pie().value(pieGeneratorD => pieGeneratorD.value);
    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const arcs = svg
      .selectAll('g.arc')
      .data(pieGenerator(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arcDPath => arcGenerator(arcDPath))
      .attr('fill', arcFill => colorScale(arcFill.data.label))
      .on('mouseover', function handleMouseOver() {
        const currentPath = d3.select(this);
        currentPath
          .transition()
          .duration(200)
          .attr('d', currentPathD =>
            d3
              .arc()
              .innerRadius(innerRadius)
              .outerRadius(expandedRadius)(currentPathD),
          );
      })
      .on('mouseout', function handleMouseOut() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcGenD => arcGenerator(arcGenD));
      });

    arcs
      .append('text')
      .attr('transform', arcTransformD => `translate(${arcGenerator.centroid(arcTransformD)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', `${Math.min(width, height) * 0.045}px`)
      .style('font-weight', '600')
      .style('text-wrap', 'wrap')
      .text(arcTextD => arcTextD.data.value);

    arcs
      .append('text')
      .attr(
        'transform',
        arcTransformTextD => `translate(${arcGenerator.centroid(arcTransformTextD)})`,
      )
      .attr('text-anchor', 'middle')
      .attr('dy', '1.0em')
      .style('font-size', `${Math.min(width, height) * 0.028}px`)
      .text(
        arcD =>
          `(${((arcD.data.value / d3.sum(data, sumArcD => sumArcD.value)) * 100).toFixed(2)}%)`,
      );

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', `${Math.min(width, height) * 0.03}px`)
      .style('fill', '#828282')
      .style('font-weight', '600')
      .text('TOTAL BLUE SQUARES');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', `${Math.min(width, height) * 0.1}px`)
      .style('fill', '#828282')
      .style('font-weight', '600')

      .text(totalBlueSquares);

    // Create legend
    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (_, i) => `translate(${outerRadius + 50}, ${i * 25 - height / 4 + 20})`);

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', rectFill => colorScale(rectFill.label));

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .style('font-size', '1rem')
      .text(textLabel => textLabel.label);
  }, [data, width, height, innerRadius, outerRadius, totalBlueSquares, colors]);

  return <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />;
}

export default DonutChart;
