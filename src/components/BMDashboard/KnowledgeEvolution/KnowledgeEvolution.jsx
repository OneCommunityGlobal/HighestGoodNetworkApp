'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Funnel, Search } from 'lucide-react';
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
  const [selectedSubject, setSelectedSubject] = useState(mockData[0].subject);

  //summary
  const totalCompleted = mockData.flatMap(d => d.courses).filter(c => c.status === 'completed')
    .length;
  const totalInProgress = mockData.flatMap(d => d.courses).filter(c => c.status === 'in-progress')
    .length;
  const totalNotStarted = mockData.flatMap(d => d.courses).filter(c => c.status === 'not-started')
    .length;
  const savedInterest = 2;

  //chart display

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

    const darkerColor = {
      completed: '#1e7e34',
      'in-progress': '#e0a800',
      'not-started': '#5a6268',
    };

    const subjectData = mockData.find(d => d.subject === selectedSubject);
    const centerX = width / 2;
    const centerY = height / 2;

    const subjectRadius = 60;
    const courseRadius = 45;
    const orbitRadius = 180;

    // subject node
    const subjectNode = {
      id: subjectData.subject,
      type: 'subject',
      x: centerX,
      y: centerY,
    };

    // course nodes
    const courseNodes = subjectData.courses.map((course, i) => {
      const angle = (2 * Math.PI * i) / subjectData.courses.length;
      return {
        id: `${subjectData.subject}-${course.name}`,
        name: course.name,
        status: course.status,
        type: 'course',
        x: centerX + orbitRadius * Math.cos(angle),
        y: centerY + orbitRadius * Math.sin(angle),
      };
    });

    const allNodes = [subjectNode, ...courseNodes];
    const allLinks = courseNodes.map(course => ({
      source: subjectNode,
      target: course,
      status: course.status,
    }));

    //links
    svg
      .append('g')
      .selectAll('line')
      .data(allLinks)
      .enter()
      .append('line')
      .attr('x1', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = (dx * subjectRadius) / dist;
        return d.source.x + offset;
      })
      .attr('y1', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = (dy * subjectRadius) / dist;
        return d.source.y + offset;
      })
      .attr('x2', d => {
        const dx = d.source.x - d.target.x;
        const dy = d.source.y - d.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = (dx * courseRadius) / dist;
        return d.target.x + offset;
      })
      .attr('y2', d => {
        const dx = d.source.x - d.target.x;
        const dy = d.source.y - d.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = (dy * courseRadius) / dist;
        return d.target.y + offset;
      })
      .attr('stroke', d => colorMap[d.status])
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => (d.status === 'not-started' ? '6,4' : '0'))
      .attr('stroke-opacity', 0.8);

    //nodes
    const nodeGroup = svg.append('g');

    nodeGroup
      .selectAll('circle')
      .data(allNodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => (d.type === 'subject' ? subjectRadius : courseRadius))
      .attr('fill', d => {
        if (d.type === 'subject') return 'orange';
        const base = d3.color(colorMap[d.status]);
        base.opacity = 0.4;
        return base;
      })
      .attr('stroke', d => (d.type === 'subject' ? '#cc7000' : darkerColor[d.status]))
      .attr('stroke-width', 3);

    // labels
    const labelGroup = svg.append('g');

    labelGroup
      .selectAll('text')
      .data(allNodes)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => (d.type === 'subject' ? 18 : 12))
      .attr('fill', '#222')
      .each(function(d) {
        const text = d3.select(this);
        const words = (d.type === 'subject' ? d.id : d.name).split(/\s+/);
        const lineHeight = d.type === 'subject' ? 18 : 14;
        const maxWidth = d.type === 'subject' ? 80 : 70;
        let line = [];
        let lineNumber = 0;
        let tspan = text
          .append('tspan')
          .attr('x', d.x)
          .attr('y', d.y)
          .attr('dy', 0);

        for (let i = 0; i < words.length; i++) {
          line.push(words[i]);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
            line.pop();
            tspan.text(line.join(' '));
            line = [words[i]];
            lineNumber++;
            tspan = text
              .append('tspan')
              .attr('x', d.x)
              .attr('y', d.y)
              .attr('dy', lineNumber * lineHeight - (lineHeight * (words.length - 1)) / 2)
              .text(words[i]);
          }
        }

        // Center vertically
        const tspans = text.selectAll('tspan');
        const totalHeight = tspans.size() * lineHeight;
        tspans.attr('dy', function(_, i) {
          return (i - (tspans.size() - 1) / 2) * lineHeight + 4;
        });
      });
  }, [selectedSubject]);

  return (
    <div className={styles.pageContainer}>
      {/* header */}
      <div className={styles.headerContainer}>
        <h5>Knowledge Evolution</h5>

        {/* Ssummary*/}
        <div className={styles.summarySection}>
          <h6 className={styles.summaryHeading}>Overall Progress Across All Subjects</h6>
          <div className={styles.summaryStats}>
            <div className={styles.statBox}>
              <h3>{totalCompleted}</h3>
              <p>Total Completed</p>
            </div>
            <div className={styles.statBox}>
              <h3>{totalInProgress}</h3>
              <p>Total In Progress</p>
            </div>
            <div className={styles.statBox}>
              <h3>{totalNotStarted}</h3>
              <p>Total Not Started</p>
            </div>
            <div className={styles.statBox}>
              <h3>{savedInterest}</h3>
              <p>Saved Interest</p>
            </div>
          </div>
        </div>

        {/* search and filetr */}
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search atoms or subjects"
              className={styles.searchInput}
            />
          </div>

          <button className={styles.filterButton}>
            <Funnel size={18} />
            <span>Filter by Subject</span>
          </button>
        </div>
      </div>

      {/* subjects selection tab */}
      <div className={styles.subjectTabs}>
        {mockData.map(subj => (
          <button
            key={subj.subject}
            className={`${styles.tabButton} ${
              selectedSubject === subj.subject ? styles.activeTab : ''
            }`}
            onClick={() => setSelectedSubject(subj.subject)}
          >
            {subj.subject}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className={styles.chartWrapper}>
        <svg ref={svgRef} width={700} height={500}></svg>
      </div>
    </div>
  );
};

export default KnowledgeEvolution;
