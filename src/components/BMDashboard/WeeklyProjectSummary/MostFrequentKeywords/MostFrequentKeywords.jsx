import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as d3 from 'd3';
import styles from './MostFrequentKeywords.module.css';
import Select from 'react-select';

function MostFrequentKeywords() {
  const svgRef = useRef();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_APIENDPOINT;
  const darkMode = useSelector(state => state.theme.darkMode);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: token },
      });
      setProjects(res.data || []);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch projects', err);
      }
    }
  };

  const fetchFrequentTags = async () => {
    if (!selectedProject) return;
    try {
      setIsLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('projectId', selectedProject);
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());
      params.append('limit', 7);

      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/tags/frequent?${params.toString()}`, {
        headers: { Authorization: token },
      });

      setTags(res.data?.data || []);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Tag fetch failed:', err);
      }
      setError('Failed to load tag data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchFrequentTags();
  }, [selectedProject, startDate, endDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const svgEl = svgRef.current;
      if (!tags?.length || !svgEl) return;

      // eslint-disable-next-line testing-library/no-node-access
      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const container = svgEl.parentElement;
      const width = container?.clientWidth || 500;
      const height = 400;
      const centerX = width / 2;
      const centerY = height / 2;
      const padding = 50;
      const radius = Math.min(width - padding * 2, height - padding * 2) * 0.42;

      const ellipseRx = 48;
      const ellipseRy = 20;

      svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      svg
        .append('ellipse')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('rx', ellipseRx)
        .attr('ry', ellipseRy)
        .attr('fill', '#3B82F6');

      svg
        .append('text')
        .attr('x', centerX)
        .attr('y', centerY - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '10px')
        .text('Most Frequent');

      svg
        .append('text')
        .attr('x', centerX)
        .attr('y', centerY + 9)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '10px')
        .text('Keywords');

      const angleStep = (2.3 * Math.PI) / tags.length;
      const angles = tags.map((_, i) => i * angleStep + Math.PI / 2 + 0.1);

      const getEllipseSize = text => {
        const len = text.length;
        if (len > 14) return { rx: 48, ry: 22 };
        if (len > 10) return { rx: 42, ry: 22 };
        return { rx: 32, ry: 16 };
      };

      const ensureInBounds = (x, y) => ({
        x: Math.max(padding, Math.min(width - padding, x)),
        y: Math.max(padding, Math.min(height - padding, y)),
      });

      tags.forEach((tag, i) => {
        const angle = angles[i];
        const isLeftOrRight = Math.abs(Math.cos(angle)) > 0.9;
        const adjustedRadius = isLeftOrRight ? radius * 1.35 : radius;

        let x = centerX + adjustedRadius * Math.cos(angle);
        let y = centerY + adjustedRadius * Math.sin(angle);
        ({ x, y } = ensureInBounds(x, y));

        const xStart = centerX + ellipseRx * Math.cos(angle);
        const yStart = centerY + ellipseRy * Math.sin(angle);

        svg
          .append('line')
          .attr('x1', xStart)
          .attr('y1', yStart)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#555');

        const { rx, ry } = getEllipseSize(tag.tag);
        svg
          .append('ellipse')
          .attr('cx', x)
          .attr('cy', y)
          .attr('rx', rx)
          .attr('ry', ry)
          .attr('fill', '#E0F2FE')
          .style('cursor', 'pointer')
          .attr('tabindex', 0)
          .attr('role', 'button')
          .attr('aria-label', `Keyword: ${tag.tag}`)
          .on('mouseover', function() {
            // eslint-disable-next-line testing-library/no-node-access
            d3.select(this).attr('fill', '#BFDBFE');
          })
          .on('mouseout', function() {
            // eslint-disable-next-line testing-library/no-node-access
            d3.select(this).attr('fill', '#E0F2FE');
          })
          .on('click', () => {
            window.open(`/tags/${tag.tag}`, '_blank');
          });

        const textEl = svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#111');

        // Split text if it's longer than 14 characters
        let words = [];
        if (tag.tag.length > 14) {
          const parts = tag.tag.split(' ');
          if (parts.length > 1) {
            const mid = Math.ceil(parts.length / 2);
            words = [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')];
          } else {
            const midIndex = Math.ceil(tag.tag.length / 2);
            words = [tag.tag.slice(0, midIndex), tag.tag.slice(midIndex)];
          }
        } else {
          words = [tag.tag];
        }

        if (words.length > 1) {
          textEl.attr('transform', `translate(0, -7)`);
        }

        // Add tspans for each line
        words.forEach((line, index) => {
          textEl
            .append('tspan')
            .attr('x', x)
            .attr('dy', index === 0 ? 4 : 14)
            .text(line);
        });

        // Tooltip with full text
        textEl.append('title').text(tag.tag);
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [tags]);

  return (
    <div className={`${styles.mfkContainer} ${darkMode ? 'darkMode' : ''}`}>
      <h3 className={styles.mfkTitle}>📊 Most Frequent Keywords</h3>
      <div className={styles.mfkControls}>
        <div>
          <label htmlFor="project-select" className={styles.mfkLabel}>
            Project
          </label>
          <Select
            inputId="project-select"
            className={styles.mfkSelect}
            classNamePrefix="project-select"
            options={projects.map(p => ({
              label: p.projectName,
              value: p._id,
            }))}
            value={projects
              .map(p => ({ label: p.projectName, value: p._id }))
              .find(opt => opt.value === selectedProject)}
            onChange={selected => setSelectedProject(selected?.value || '')}
            placeholder="Select a project..."
            isSearchable
          />
        </div>
        <div>
          <label htmlFor="start-date" className={styles.mfkLabel}>
            From
          </label>
          <DatePicker
            id="start-date"
            selected={startDate}
            onChange={date => setStartDate(date)}
            className={styles.mfkDatepicker}
            placeholderText="Start date"
          />
        </div>
        <div>
          <label htmlFor="end-date" className={styles.mfkLabel}>
            To
          </label>
          <DatePicker
            id="end-date"
            selected={endDate}
            onChange={date => setEndDate(date)}
            className={styles.mfkDatepicker}
            placeholderText="End date"
          />
        </div>
      </div>

      <div className={styles.mfkChartContainer}>
        {isLoading && <div className={styles.mfkLoading}>Loading...</div>}
        {!isLoading && error && <div className={styles.mfkError}>{error}</div>}
        {!isLoading && !error && tags.length === 0 && (
          <div className={styles.mfkEmpty}>No tags found for this selection.</div>
        )}
        {!isLoading && !error && tags.length > 0 && <svg ref={svgRef} />}
      </div>
    </div>
  );
}

export default MostFrequentKeywords;
