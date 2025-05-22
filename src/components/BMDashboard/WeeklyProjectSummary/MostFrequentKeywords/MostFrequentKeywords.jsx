import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as d3 from 'd3';
import './MostFrequentKeywords.css';
import Select from 'react-select';

const fontSizeScale = (frequency) => {
  if (frequency > 100) return 24;
  if (frequency > 70) return 20;
  if (frequency > 40) return 16;
  return 12;
};

const MostFrequentKeywords = () => {
  const svgRef = useRef();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_APIENDPOINT;

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: token },
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
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
      console.error('Tag fetch failed:', err);
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

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const container = svgEl.parentElement;
      const width = container?.clientWidth || 500;
      const height = 400;

      svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const centerX = width / 2;
      const centerY = height / 2;
      const padding = 50;
      const radius = Math.min(width - padding * 2, height - padding * 2) * 0.42;

      const ellipseRx = 48;
      const ellipseRy = 20;

      svg.append('ellipse')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('rx', ellipseRx)
        .attr('ry', ellipseRy)
        .attr('fill', '#3B82F6');

      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '10px')
        .text('Most Frequent');

      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 9)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '10px')
        .text('Keywords');

      const angleStep = (2.3 * Math.PI) / tags.length;
      const angles = tags.map((_, i) => i * angleStep + Math.PI / 2 + 0.1); // Start from top

      const getEllipseSize = (text) => {
        const len = text.length;
        if (len > 14) return { rx: 48, ry: 18 };
        if (len > 10) return { rx: 40, ry: 16 };
        return { rx: 32, ry: 16 };
      };

      const ensureInBounds = (x, y, padding) => {
        return {
          x: Math.max(padding, Math.min(width - padding, x)),
          y: Math.max(padding, Math.min(height - padding, y))
        };
      };

      const truncateText = (text, max = 14) => {
        if (text.length <= max) return text;
        return text.slice(0, max - 1) + '…';
      };

      tags.forEach((tag, i) => {
        const angle = angles[i];
        const isLeftOrRight = Math.abs(Math.cos(angle)) > 0.9; // near 0° or 180°
        const adjustedRadius = isLeftOrRight ? radius * 1.35 : radius;
      
        let x = centerX + adjustedRadius * Math.cos(angle);
        let y = centerY + adjustedRadius * Math.sin(angle);
      
        const { x: boundedX, y: boundedY } = ensureInBounds(x, y, padding);
        x = boundedX;
        y = boundedY;
      
        // Adjust line start (from ellipse edge)
        const xStart = centerX + ellipseRx * Math.cos(angle);
        const yStart = centerY + ellipseRy * Math.sin(angle);
      
        svg.append('line')
          .attr('x1', xStart)
          .attr('y1', yStart)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#555');
      
        const { rx, ry } = getEllipseSize(tag.tag);
        svg.append('ellipse')
          .attr('cx', x)
          .attr('cy', y)
          .attr('rx', rx)
          .attr('ry', ry)
          .attr('fill', '#E0F2FE')
          .style('cursor', 'pointer')
          .on('mouseover', function () {
            d3.select(this).attr('fill', '#BFDBFE');
          })
          .on('mouseout', function () {
            d3.select(this).attr('fill', '#E0F2FE');
          })
          .on('click', () => {
            window.open(`/tags/${tag.tag}`, '_blank');
          });
      
        svg.append('text')
          .attr('x', x)
          .attr('y', y + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#111')
          .text(truncateText(tag.tag))
          .append('title')
          .text(tag.tag);
      });
      
    }, 100);

    return () => clearTimeout(timeout);
  }, [tags]);

  return (
    <div className="mfk-container">
      <h3 className="mfk-title">📊 Most Frequent Keywords</h3>
      <div className="mfk-controls">
        <div>
        <label>Project</label>
<Select
  className="mfk-select"
  options={projects.map((p) => ({
    label: p.projectName,
    value: p._id,
  }))}
  value={projects
    .map((p) => ({ label: p.projectName, value: p._id }))
    .find((opt) => opt.value === selectedProject)}
  onChange={(selected) => setSelectedProject(selected?.value || '')}
  placeholder="Select a project..."
  isSearchable
/>
        </div>
        <div>
          <label>From</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="mfk-datepicker"
            placeholderText="Start date"
          />
        </div>
        <div>
          <label>To</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="mfk-datepicker"
            placeholderText="End date"
          />
        </div>
      </div>

      <div className="mfk-chart-container">
        {isLoading ? (
          <div className="mfk-loading">Loading...</div>
        ) : error ? (
          <div className="mfk-error">{error}</div>
        ) : tags.length === 0 ? (
          <div className="mfk-empty">No tags found for this selection.</div>
        ) : (
          <svg ref={svgRef} />
        )}
      </div>
    </div>
  );
};

export default MostFrequentKeywords;
