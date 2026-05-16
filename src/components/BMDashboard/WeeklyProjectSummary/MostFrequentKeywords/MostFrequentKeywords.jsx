import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as d3 from 'd3';
import styles from './MostFrequentKeywords.module.css';
import Select, { components as selectComponents } from 'react-select';
import PropTypes from 'prop-types';

const formatCalendarMonth = date =>
  date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const DropdownIndicator = props => (
  <selectComponents.DropdownIndicator {...props}>
    <span className={styles.mfkChevron}>▾</span>
  </selectComponents.DropdownIndicator>
);

// ── Keyword → source category mapping ────────────────────────────────────────
const KEYWORD_SOURCE_MAP = {
  // Risk
  'Solar Panels': 'energy',
  'Wind Energy': 'energy',
  'Recycled Materials': 'materials',
  'Green Roof': 'sustainability',
  'Rainwater Harvest': 'sustainability',
  'LED Lighting': 'energy',
  'HVAC Efficiency': 'energy',
  'Smart Meter': 'technology',
  'Modular Design': 'design',
  Prefabrication: 'construction',
  'Green Concrete': 'materials',
  'Bamboo Floor': 'materials',
  'Reclaimed Wood': 'materials',
  'Steel Recycling': 'materials',
  'Solar Tiles': 'energy',
  'Passive House': 'design',
  Photovoltaic: 'energy',
  'Wind Turbine': 'energy',
  Geothermal: 'energy',
  Biomass: 'energy',
  'Hydro Power': 'energy',
  'Smart Grid': 'technology',
  'Energy Storage': 'technology',
  Microgrid: 'technology',
  'Recycled Steel': 'materials',
  'Sustainable Timber': 'materials',
  'Low Carbon Concrete': 'materials',
  Bamboo: 'materials',
  Hempcrete: 'materials',
  'Green Insulation': 'materials',
  'Natural Stone': 'materials',
  'Replicable Units': 'design',
  'Standard Parts': 'construction',
  'Urban Planning': 'stakeholder',
  'Smart City Tech': 'technology',
  'Energy Efficiency': 'energy',
  'Mixed Use': 'design',
  'Site Planning': 'construction',
  Foundation: 'construction',
  Framing: 'construction',
  Electrical: 'risk',
  Plumbing: 'risk',
  HVAC: 'budget',
  Finishing: 'budget',
  Landscaping: 'delay',
};

// Source category config: label, colour, icon, description
const SOURCE_CATEGORIES = {
  risk: {
    label: 'Risk',
    color: '#ef4444',
    bg: '#fef2f2',
    darkBg: '#450a0a',
    icon: '⚠️',
    description: 'Identified project risk factor',
  },
  delay: {
    label: 'Delay',
    color: '#f97316',
    bg: '#fff7ed',
    darkBg: '#431407',
    icon: '⏱️',
    description: 'Potential schedule delay indicator',
  },
  budget: {
    label: 'Budget',
    color: '#eab308',
    bg: '#fefce8',
    darkBg: '#422006',
    icon: '💰',
    description: 'Cost & budget-related keyword',
  },
  stakeholder: {
    label: 'Stakeholder',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    darkBg: '#2e1065',
    icon: '👥',
    description: 'Stakeholder or community concern',
  },
  energy: {
    label: 'Energy',
    color: '#06b6d4',
    bg: '#ecfeff',
    darkBg: '#083344',
    icon: '⚡',
    description: 'Energy system or resource',
  },
  materials: {
    label: 'Materials',
    color: '#10b981',
    bg: '#ecfdf5',
    darkBg: '#052e16',
    icon: '🪨',
    description: 'Building material or resource',
  },
  technology: {
    label: 'Technology',
    color: '#3b82f6',
    bg: '#eff6ff',
    darkBg: '#172554',
    icon: '🔧',
    description: 'Smart or digital technology',
  },
  sustainability: {
    label: 'Sustainability',
    color: '#22c55e',
    bg: '#f0fdf4',
    darkBg: '#052e16',
    icon: '🌿',
    description: 'Sustainability & green practice',
  },
  construction: {
    label: 'Construction',
    color: '#a16207',
    bg: '#fefce8',
    darkBg: '#422006',
    icon: '🏗️',
    description: 'Core construction activity',
  },
  design: {
    label: 'Design',
    color: '#ec4899',
    bg: '#fdf2f8',
    darkBg: '#4a044e',
    icon: '📐',
    description: 'Architectural or design concept',
  },
  general: {
    label: 'General',
    color: '#64748b',
    bg: '#f8fafc',
    darkBg: '#0f172a',
    icon: '📌',
    description: 'General project keyword',
  },
};

