'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './knowledgeEvolution.module.css';

const mockData = [
  {
    subject: 'Mathematics',
    courses: [
      { name: 'Algebra Basics', status: 'completed' },
      { name: 'Geometry', status: 'in-progress' },
      { name: 'Calculus I', status: 'not-started' },
      { name: 'Statistics', status: 'completed' },
    ],
  },
  {
    subject: 'Science',
    courses: [
      { name: 'Physics Fundamentals', status: 'completed' },
      { name: 'Cell Biology', status: 'in-progress' },
      { name: 'Chemistry 101', status: 'not-started' },
      { name: 'Astronomy', status: 'completed' },
    ],
  },
  {
    subject: 'History',
    courses: [
      { name: 'Ancient Civilizations', status: 'completed' },
      { name: 'World War II', status: 'in-progress' },
      { name: 'Modern History', status: 'not-started' },
    ],
  },
];

const KnowledgeEvolution = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 700;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const colorMap = {
      completed: '#28a745',
      'in-progress': '#ffc107',
      'not-started': '#6c757d',
    };

    const allNodes = [];
    const allLinks = [];

    mockData.forEach((subjectData, index) => {
      const centerX = (index + 1) * (width / (mockData.length + 1));
      const centerY = height / 2;

      const subjectNode = {
        id: subjectData.subject,
        type: 'subject',
        fx: centerX,
        fy: centerY,
      };
      allNodes.push(subjectNode);

      // course nodes
      subjectData.courses.forEach((course, i) => {
        const node = {
          id: `${subjectData.subject}-${course.name}`,
          name: course.name,
          status: course.status,
          type: 'course',
        };
        allNodes.push(node);
        allLinks.push({ source: subjectNode.id, target: node.id });
      });
    });

    const simulation = d3
      .forceSimulation(allNodes)
      .force(
        'link',
        d3
          .forceLink(allLinks)
          .id(d => d.id)
          .distance(100),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    const link = svg
      .append('g')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.2)
      .selectAll('line')
      .data(allLinks)
      .enter()
      .append('line');

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(allNodes)
      .enter()
      .append('circle')
      .attr('r', d => (d.type === 'subject' ? 35 : 18))
      .attr('fill', d => (d.type === 'subject' ? 'orange' : colorMap[d.status]))
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended),
      );

    const labels = svg
      .append('g')
      .selectAll('text')
      .data(allNodes)
      .enter()
      .append('text')
      .text(d => (d.type === 'subject' ? d.id : d.name))
      .attr('font-size', d => (d.type === 'subject' ? 14 : 12))
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#222');

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);
      labels.attr('x', d => d.x).attr('y', d => d.y);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.type !== 'subject') {
        d.fx = null;
        d.fy = null;
      }
    }

    return () => simulation.stop();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h4>Knowledge Evolution</h4>
      </div>
      <div className={styles.chartWrapper}>
        <svg ref={svgRef} width={700} height={500}></svg>
      </div>
    </div>
  );
};

export default KnowledgeEvolution;
