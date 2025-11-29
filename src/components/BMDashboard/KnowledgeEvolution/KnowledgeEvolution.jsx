'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Funnel, Search } from 'lucide-react';
import styles from './knowledgeEvolution.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKnowledgeEvolutionData } from '../../../actions/bmdashboard/knowledgeEvolutionActions';

const KnowledgeEvolution = () => {
  const svgRef = useRef();
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.knowledgeEvolution);

  useEffect(() => {
    dispatch(fetchKnowledgeEvolutionData('6652347c57ca141fe891e1ca'));
  }, []);

  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    if (data?.knowledgeEvolution?.length > 0) {
      setSelectedSubject(data.knowledgeEvolution[0]._id);
    }
  }, [data]);

  const allAtoms = data?.knowledgeEvolution?.flatMap(s => s.atoms) || [];
  const totalCompleted = allAtoms.filter(a => a.atomStatus === 'completed').length;
  const totalInProgress = allAtoms.filter(a => a.atomStatus === 'in_progress').length;
  const totalNotStarted = allAtoms.filter(a => a.atomStatus === 'not_started').length;
  const savedInterest = 2;

  useEffect(() => {
    if (!data || !selectedSubject) return;

    const subjectData = data.knowledgeEvolution.find(s => s._id === selectedSubject);
    if (!subjectData) return;

    const courses = subjectData.atoms;
    const width = 700;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const subjectRadius = 60;
    const courseRadius = 45;
    const orbitRadius = 180;

    // COLOR MAP
    const colorMap = {
      completed: '#28a745',
      in_progress: '#ffc107',
      not_started: '#6c757d',
    };

    const darkerMap = {
      completed: '#1e7e34',
      in_progress: '#e0a800',
      not_started: '#5a6268',
    };

    // SUBJECT NODE
    const subjectNode = {
      id: subjectData.subjectName,
      type: 'subject',
      x: centerX,
      y: centerY,
    };

    // ATOM NODES
    const courseNodes = courses.map((atom, i) => {
      const angle = (2 * Math.PI * i) / courses.length;
      return {
        id: atom.atomId,
        name: atom.atomName,
        status: atom.atomStatus,
        type: 'course',
        x: centerX + orbitRadius * Math.cos(angle),
        y: centerY + orbitRadius * Math.sin(angle),
      };
    });

    const allNodes = [subjectNode, ...courseNodes];

    const allLinks = courseNodes.map(atom => {
      const dx = atom.x - subjectNode.x;
      const dy = atom.y - subjectNode.y;
      const angle = Math.atan2(dy, dx);

      const sourceX = subjectNode.x + subjectRadius * Math.cos(angle);
      const sourceY = subjectNode.y + subjectRadius * Math.sin(angle);
      const targetX = atom.x - courseRadius * Math.cos(angle);
      const targetY = atom.y - courseRadius * Math.sin(angle);

      return {
        x1: sourceX,
        y1: sourceY,
        x2: targetX,
        y2: targetY,
        status: atom.status,
      };
    });

    svg
      .append('g')
      .selectAll('line')
      .data(allLinks)
      .enter()
      .append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke', d => colorMap[d.status])
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => (d.status === 'not_started' ? '6,4' : '0'));

    svg
      .append('g')
      .selectAll('circle')
      .data(allNodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => (d.type === 'subject' ? subjectRadius : courseRadius))
      .attr('fill', d => {
        if (d.type === 'subject') return 'orange';
        let base = d3.color(colorMap[d.status]);
        base.opacity = 0.4;
        return base;
      })
      .attr('stroke', d => (d.type === 'subject' ? '#cc7000' : darkerMap[d.status]))
      .attr('stroke-width', 3);

    svg
      .append('g')
      .selectAll('text')
      .data(allNodes)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => (d.type === 'subject' ? 18 : 12))
      .each(function(d) {
        const node = d3.select(this);
        const words = (d.type === 'subject' ? d.id : d.name).split(' ');
        let yOffset = -(words.length - 1) * 6;
        words.forEach(word => {
          node
            .append('tspan')
            .attr('x', d.x)
            .attr('dy', yOffset)
            .text(word);
          yOffset = 12;
        });
      });
  }, [data, selectedSubject]);

  if (loading || !data) return <div>Loading Knowledge Evolution...</div>;

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.headerContainer}>
        <h5>Knowledge Evolution</h5>

        {/* SUMMARY */}
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

        {/* SEARCH + FILTER */}
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

      {/* SUBJECT TABS */}
      <div className={styles.subjectTabs}>
        {data.knowledgeEvolution.map(s => (
          <button
            key={s._id}
            className={`${styles.tabButton} ${selectedSubject === s._id ? styles.activeTab : ''}`}
            onClick={() => setSelectedSubject(s._id)}
          >
            {s.subjectName}
          </button>
        ))}
      </div>

      {/* D3 CHART */}
      <div className={styles.chartWrapper}>
        <svg ref={svgRef} width={700} height={500}></svg>
      </div>
    </div>
  );
};

export default KnowledgeEvolution;