const getKeywordSource = tag => {
  const key = Object.keys(KEYWORD_SOURCE_MAP).find(k => k.toLowerCase() === tag.toLowerCase());
  return key ? KEYWORD_SOURCE_MAP[key] : 'general';
};

// ─────────────────────────────────────────────────────────────────────────────

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
  const [isMobile, setIsMobile] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    source: null,
    count: 0,
    fullTag: '',
  });
  const API_BASE = process.env.REACT_APP_APIENDPOINT;
  const reduxDarkMode = useSelector(state => state.theme.darkMode);
  const darkMode = propDarkMode !== undefined ? propDarkMode : reduxDarkMode;

  const palette = darkMode
    ? {
        controlBg: '#243447',
        controlBorder: '#475569',
        controlBorderHover: '#64748b',
        text: '#f8fafc',
        mutedText: '#cbd5e1',
        indicator: '#e2e8f0',
        menuBg: '#243447',
        optionBg: '#243447',
        optionHoverBg: '#31465f',
        optionSelectedBg: '#3b82f6',
        groupHeading: '#94a3b8',
        shadow: '0 10px 24px rgba(2, 6, 23, 0.45)',
      }
    : {
        controlBg: '#ffffff',
        controlBorder: '#d1d5db',
        controlBorderHover: '#3b82f6',
        text: '#0f172a',
        mutedText: '#64748b',
        indicator: '#475569',
        menuBg: '#ffffff',
        optionBg: '#ffffff',
        optionHoverBg: '#e2e8f0',
        optionSelectedBg: '#dbeafe',
        groupHeading: '#475569',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const generateProjectSpecificData = projectName => {
    const isDuplicableCityCenter = projectName.toLowerCase().includes('duplicable city center');
    if (isDuplicableCityCenter) {
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
        // fallthrough
      }
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
      if (project) fetchProjectData(project._id, project.projectName);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        return latestItems;
      }
      return sorted;
    },
    [isMobile],
  );

  const filterTagsByDate = useCallback(
    tagsToFilter => {
      if (!tagsToFilter || tagsToFilter.length === 0) return [];
      if (!startDate && !endDate) return getLatestData(tagsToFilter);
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
      const sorted = [...filtered].sort((a, b) => b.count - a.count);
      const maxItems = isMobile ? 6 : 8;
      const result = sorted.slice(0, maxItems);
      if (result.length === 0) setError('No data for selected range');
      else setError('');
      return result;
    },
    [startDate, endDate, getLatestData, isMobile],
  );

  useEffect(() => {
    if (allTags.length > 0) setTags(filterTagsByDate(allTags));
  }, [allTags, startDate, endDate, filterTagsByDate]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current)
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const getBubbleSize = useCallback(
    (count, allCounts) => {
      const sizes = getResponsiveSizes();
      const minCount = Math.min(...allCounts);
      const maxCount = Math.max(...allCounts);
      if (maxCount === minCount) return (sizes.minBubbleSize + sizes.maxBubbleSize) / 2;
      const factor = (count - minCount) / (maxCount - minCount);
      return sizes.minBubbleSize + (sizes.maxBubbleSize - sizes.minBubbleSize) * factor;
    },
    [getResponsiveSizes],
  );

  const getDisplayText = useCallback((tag, maxLength) => {
    if (tag.length <= maxLength) return tag;
    return `${tag.substring(0, maxLength - 2)}…`;
  }, []);

  const calculateDistance = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  const getPositions = useCallback(
    (tags, width, height, centerX, centerY) => {
      if (!tags.length) return [];
      const sizes = getResponsiveSizes();
      const counts = tags.map(t => t.count);
      const centerSize = sizes.centerSize;
      const radii = tags.map((_, i) => getBubbleSize(counts[i], counts));
      const maxBubbleRadius = Math.max(...radii, sizes.minBubbleSize);
      const horizontalPadding = sizes.padding + maxBubbleRadius + 8;
      const topPadding = sizes.padding + maxBubbleRadius * 0.75 + 12;
      const bottomPadding =
        sizes.padding + maxBubbleRadius * 1.15 + sizes.countFontSize + centerSize * 0.5 + 28;
      const availableOrbitX = Math.max(0, width / 2 - horizontalPadding);
      const availableOrbitY = Math.max(
        0,
        Math.min(centerY - topPadding, height - bottomPadding - centerY),
      );
      const idealRadius = Math.min(
        Math.min(width, height) * (isMobile ? 0.2 : 0.17),
        availableOrbitX,
        availableOrbitY,
      );
      const minRequiredRadius = centerSize + maxBubbleRadius + (isMobile ? 6 : 10);
      const radius =
        idealRadius > 0
          ? Math.max(
              Math.min(Math.max(idealRadius, minRequiredRadius), availableOrbitX, availableOrbitY),
              0,
            )
          : 0;
      const positions = [];
      for (let i = 0; i < tags.length; i++) {
        const angle = (i * 2 * Math.PI) / tags.length - Math.PI / 2;
        const r = radii[i];
        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);
        const distFromCenter = calculateDistance(x, y, centerX, centerY);
        const minCenterDist = centerSize + r + (isMobile ? 8 : 12);
        if (distFromCenter < minCenterDist && distFromCenter > 0) {
          const scale = minCenterDist / distFromCenter;
          x = centerX + (x - centerX) * scale;
          y = centerY + (y - centerY) * scale;
        }
        x = Math.max(sizes.padding + r, Math.min(width - sizes.padding - r, x));
        y = Math.max(topPadding, Math.min(height - bottomPadding, y));
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

  // ── Node color: source-category tinted ────────────────────────────────────
  const getNodeColor = useCallback(
    (index, tag) => {
      const sourceKey = getKeywordSource(tag || '');
      const cat = SOURCE_CATEGORIES[sourceKey] || SOURCE_CATEGORIES.general;
      if (darkMode) {
        return {
          fill: cat.darkBg,
          stroke: cat.color,
          text: '#FFFFFF',
          accentColor: cat.color,
          sourceKey,
        };
      }
      return {
        fill: cat.bg,
        stroke: cat.color,
        text: '#1e293b',
        accentColor: cat.color,
        sourceKey,
      };
    },
    [darkMode],
  );

  // ── Tooltip state (rich) ───────────────────────────────────────────────────
  const handleMouseEnter = (event, fullTag, count) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    const sourceKey = getKeywordSource(fullTag);
    setTooltip({
      visible: true,
      text: fullTag,
      x: mouseX,
      y: mouseY - (isMobile ? 50 : 40),
      source: sourceKey,
      count,
      fullTag,
    });
  };

  const handleMouseMove = event => {
    if (!tooltip.visible) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    setTooltip(prev => ({ ...prev, x: mouseX, y: mouseY - (isMobile ? 50 : 40) }));
  };

  const handleMouseLeave = () =>
    setTooltip({ visible: false, text: '', x: 0, y: 0, source: null, count: 0, fullTag: '' });

  const handleTouchStart = (event, fullTag, count) => {
    event.preventDefault();
    const svgRect = svgRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    const sourceKey = getKeywordSource(fullTag);
    setTooltip({
      visible: true,
      text: fullTag,
      x: touch.clientX - svgRect.left,
      y: touch.clientY - svgRect.top - 60,
      source: sourceKey,
      count,
      fullTag,
    });
    if (globalThis.tooltipTimeout) clearTimeout(globalThis.tooltipTimeout);
    globalThis.tooltipTimeout = setTimeout(
      () =>
        setTooltip({ visible: false, text: '', x: 0, y: 0, source: null, count: 0, fullTag: '' }),
      3000,
    );
  };

  const handleTouchEnd = event => event.preventDefault();

  const handleTouchMove = event => {
    event.preventDefault();
    if (!tooltip.visible) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    setTooltip(prev => ({
      ...prev,
      x: touch.clientX - svgRect.left,
      y: touch.clientY - svgRect.top - 60,
    }));
  };

  // ── Bubble rendering helpers ───────────────────────────────────────────────
  const createHitArea = (nodeGroup, r) =>
    nodeGroup
      .append('ellipse')
      .attr('rx', r + 5)
      .attr('ry', r * 0.6 + 5)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .style('pointer-events', 'all');

  const createVisibleBubble = (nodeGroup, colors, r) =>
    nodeGroup
      .append('ellipse')
      .attr('class', 'bubble-fill')
      .attr('rx', r)
      .attr('ry', r * 0.6)
      .attr('fill', colors.fill)
      .attr('stroke', colors.stroke)
      .attr('stroke-width', 2)
      .style(
        'filter',
        darkMode
          ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))',
      )
      .style('pointer-events', 'none');

  // ── Draw frequency weight bar inside bubble ───────────────────────────────
  const createWeightBar = (svg, x, y, count, allCounts, r, colors) => {
    const minCount = Math.min(...allCounts);
    const maxCount = Math.max(...allCounts);
    const ratio = maxCount === minCount ? 0.5 : (count - minCount) / (maxCount - minCount);

    const barW = r * 1.1;
    const barH = r * 0.095;
    const barY = r * 0.28;
    const fillW = barW * ratio;

    const g = svg
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .style('pointer-events', 'none');

    // Track
    g.append('rect')
      .attr('x', -barW / 2)
      .attr('y', barY)
      .attr('width', barW)
      .attr('height', barH)
      .attr('rx', barH / 2)
      .attr('fill', darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)');

    // Fill
    g.append('rect')
      .attr('x', -barW / 2)
      .attr('y', barY)
      .attr('width', fillW)
      .attr('height', barH)
      .attr('rx', barH / 2)
      .attr('fill', colors.accentColor)
      .style('opacity', 0.85);

    // Percentage label (only if r is large enough)
    if (r >= 38) {
      g.append('text')
        .attr('x', barW / 2 + 3)
        .attr('y', barY + barH)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 7)
        .attr('fill', colors.accentColor)
        .style('opacity', 0.9)
        .text(`${Math.round(ratio * 100)}%`);
    }
  };

  const createTextElements = (svg, x, y, tag, count, r, sizes, colors) => {
    const textGroup = svg
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .style('pointer-events', 'none');
    const tagFontSize = sizes.isMobile
      ? Math.min(sizes.maxFontSize, Math.max(9, r * 0.22))
      : Math.min(sizes.maxFontSize, Math.max(10, r * 0.22));
    const countFontSize = sizes.countFontSize;
    const maxTagLength = Math.floor(r / (sizes.isMobile ? 4 : 3.8));
    const displayTag = getDisplayText(tag, maxTagLength);

    // Keyword label
    textGroup
      .append('text')
      .attr('x', 0)
      .attr('y', -tagFontSize * 0.55)
      .attr('text-anchor', 'middle')
      .attr('font-size', tagFontSize)
      .attr('font-weight', '700')
      .attr('fill', colors.text)
      .text(displayTag);

    // Count — bold, accent colored
    textGroup
      .append('text')
      .attr('x', 0)
      .attr('y', r * 0.14)
      .attr('text-anchor', 'middle')
      .attr('font-size', countFontSize + 1)
      .attr('font-weight', '800')
      .attr('fill', colors.accentColor)
      .style('opacity', 1)
      .text(`×${count}`);
  };

  const addBubbleEventHandlers = (hitArea, fullTag, count, colors) => {
    hitArea
      .on('mouseenter', event => {
        handleMouseEnter(event, fullTag, count);
        d3.select(event.currentTarget.parentNode)
          .select('ellipse.bubble-fill')
          .attr('stroke-width', 3)
          .attr('stroke', colors.accentColor);
      })
      .on('mousemove', handleMouseMove)
      .on('mouseleave', () => {
        handleMouseLeave();
        d3.selectAll('.bubble-fill')
          .attr('stroke-width', 2)
          .each(function(d, j) {
            // restore — we don't have easy access to per-node colour here so just keep stroke
          });
      })
      .on('touchstart', event => {
        handleTouchStart(event, fullTag, count);
      })
      .on('touchmove', handleTouchMove)
      .on('touchend', handleTouchEnd)
      .on('touchcancel', handleTouchEnd);
  };

  const renderSingleBubble = (svg, pos, i, sizes, allCounts) => {
    const { x, y, r, tag, count, fullTag } = pos;
    const colors = getNodeColor(i, tag);
    const nodeGroup = svg
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .attr('class', 'bubble-group');
    const hitArea = createHitArea(nodeGroup, r);
    addBubbleEventHandlers(hitArea, fullTag, count, colors);
    createVisibleBubble(nodeGroup, colors, r);
    createWeightBar(svg, x, y, count, allCounts, r, colors);
    createTextElements(svg, x, y, tag, count, r, sizes, colors);
  };

  const renderBubbles = useCallback(
    (svg, positions, sizes) => {
      const allCounts = positions.map(p => p.count);
      positions.forEach((pos, i) => renderSingleBubble(svg, pos, i, sizes, allCounts));
    },
    [getNodeColor, darkMode],
  );

  // ── Rich tooltip with source category ─────────────────────────────────────
  const renderTooltip = useCallback(
    (svg, tooltip, sizes, width, height) => {
      if (!tooltip.visible) return;

      const cat = SOURCE_CATEGORIES[tooltip.source] || SOURCE_CATEGORIES.general;
      const tooltipX = Math.max(80, Math.min(width - 80, tooltip.x));
      const tooltipY = Math.max(80, Math.min(height - 80, tooltip.y));

      const ttW = sizes.isMobile ? 160 : 190;
      const ttH = sizes.isMobile ? 74 : 82;
      const bx = -ttW / 2;
      const by = -ttH - 14;
      const r = 10;

      const ttGroup = svg
        .append('g')
        .attr('class', 'tooltip-group')
        .attr('transform', `translate(${tooltipX}, ${tooltipY})`);

      // Card background
      ttGroup
        .append('rect')
        .attr('x', bx)
        .attr('y', by)
        .attr('width', ttW)
        .attr('height', ttH)
        .attr('rx', r)
        .attr('ry', r)
        .attr('fill', darkMode ? '#0f172a' : '#ffffff')
        .attr('stroke', cat.color)
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0 6px 16px rgba(0,0,0,0.22))')
        .style('pointer-events', 'none');

      // Coloured top accent strip
      ttGroup
        .append('rect')
        .attr('x', bx)
        .attr('y', by)
        .attr('width', ttW)
        .attr('height', 6)
        .attr('rx', r)
        .attr('ry', r)
        .attr('fill', cat.color)
        .style('pointer-events', 'none');

      // Triangle
      ttGroup
        .append('path')
        .attr('d', `M${-8},${by + ttH} L0,${by + ttH + 12} L8,${by + ttH} Z`)
        .attr('fill', darkMode ? '#0f172a' : '#ffffff')
        .attr('stroke', cat.color)
        .attr('stroke-width', 1.5)
        .style('pointer-events', 'none');

      const textColor = darkMode ? '#f1f5f9' : '#1e293b';
      const mutedColor = darkMode ? '#94a3b8' : '#64748b';
      const fs = sizes.isMobile ? 10.5 : 12;

      // Keyword name
      ttGroup
        .append('text')
        .attr('x', 0)
        .attr('y', by + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', fs + 1)
        .attr('font-weight', '700')
        .attr('fill', textColor)
        .style('pointer-events', 'none')
        .text(tooltip.fullTag.length > 22 ? tooltip.fullTag.slice(0, 20) + '…' : tooltip.fullTag);

      // Count row
      ttGroup
        .append('text')
        .attr('x', bx + 10)
        .attr('y', by + 36)
        .attr('font-size', fs)
        .attr('font-weight', '600')
        .attr('fill', cat.color)
        .style('pointer-events', 'none')
        .text(`Frequency: ${tooltip.count}`);

      // Source badge background
      const badgeY = by + 46;
      const badgeH = sizes.isMobile ? 16 : 18;
      ttGroup
        .append('rect')
        .attr('x', bx + 8)
        .attr('y', badgeY)
        .attr('width', ttW - 16)
        .attr('height', badgeH)
        .attr('rx', badgeH / 2)
        .attr('fill', cat.color)
        .style('opacity', 0.15)
        .style('pointer-events', 'none');

      // Icon + source label
      ttGroup
        .append('text')
        .attr('x', bx + 16)
        .attr('y', badgeY + badgeH / 2 + 1)
        .attr('dominant-baseline', 'middle')
        .attr('font-size', fs - 1)
        .attr('fill', cat.color)
        .attr('font-weight', '600')
        .style('pointer-events', 'none')
        .text(`${cat.icon} ${cat.label}`);

      // Description
      ttGroup
        .append('text')
        .attr('x', 0)
        .attr('y', by + ttH - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', fs - 2)
        .attr('fill', mutedColor)
        .style('pointer-events', 'none')
        .text(cat.description);
    },
    [darkMode],
  );

  // ── Center circle ──────────────────────────────────────────────────────────
  const drawCenterCircle = (svg, centerX, centerY, sizes) => {
    const centerGroup = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);
    centerGroup
      .append('circle')
      .attr('r', sizes.centerSize)
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
  };

  // ── Connection lines ───────────────────────────────────────────────────────
  const drawConnectionLines = (svg, positions, centerX, centerY, centerSize, sizes) => {
    positions.forEach((pos, i) => {
      const angle = pos.angle;
      const startX = centerX + centerSize * Math.cos(angle);
      const startY = centerY + centerSize * Math.sin(angle);
      const endX = pos.x - pos.r * 0.2 * Math.cos(angle);
      const endY = pos.y - pos.r * 0.2 * Math.sin(angle);
      const cat = SOURCE_CATEGORIES[getKeywordSource(pos.tag)] || SOURCE_CATEGORIES.general;
      svg
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('stroke', cat.color)
        .attr('stroke-width', sizes.isMobile ? 1.5 : 2)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', '4 3');
    });
  };

  // ── Main draw ──────────────────────────────────────────────────────────────
  const drawChart = useCallback(() => {
    const svgEl = svgRef.current;
    if (!tags?.length || !svgEl || dimensions.width === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const sizes = getResponsiveSizes();
    const centerY = Math.max(
      sizes.centerSize + 56,
      Math.min(height * (isMobile ? 0.37 : 0.35), height - (sizes.centerSize + 96)),
    );

    drawCenterCircle(svg, centerX, centerY, sizes);
    const positions = getPositions(tags, width, height, centerX, centerY);
    drawConnectionLines(svg, positions, centerX, centerY, sizes.centerSize, sizes);
    renderBubbles(svg, positions, sizes);
    renderTooltip(svg, tooltip, sizes, width, height);
  }, [
    tags,
    dimensions,
    getPositions,
    getResponsiveSizes,
    tooltip,
    renderBubbles,
    renderTooltip,
    darkMode,
    isMobile,
  ]);

  useEffect(() => {
    const drawTimeout = setTimeout(drawChart, 100);
    return () => clearTimeout(drawTimeout);
  }, [drawChart]);

  // ── Legend ─────────────────────────────────────────────────────────────────
  const activeSources = tags.length > 0 ? [...new Set(tags.map(t => getKeywordSource(t.tag)))] : [];

  // ── Dropdown options ───────────────────────────────────────────────────────
  const getDropdownOptions = useCallback(() => {
    const options = [];
    options.push({
      label: '📊 TEST DATASETS',
      options: Object.entries(testDatasets).map(([key, dataset]) => ({
        label: dataset.label,
        value: key,
        type: 'test',
      })),
    });
    if (projects.length > 0) {
      options.push({
        label: '🏢 REAL PROJECTS',
        options: projects.map(p => ({ label: p.projectName, value: p._id, type: 'project' })),
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

  // ── React-Select style helpers (unchanged from original) ──────────────────
  const getControlStyles = (base, state) => ({
    ...base,
    backgroundColor: palette.controlBg,
    borderColor: state.isFocused ? '#60a5fa' : palette.controlBorder,
    minHeight: '40px',
    height: '40px',
    fontSize: isMobile ? '11px' : '12px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? 'inset 0 0 0 1px #60a5fa' : 'none',
    overflow: 'hidden',
    alignItems: 'stretch',
    '&:hover': { borderColor: state.isFocused ? '#60a5fa' : palette.controlBorderHover },
  });
  const getValueContainerStyles = base => ({
    ...base,
    color: palette.text,
    backgroundColor: palette.controlBg,
    minHeight: '40px',
    height: '40px',
    padding: '0 14px',
    borderRadius: '12px 0 0 12px',
    display: 'flex',
    alignItems: 'center',
  });
  const getInputStyles = base => ({ ...base, color: palette.text });
  const getPlaceholderStyles = base => ({ ...base, color: palette.mutedText });
  const getSingleValueStyles = base => ({ ...base, color: palette.text });
  const getIndicatorSeparatorStyles = base => ({
    ...base,
    backgroundColor: 'transparent',
    width: 0,
  });
  const getIndicatorsContainerStyles = base => ({
    ...base,
    backgroundColor: palette.controlBg,
    minHeight: '40px',
    height: '40px',
    width: '44px',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0 12px 12px 0',
    flexShrink: 0,
  });
  const getIndicatorStyles = base => ({
    ...base,
    color: palette.indicator,
    backgroundColor: 'transparent',
    padding: 0,
    width: '44px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': { color: palette.text, backgroundColor: 'transparent' },
  });
  const getMenuStyles = base => ({
    ...base,
    backgroundColor: palette.menuBg,
    border: `1px solid ${palette.controlBorder}`,
    boxShadow: palette.shadow,
  });
  const getMenuListStyles = base => ({ ...base, backgroundColor: palette.menuBg });
  const getOptionStyles = (base, state) => {
    let backgroundColor = palette.optionBg;
    if (state.isSelected) backgroundColor = palette.optionSelectedBg;
    else if (state.isFocused) backgroundColor = palette.optionHoverBg;
    return {
      ...base,
      backgroundColor,
      color: palette.text,
      fontSize: isMobile ? '10px' : '11px',
      padding: isMobile ? '3px 5px' : '4px 8px',
      ':active': { backgroundColor: palette.optionHoverBg },
    };
  };
  const getGroupHeadingStyles = base => ({
    ...base,
    color: palette.groupHeading,
    backgroundColor: palette.menuBg,
    fontSize: isMobile ? '8px' : '9px',
    fontWeight: '600',
    padding: isMobile ? '2px 5px' : '3px 8px',
  });
  const getNoOptionsMessageStyles = base => ({
    ...base,
    color: palette.mutedText,
    backgroundColor: palette.menuBg,
  });

  // ── Calendar helpers (unchanged) ───────────────────────────────────────────
  const applyDarkCalendarTheme = useCallback(() => {
    requestAnimationFrame(() => {
      const poppers = Array.from(document.querySelectorAll('.react-datepicker-popper'));
      const activePopper = poppers.find(popper => popper.offsetParent !== null) || poppers.at(-1);
      if (!activePopper) return;
      const datepicker = activePopper.querySelector('.react-datepicker');
      const monthContainer = activePopper.querySelector('.react-datepicker__month-container');
      const header = activePopper.querySelector('.react-datepicker__header');
      const currentMonth = activePopper.querySelector('.react-datepicker__current-month');
      const dayNames = activePopper.querySelectorAll('.react-datepicker__day-name');
      const days = activePopper.querySelectorAll('.react-datepicker__day');
      if (datepicker) {
        datepicker.style.backgroundColor = '#0f172a';
        datepicker.style.borderColor = '#334155';
      }
      if (monthContainer) monthContainer.style.backgroundColor = '#0f172a';
      if (header) {
        header.style.backgroundColor = '#1e293b';
        header.style.borderBottomColor = '#334155';
      }
      if (currentMonth) currentMonth.style.color = '#f8fafc';
      dayNames.forEach(dn => {
        dn.style.color = '#e2e8f0';
        dn.style.backgroundColor = 'transparent';
      });
      days.forEach(d => {
        if (!d.classList.contains('react-datepicker__day--selected')) {
          d.style.color = '#f8fafc';
          d.style.backgroundColor = 'transparent';
        }
      });
    });
  }, []);

  const renderCalendarContainer = useCallback(
    ({ className, children }) => (
      <CalendarContainer className={className}>{children}</CalendarContainer>
    ),
    [],
  );

  const renderCalendarHeader = useCallback(
    ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
      <div className={styles.mfkCalendarHeader}>
        <button
          type="button"
          className={styles.mfkCalendarNav}
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          aria-label="Previous Month"
        >
          ‹
        </button>
        <span className={styles.mfkCalendarTitle}>{formatCalendarMonth(date)}</span>
        <button
          type="button"
          className={styles.mfkCalendarNav}
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          aria-label="Next Month"
        >
          ›
        </button>
      </div>
    ),
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
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
            components={{ DropdownIndicator }}
            styles={{
              control: getControlStyles,
              valueContainer: getValueContainerStyles,
              input: getInputStyles,
              placeholder: getPlaceholderStyles,
              singleValue: getSingleValueStyles,
              indicatorSeparator: getIndicatorSeparatorStyles,
              indicatorsContainer: getIndicatorsContainerStyles,
              dropdownIndicator: getIndicatorStyles,
              clearIndicator: getIndicatorStyles,
              menu: getMenuStyles,
              menuList: getMenuListStyles,
              option: getOptionStyles,
              groupHeading: getGroupHeadingStyles,
              noOptionsMessage: getNoOptionsMessageStyles,
              loadingMessage: getNoOptionsMessageStyles,
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
            className={`${styles.mfkDatepicker} ${darkMode ? styles.mfkDatepickerDark : ''}`}
            calendarClassName={darkMode ? 'mfk-dark-calendar' : ''}
            popperClassName={darkMode ? 'mfk-dark-popper' : ''}
            placeholderText="Start"
            dateFormat={isMobile ? 'MM/dd/yyyy' : 'MM/dd/yy'}
            maxDate={endDate || today}
            minDate={new Date('2023-01-01')}
            calendarContainer={renderCalendarContainer}
            onCalendarOpen={applyDarkCalendarTheme}
            renderCustomHeader={darkMode ? renderCalendarHeader : undefined}
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
            className={`${styles.mfkDatepicker} ${darkMode ? styles.mfkDatepickerDark : ''}`}
            calendarClassName={darkMode ? 'mfk-dark-calendar' : ''}
            popperClassName={darkMode ? 'mfk-dark-popper' : ''}
            placeholderText="End"
            dateFormat={isMobile ? 'MM/dd/yyyy' : 'MM/dd/yy'}
            minDate={startDate || new Date('2023-01-01')}
            maxDate={today}
            calendarContainer={renderCalendarContainer}
            onCalendarOpen={applyDarkCalendarTheme}
            renderCustomHeader={darkMode ? renderCalendarHeader : undefined}
          />
        </div>
        {(startDate || endDate) && (
          <button className={styles.clearButton} onClick={handleClearDates} title="Clear">
            ✕
          </button>
        )}
      </div>

      {/* ── Source legend ── */}
      {activeSources.length > 0 && (
        <div className={styles.mfkLegend}>
          {activeSources.map(key => {
            const cat = SOURCE_CATEGORIES[key];
            return (
              <span
                key={key}
                className={styles.mfkLegendItem}
                style={{ '--cat-color': cat.color, '--cat-bg': darkMode ? cat.darkBg : cat.bg }}
              >
                <span className={styles.mfkLegendDot} style={{ background: cat.color }} />
                {cat.icon} {cat.label}
              </span>
            );
          })}
        </div>
      )}

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

MostFrequentKeywords.propTypes = { darkMode: PropTypes.bool };
MostFrequentKeywords.defaultProps = { darkMode: false };

export default MostFrequentKeywords;
