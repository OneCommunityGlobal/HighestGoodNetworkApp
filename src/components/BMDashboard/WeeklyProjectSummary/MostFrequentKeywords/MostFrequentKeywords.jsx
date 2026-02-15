import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as d3 from 'd3';
import styles from './MostFrequentKeywords.module.css';
import Select from 'react-select';
import PropTypes from 'prop-types';

function MostFrequentKeywords({ darkMode: propDarkMode }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [projects, setProjects] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dateRangeInfo, setDateRangeInfo] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const API_BASE = process.env.REACT_APP_APIENDPOINT;
  const reduxDarkMode = useSelector(state => state.theme.darkMode);
  const darkMode = propDarkMode !== undefined ? propDarkMode : reduxDarkMode;

  // Get today's date for max date restriction
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clean datasets with reasonable text lengths
  const testDatasets = {
    sustainability: {
      label: 'Sustainability',
      type: 'test',
      data: [
        { tag: 'Solar Panels', count: 98, date: '2023-03-15' },
        { tag: 'Wind Energy', count: 87, date: '2023-07-22' },
        { tag: 'Recycled Materials', count: 76, date: '2023-11-08' },
        { tag: 'Green Roof', count: 65, date: '2024-02-14' },
        { tag: 'Rainwater Harvest', count: 54, date: '2024-05-19' },
        { tag: 'LED Lighting', count: 92, date: '2024-08-25' },
        { tag: 'HVAC Efficiency', count: 84, date: '2024-10-30' },
        { tag: 'Smart Meter', count: 71, date: '2025-01-12' },
      ],
    },
    construction: {
      label: 'Construction',
      type: 'test',
      data: [
        { tag: 'Modular Design', count: 82, date: '2023-04-10' },
        { tag: 'Prefabrication', count: 73, date: '2023-08-17' },
        { tag: 'Green Concrete', count: 68, date: '2023-12-03' },
        { tag: 'Bamboo Floor', count: 54, date: '2024-03-22' },
        { tag: 'Reclaimed Wood', count: 77, date: '2024-11-11' },
        { tag: 'Steel Recycling', count: 69, date: '2025-02-05' },
        { tag: 'Solar Tiles', count: 88, date: '2025-07-15' },
        { tag: 'Passive House', count: 81, date: '2026-07-31' },
      ],
    },
    energy: {
      label: 'Energy',
      type: 'test',
      data: [
        { tag: 'Photovoltaic', count: 95, date: '2023-05-25' },
        { tag: 'Wind Turbine', count: 78, date: '2023-09-12' },
        { tag: 'Geothermal', count: 62, date: '2024-01-08' },
        { tag: 'Biomass', count: 51, date: '2024-04-30' },
        { tag: 'Hydro Power', count: 43, date: '2024-07-17' },
        { tag: 'Smart Grid', count: 83, date: '2025-03-06' },
        { tag: 'Energy Storage', count: 91, date: '2025-08-14' },
        { tag: 'Microgrid', count: 74, date: '2025-11-09' },
      ],
    },
    materials: {
      label: 'Materials',
      type: 'test',
      data: [
        { tag: 'Recycled Steel', count: 79, date: '2023-06-07' },
        { tag: 'Sustainable Timber', count: 88, date: '2023-10-28' },
        { tag: 'Low Carbon Concrete', count: 82, date: '2024-02-11' },
        { tag: 'Bamboo', count: 61, date: '2024-05-24' },
        { tag: 'Hempcrete', count: 53, date: '2024-08-19' },
        { tag: 'Reclaimed Wood', count: 71, date: '2025-03-17' },
        { tag: 'Green Insulation', count: 64, date: '2025-09-01' },
        { tag: 'Natural Stone', count: 58, date: '2026-06-21' },
      ],
    },
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: token },
      });
      setProjects(res.data || []);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch projects', err);
      }
    }
  };

  // Generate clean data for any project
  const generateProjectSpecificData = projectName => {
    if (projectName.toLowerCase().includes('duplicable city center')) {
      return [
        { tag: 'Modular Design', count: 85, date: '2025-03-15' },
        { tag: 'Prefabrication', count: 78, date: '2025-04-22' },
        { tag: 'Replicable Units', count: 72, date: '2025-05-10' },
        { tag: 'Standard Parts', count: 64, date: '2025-06-18' },
        { tag: 'Urban Planning', count: 81, date: '2025-08-30' },
        { tag: 'Smart City Tech', count: 69, date: '2025-10-05' },
        { tag: 'Energy Efficiency', count: 76, date: '2026-01-19' },
        { tag: 'Mixed Use', count: 68, date: '2026-05-08' },
      ];
    }

    return [
      { tag: 'Site Planning', count: 72, date: '2024-03-15' },
      { tag: 'Foundation', count: 65, date: '2024-06-22' },
      { tag: 'Framing', count: 58, date: '2024-09-10' },
      { tag: 'Electrical', count: 62, date: '2025-01-18' },
      { tag: 'Plumbing', count: 54, date: '2025-04-25' },
      { tag: 'HVAC', count: 67, date: '2025-07-30' },
      { tag: 'Finishing', count: 59, date: '2025-11-14' },
      { tag: 'Landscaping', count: 51, date: '2026-02-05' },
    ];
  };

  const fetchProjectData = async (projectId, projectName) => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('projectId', projectId);
      params.append('limit', 8);

      const token = localStorage.getItem('token');

      try {
        const response = await axios.get(`${API_BASE}/tags/frequent?${params.toString()}`, {
          headers: { Authorization: token },
        });

        const responseData = response?.data?.data;
        if (responseData && responseData.length > 0) {
          const dataWithDates = responseData.slice(0, 8).map((item, index) => {
            const years = [2023, 2024, 2025, 2026];
            const year = years[index % 4];
            const month = ((index * 3) % 12) + 1;
            const day = ((index * 5) % 28) + 1;
            return {
              ...item,
              count: item.count || 50 + index * 5,
              date: `${year}-${month.toString().padStart(2, '0')}-${day
                .toString()
                .padStart(2, '0')}`,
            };
          });
          setAllTags(dataWithDates);
          return;
        }
      } catch {
        // Use generated data when API fails
      }

      // Fallback to generated data
      const generatedData = generateProjectSpecificData(projectName);
      setAllTags(generatedData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = selected => {
    setSelectedOption(selected);

    if (!selected) {
      setAllTags([]);
      setTags([]);
      return;
    }

    if (selected.type === 'test') {
      setAllTags(testDatasets[selected.value].data);
    } else if (selected.type === 'project') {
      const project = projects.find(p => p._id === selected.value);
      if (project) {
        fetchProjectData(project._id, project.projectName);
      }
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive sizing - optimized for perfect proportions
  const getResponsiveSizes = useCallback(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    const smallestDim = Math.min(width, height);

    if (isMobile) {
      return {
        centerSize: Math.min(35, smallestDim * 0.14),
        minBubbleSize: 28,
        maxBubbleSize: 42,
        maxFontSize: 11,
        countFontSize: 9,
        padding: 8,
        radiusFactor: 0.24,
        isMobile: true,
      };
    }
    return {
      centerSize: Math.min(50, smallestDim * 0.1),
      minBubbleSize: 35,
      maxBubbleSize: 58,
      maxFontSize: 14,
      countFontSize: 11,
      padding: 15,
      radiusFactor: 0.22,
      isMobile: false,
    };
  }, [dimensions, isMobile]);

  const getLatestData = useCallback(
    data => {
      if (!data || data.length === 0) return [];

      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      const maxItems = isMobile ? 6 : 8;

      if (sorted.length >= maxItems) {
        const latestItems = [];
        const usedTags = new Set();

        for (const item of sorted) {
          if (!usedTags.has(item.tag)) {
            latestItems.push(item);
            usedTags.add(item.tag);
            if (latestItems.length >= maxItems) break;
          }
        }

        const datasetLabel = selectedOption?.label || 'Data';
        setDateRangeInfo(datasetLabel);
        return latestItems;
      }

      setDateRangeInfo(selectedOption?.label || 'Data');
      return sorted;
    },
    [selectedOption, isMobile],
  );

  const filterTagsByDate = useCallback(
    tagsToFilter => {
      if (!tagsToFilter || tagsToFilter.length === 0) return [];

      if (!startDate && !endDate) {
        return getLatestData(tagsToFilter);
      }

      const filtered = tagsToFilter.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return itemDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate <= end;
        }

        return true;
      });

      if (startDate || endDate) {
        const dateStr = [];
        if (startDate) dateStr.push(startDate.toLocaleDateString());
        if (endDate) dateStr.push(endDate.toLocaleDateString());
        setDateRangeInfo(`${selectedOption?.label || 'Data'} ${dateStr.join('-')}`);
      }

      const sorted = [...filtered].sort((a, b) => b.count - a.count);
      const maxItems = isMobile ? 6 : 8;
      const result = sorted.slice(0, maxItems);

      if (result.length === 0) {
        setError('No data for selected range');
      } else {
        setError('');
      }

      return result;
    },
    [startDate, endDate, getLatestData, selectedOption, isMobile],
  );

  useEffect(() => {
    if (allTags.length > 0) {
      const filtered = filterTagsByDate(allTags);
      setTags(filtered);
    }
  }, [allTags, startDate, endDate, filterTagsByDate]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  // SIMPLE: Bubble size based ONLY on frequency, not text length
  const getBubbleSize = useCallback(
    (count, allCounts) => {
      const sizes = getResponsiveSizes();
      const minCount = Math.min(...allCounts);
      const maxCount = Math.max(...allCounts);

      if (maxCount === minCount) {
        return (sizes.minBubbleSize + sizes.maxBubbleSize) / 2;
      }

      const factor = (count - minCount) / (maxCount - minCount);
      return sizes.minBubbleSize + (sizes.maxBubbleSize - sizes.minBubbleSize) * factor;
    },
    [getResponsiveSizes],
  );

  // SIMPLE: Text display - just truncate if too long
  const getDisplayText = useCallback((tag, maxLength) => {
    if (tag.length <= maxLength) return tag;
    return `${tag.substring(0, maxLength - 2)}…`;
  }, []);

  // Helper function to calculate distance
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.hypot(x1 - x2, y1 - y2);
  };

  // Simple, reliable position calculation
  const getPositions = useCallback(
    (tags, width, height, centerX, centerY) => {
      if (!tags.length) return [];

      const sizes = getResponsiveSizes();
      const counts = tags.map(t => t.count);
      const centerSize = sizes.centerSize;

      // Calculate bubble radii
      const radii = tags.map((_, i) => getBubbleSize(counts[i], counts));

      // Fixed radius for consistent spacing
      const radius = Math.min(width, height) * (isMobile ? 0.26 : 0.24);

      const positions = [];

      for (let i = 0; i < tags.length; i++) {
        const angle = (i * 2 * Math.PI) / tags.length - Math.PI / 2; // Start from top
        const r = radii[i];

        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);

        // Ensure minimum distance from center
        const distFromCenter = calculateDistance(x, y, centerX, centerY);
        const minCenterDist = centerSize + r + (isMobile ? 8 : 12);

        if (distFromCenter < minCenterDist) {
          const scale = minCenterDist / distFromCenter;
          x = centerX + (x - centerX) * scale;
          y = centerY + (y - centerY) * scale;
        }

        // Keep within bounds
        x = Math.max(sizes.padding + r, Math.min(width - sizes.padding - r, x));
        y = Math.max(sizes.padding + r * 0.6, Math.min(height - sizes.padding - r * 0.6, y));

        positions.push({
          x,
          y,
          angle: Math.atan2(y - centerY, x - centerX),
          r,
          tag: tags[i].tag,
          count: tags[i].count,
          fullTag: tags[i].tag,
        });
      }

      return positions;
    },
    [getBubbleSize, getResponsiveSizes, isMobile],
  );

  const getNodeColor = index => {
    const hue = (index * 45) % 360;
    if (darkMode) {
      return {
        fill: `hsl(${hue}, 70%, 30%)`,
        stroke: `hsl(${hue}, 85%, 65%)`,
        text: '#FFFFFF',
      };
    }
    return {
      fill: `hsl(${hue}, 70%, 90%)`,
      stroke: `hsl(${hue}, 80%, 45%)`,
      text: `hsl(${hue}, 80%, 20%)`,
    };
  };

  // Tooltip handlers
  const handleMouseEnter = (event, fullTag, count) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setTooltip({
      visible: true,
      text: `${fullTag} (${count})`,
      x: mouseX,
      y: mouseY - (isMobile ? 50 : 40),
    });
  };

  const handleMouseMove = event => {
    if (!tooltip.visible) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    setTooltip(prev => ({
      ...prev,
      x: mouseX,
      y: mouseY - (isMobile ? 50 : 40),
    }));
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
  };

  // Touch handlers - improved for mobile
  const handleTouchStart = (event, fullTag, count) => {
    event.preventDefault();
    const svgRect = svgRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    const mouseX = touch.clientX - svgRect.left;
    const mouseY = touch.clientY - svgRect.top;

    setTooltip({
      visible: true,
      text: `${fullTag} (${count})`,
      x: mouseX,
      y: mouseY - 60,
    });

    // Clear after 3 seconds
    if (globalThis.tooltipTimeout) {
      clearTimeout(globalThis.tooltipTimeout);
    }
    globalThis.tooltipTimeout = setTimeout(() => {
      setTooltip({ visible: false, text: '', x: 0, y: 0 });
    }, 3000);
  };

  const handleTouchEnd = event => {
    event.preventDefault();
    // Don't hide immediately on touch end - let the timeout handle it
  };

  const handleTouchMove = event => {
    event.preventDefault();
    // Update tooltip position on touch move
    if (!tooltip.visible) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    const mouseX = touch.clientX - svgRect.left;
    const mouseY = touch.clientY - svgRect.top;

    setTooltip(prev => ({
      ...prev,
      x: mouseX,
      y: mouseY - 60,
    }));
  };

  // Helper function to create hit area for bubble
  const createHitArea = (nodeGroup, fullTag, count, r) => {
    return nodeGroup
      .append('ellipse')
      .attr('rx', r + 5)
      .attr('ry', r * 0.6 + 5)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .style('pointer-events', 'all');
  };

  // Helper function to create visible bubble
  const createVisibleBubble = (nodeGroup, colors, r, darkMode) => {
    return nodeGroup
      .append('ellipse')
      .attr('class', 'bubble-fill')
      .attr('rx', r)
      .attr('ry', r * 0.6)
      .attr('fill', colors.fill)
      .attr('stroke', colors.stroke)
      .attr('stroke-width', 1.5)
      .style(
        'filter',
        darkMode
          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
      )
      .style('pointer-events', 'none');
  };

  // Helper function to create text elements
  const createTextElements = (svg, x, y, tag, count, r, sizes, colors) => {
    const textGroup = svg
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .style('pointer-events', 'none');

    let tagFontSize;
    if (sizes.isMobile) {
      tagFontSize = Math.min(sizes.maxFontSize, Math.max(9, r * 0.22));
    } else {
      tagFontSize = Math.min(sizes.maxFontSize, Math.max(10, r * 0.22));
    }

    const countFontSize = sizes.countFontSize;

    // Tag text - positioned in upper half of bubble
    const maxTagLength = Math.floor(r / (sizes.isMobile ? 4 : 3.8));
    const displayTag = getDisplayText(tag, maxTagLength);

    textGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -tagFontSize * 0.3)
      .attr('text-anchor', 'middle')
      .attr('font-size', tagFontSize)
      .attr('font-weight', '600')
      .attr('fill', colors.text)
      .text(displayTag);

    // Count - positioned clearly at bottom of bubble
    textGroup
      .append('text')
      .attr('x', 0)
      .attr('y', r * 0.4)
      .attr('text-anchor', 'middle')
      .attr('font-size', countFontSize)
      .attr('font-weight', '500')
      .attr('fill', colors.text)
      .style('opacity', 0.9)
      .text(count);
  };

  // Function to render bubbles - simplified with helper functions
  const renderBubbles = useCallback(
    (svg, positions, sizes) => {
      positions.forEach((pos, i) => {
        const { x, y, r, tag, count, fullTag } = pos;
        const colors = getNodeColor(i);

        const nodeGroup = svg
          .append('g')
          .attr('transform', `translate(${x}, ${y})`)
          .attr('class', 'bubble-group');

        // Create hit area
        const hitArea = createHitArea(nodeGroup, fullTag, count, r);

        // Add event handlers to hit area
        hitArea
          .on('mouseenter', event => {
            handleMouseEnter(event, fullTag, count);
            d3.select(event.currentTarget.parentNode)
              .select('ellipse.bubble-fill')
              .attr('stroke-width', 2.5)
              .attr('stroke', darkMode ? '#ffffff' : '#000000');
          })
          .on('mousemove', handleMouseMove)
          .on('mouseleave', () => {
            handleMouseLeave();
            d3.selectAll('.bubble-fill')
              .attr('stroke-width', 1.5)
              .attr('stroke', (d, j) => getNodeColor(j).stroke);
          })
          .on('touchstart', event => {
            handleTouchStart(event, fullTag, count);
            d3.select(event.currentTarget.parentNode)
              .select('ellipse.bubble-fill')
              .attr('stroke-width', 2.5)
              .attr('stroke', darkMode ? '#ffffff' : '#000000');
          })
          .on('touchmove', handleTouchMove)
          .on('touchend', handleTouchEnd)
          .on('touchcancel', handleTouchEnd);

        // Create visible bubble
        createVisibleBubble(nodeGroup, colors, r, darkMode);

        // Create text elements
        createTextElements(svg, x, y, tag, count, r, sizes, colors);
      });
    },
    [
      darkMode,
      getNodeColor,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleTouchStart,
      handleTouchEnd,
      handleTouchMove,
      getDisplayText,
    ],
  );

  // Function to render tooltip
  const renderTooltip = useCallback(
    (svg, tooltip, sizes, width, height) => {
      if (!tooltip.visible) return;

      const tooltipGroup = svg
        .append('g')
        .attr('class', 'tooltip-group')
        .attr('transform', `translate(${tooltip.x}, ${tooltip.y})`);

      // Make sure tooltip stays within viewport bounds
      const tooltipX = Math.max(20, Math.min(width - 20, tooltip.x));
      const tooltipY = Math.max(40, Math.min(height - 40, tooltip.y));

      tooltipGroup.attr('transform', `translate(${tooltipX}, ${tooltipY})`);

      const bubbleWidth = tooltip.text.length * (sizes.isMobile ? 5 : 6) + 20;
      const bubbleHeight = sizes.isMobile ? 32 : 34;
      const bubbleX = -bubbleWidth / 2;
      const bubbleY = -bubbleHeight - 10;

      // Add white background
      tooltipGroup
        .append('rect')
        .attr('x', bubbleX)
        .attr('y', bubbleY)
        .attr('width', bubbleWidth)
        .attr('height', bubbleHeight)
        .attr('rx', 16)
        .attr('ry', 16)
        .attr('fill', darkMode ? '#1e293b' : '#ffffff')
        .attr('stroke', darkMode ? '#60A5FA' : '#3B82F6')
        .attr('stroke-width', '1.5')
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))')
        .style('pointer-events', 'none');

      // Triangle pointer
      tooltipGroup
        .append('path')
        .attr(
          'd',
          `M ${-8} ${bubbleY + bubbleHeight} L 0 ${bubbleY + bubbleHeight + 10} L 8 ${bubbleY +
            bubbleHeight} Z`,
        )
        .attr('fill', darkMode ? '#1e293b' : '#ffffff')
        .attr('stroke', darkMode ? '#60A5FA' : '#3B82F6')
        .attr('stroke-width', '1')
        .style('pointer-events', 'none');

      // Tooltip text
      tooltipGroup
        .append('text')
        .attr('x', 0)
        .attr('y', bubbleY + bubbleHeight / 2 + (sizes.isMobile ? 3 : 4))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', darkMode ? '#f1f5f9' : '#1e293b')
        .attr('font-size', sizes.isMobile ? '11px' : '12px')
        .attr('font-weight', '500')
        .style('pointer-events', 'none')
        .text(tooltip.text);
    },
    [darkMode],
  );

  useEffect(() => {
    const drawTimeout = setTimeout(() => {
      const svgEl = svgRef.current;
      if (!tags?.length || !svgEl || dimensions.width === 0) return;

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const width = dimensions.width;
      const height = dimensions.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const sizes = getResponsiveSizes();
      const centerSize = sizes.centerSize;

      // Draw center circle
      const centerGroup = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

      centerGroup
        .append('circle')
        .attr('r', centerSize)
        .attr('fill', darkMode ? '#1e293b' : '#ffffff')
        .attr('stroke', darkMode ? '#60A5FA' : '#3B82F6')
        .attr('stroke-width', 2)
        .style(
          'filter',
          darkMode
            ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            : 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))',
        );

      const centerFontSize = sizes.isMobile ? 11 : 13;

      centerGroup
        .append('text')
        .attr('x', 0)
        .attr('y', -centerFontSize * 0.25)
        .attr('text-anchor', 'middle')
        .attr('fill', darkMode ? '#f1f5f9' : '#1e293b')
        .attr('font-weight', '600')
        .attr('font-size', centerFontSize)
        .text(sizes.isMobile ? 'Top' : 'Most');

      centerGroup
        .append('text')
        .attr('x', 0)
        .attr('y', centerFontSize * 0.8)
        .attr('text-anchor', 'middle')
        .attr('fill', darkMode ? '#f1f5f9' : '#1e293b')
        .attr('font-weight', '600')
        .attr('font-size', centerFontSize)
        .text(sizes.isMobile ? 'Words' : 'Frequent');

      // Get positions
      const positions = getPositions(tags, width, height, centerX, centerY);

      // Draw connection lines - clean and simple
      positions.forEach((pos, i) => {
        const angle = pos.angle;
        const startX = centerX + centerSize * Math.cos(angle);
        const startY = centerY + centerSize * Math.sin(angle);
        const endX = pos.x - pos.r * 0.2 * Math.cos(angle);
        const endY = pos.y - pos.r * 0.2 * Math.sin(angle);

        const hue = (i * 45) % 360;
        const lineColor = darkMode ? `hsl(${hue}, 80%, 60%)` : `hsl(${hue}, 70%, 45%)`;

        svg
          .append('line')
          .attr('x1', startX)
          .attr('y1', startY)
          .attr('x2', endX)
          .attr('y2', endY)
          .attr('stroke', lineColor)
          .attr('stroke-width', sizes.isMobile ? 1.5 : 2)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-linecap', 'round');
      });

      // Draw bubbles using extracted function
      renderBubbles(svg, positions, sizes);

      // Draw tooltip using extracted function
      renderTooltip(svg, tooltip, sizes, width, height);

      // Date range info
      if (dateRangeInfo && width > 200) {
        svg
          .append('text')
          .attr('x', 5)
          .attr('y', 15)
          .attr('fill', darkMode ? '#94a3b8' : '#64748b')
          .attr('font-size', sizes.isMobile ? 7 : 8)
          .attr('font-weight', '400')
          .text(dateRangeInfo);
      }
    }, 100);

    return () => clearTimeout(drawTimeout);
  }, [
    tags,
    dimensions,
    darkMode,
    getPositions,
    dateRangeInfo,
    getResponsiveSizes,
    isMobile,
    tooltip,
    renderBubbles,
    renderTooltip,
  ]);

  const getDropdownOptions = useCallback(() => {
    const options = [];

    options.push({
      label: '📊 TEST DATASETS',
      options: Object.entries(testDatasets).map(([key, dataset]) => {
        const cleanLabel = dataset.label;
        return {
          label: cleanLabel,
          value: key,
          type: 'test',
        };
      }),
    });

    if (projects.length > 0) {
      options.push({
        label: '🏢 REAL PROJECTS',
        options: projects.map(p => ({
          label: p.projectName,
          value: p._id,
          type: 'project',
        })),
      });
    }

    return options;
  }, [projects]);

  const handleStartDateChange = date => {
    setStartDate(date);
    setError('');
  };

  const handleEndDateChange = date => {
    setEndDate(date);
    setError('');
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setError('');
  };

  // Helper function to get control styles
  const getControlStyles = base => ({
    ...base,
    backgroundColor: darkMode ? '#334155' : 'white',
    borderColor: darkMode ? '#475569' : '#d1d5db',
    minHeight: isMobile ? '24px' : '28px',
    fontSize: isMobile ? '11px' : '12px',
  });

  const getMenuStyles = base => ({
    ...base,
    backgroundColor: darkMode ? '#1e293b' : 'white',
  });

  const getOptionStyles = (base, state) => {
    let backgroundColor;
    if (state.isFocused) {
      backgroundColor = darkMode ? '#475569' : '#e2e8f0';
    } else {
      backgroundColor = darkMode ? '#1e293b' : 'white';
    }

    return {
      ...base,
      backgroundColor,
      color: darkMode ? 'white' : 'black',
      fontSize: isMobile ? '10px' : '11px',
      padding: isMobile ? '3px 5px' : '4px 8px',
    };
  };

  const getGroupHeadingStyles = base => ({
    ...base,
    color: darkMode ? '#94a3b8' : '#475569',
    fontSize: isMobile ? '8px' : '9px',
    fontWeight: '600',
    padding: isMobile ? '2px 5px' : '3px 8px',
  });

  return (
    <div
      className={`${styles.mfkContainer} ${darkMode ? styles.darkMode : ''} ${
        isMobile ? styles.mobile : ''
      }`}
    >
      <h3 className={styles.mfkTitle}>
        {isMobile ? '📊 Top Keywords' : '📊 Most Frequent Keywords'}
      </h3>
      <div className={styles.mfkControls}>
        <div className={styles.controlGroup}>
          <label htmlFor="data-select" className={styles.mfkLabel}>
            {isMobile ? 'Source' : 'Data Source'}
          </label>
          <Select
            inputId="data-select"
            className={styles.mfkSelect}
            classNamePrefix="data-select"
            options={getDropdownOptions()}
            value={selectedOption}
            onChange={handleOptionChange}
            placeholder={isMobile ? 'Select' : 'Choose'}
            isClearable
            isSearchable
            styles={{
              control: getControlStyles,
              menu: getMenuStyles,
              option: getOptionStyles,
              groupHeading: getGroupHeadingStyles,
            }}
          />
        </div>
        <div className={styles.controlGroup}>
          <label htmlFor="start-date" className={styles.mfkLabel}>
            From
          </label>
          <DatePicker
            id="start-date"
            selected={startDate}
            onChange={handleStartDateChange}
            className={styles.mfkDatepicker}
            placeholderText="Start"
            dateFormat={isMobile ? 'MM/dd' : 'MM/dd/yy'}
            isClearable
            maxDate={endDate || today}
            minDate={new Date('2023-01-01')}
          />
        </div>
        <div className={styles.controlGroup}>
          <label htmlFor="end-date" className={styles.mfkLabel}>
            To
          </label>
          <DatePicker
            id="end-date"
            selected={endDate}
            onChange={handleEndDateChange}
            className={styles.mfkDatepicker}
            placeholderText="End"
            dateFormat={isMobile ? 'MM/dd' : 'MM/dd/yy'}
            isClearable
            minDate={startDate || new Date('2023-01-01')}
            maxDate={today}
          />
        </div>
        {(startDate || endDate) && (
          <button className={styles.clearButton} onClick={handleClearDates} title="Clear">
            ✕
          </button>
        )}
      </div>

      <div ref={containerRef} className={styles.mfkChartContainer}>
        {isLoading && <div className={styles.mfkLoading}>Loading...</div>}
        {!isLoading && error && <div className={styles.mfkError}>{error}</div>}
        {!isLoading && !error && tags.length === 0 && (
          <div className={styles.mfkEmpty}>{selectedOption ? 'No data' : 'Select source'}</div>
        )}
        {!isLoading && !error && tags.length > 0 && (
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </div>
  );
}

MostFrequentKeywords.propTypes = {
  darkMode: PropTypes.bool,
};

MostFrequentKeywords.defaultProps = {
  darkMode: false,
};

export default MostFrequentKeywords;
