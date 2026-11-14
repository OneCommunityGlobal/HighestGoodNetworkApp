import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as d3 from 'd3';
import styles from './MostFrequentKeywords.module.css';
import Select, { components as selectComponents } from 'react-select';
import PropTypes from 'prop-types';

function deduplicateByTag(sorted, maxItems) {
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

function checkDateInRange(itemDate, startDate, endDate) {
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
}

// Split a label into at most two balanced lines (multi-word labels only).
function wrapLabel(text) {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return [text];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const longest = Math.max(a.length, b.length);
    if (!best || longest < best.longest) best = { longest, lines: [a, b] };
  }
  return best.lines;
}

const formatCalendarMonth = date =>
  date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

function buildSelectStyles(palette, isMobile) {
  return {
    control: (base, state) => ({
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
      '&:hover': {
        borderColor: state.isFocused ? '#60a5fa' : palette.controlBorderHover,
      },
    }),
    valueContainer: base => ({
      ...base,
      color: palette.text,
      backgroundColor: palette.controlBg,
      minHeight: '40px',
      height: '40px',
      padding: '0 14px',
      borderRadius: '12px 0 0 12px',
      display: 'flex',
      alignItems: 'center',
    }),
    input: base => ({ ...base, color: palette.text }),
    placeholder: base => ({ ...base, color: palette.mutedText }),
    singleValue: base => ({ ...base, color: palette.text }),
    indicatorSeparator: base => ({ ...base, backgroundColor: 'transparent', width: 0 }),
    indicatorsContainer: base => ({
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
    }),
    dropdownIndicator: base => ({
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
    }),
    clearIndicator: base => ({
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
    }),
    menu: base => ({
      ...base,
      backgroundColor: palette.menuBg,
      border: `1px solid ${palette.controlBorder}`,
      boxShadow: palette.shadow,
    }),
    menuList: base => ({ ...base, backgroundColor: palette.menuBg }),
    option: (base, state) => {
      let optionBg = palette.optionBg;
      if (state.isSelected) optionBg = palette.optionSelectedBg;
      else if (state.isFocused) optionBg = palette.optionHoverBg;
      return {
        ...base,
        backgroundColor: optionBg,
        color: palette.text,
        fontSize: isMobile ? '10px' : '11px',
        padding: isMobile ? '3px 5px' : '4px 8px',
        ':active': { backgroundColor: palette.optionHoverBg },
      };
    },
    groupHeading: base => ({
      ...base,
      color: palette.groupHeading,
      backgroundColor: palette.menuBg,
      fontSize: isMobile ? '8px' : '9px',
      fontWeight: '600',
      padding: isMobile ? '2px 5px' : '3px 8px',
    }),
    noOptionsMessage: base => ({
      ...base,
      color: palette.mutedText,
      backgroundColor: palette.menuBg,
    }),
    loadingMessage: base => ({
      ...base,
      color: palette.mutedText,
      backgroundColor: palette.menuBg,
    }),
  };
}

function buildPalette(darkMode) {
  if (darkMode) {
    return {
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
    };
  }
  return {
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
}

/* ------------------------------------------------------------------ */
/* Bubble layout helpers (kept outside the component to keep           */
/* cognitive complexity of getPositions low).                          */
/* ------------------------------------------------------------------ */

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ORBIT_FACTORS = { 'extra-small': 0.22, tablet: 0.28, large: 0.3 };
const ORBIT_MIN_GAPS = { 'extra-small': 12, small: 18, tablet: 25 };
const COLLISION_GAPS = { 'extra-small': 10, small: 15, tablet: 18 };

function computeBounds(sizes, width, height, maxBubbleRadius) {
  return {
    width,
    height,
    padding: sizes.padding,
    horizontalPadding: sizes.padding + maxBubbleRadius + 8,
    topPadding: sizes.padding + maxBubbleRadius * 0.75 + 12,
    bottomPadding:
      sizes.padding + maxBubbleRadius * 1.15 + sizes.countFontSize + sizes.centerSize * 0.5 + 28,
  };
}

function computeOrbitRadius(sizes, bounds, centerY, maxBubbleRadius) {
  const { width, height, horizontalPadding, topPadding, bottomPadding } = bounds;
  const availableOrbitX = Math.max(0, width / 2 - horizontalPadding);
  const availableOrbitY = Math.max(
    0,
    Math.min(centerY - topPadding, height - bottomPadding - centerY),
  );

  const orbitFactor = ORBIT_FACTORS[sizes.deviceType] ?? 0.26;
  const minGap = ORBIT_MIN_GAPS[sizes.deviceType] ?? 30;

  const idealRadius = Math.min(
    Math.min(width, height) * orbitFactor,
    availableOrbitX,
    availableOrbitY,
  );
  if (idealRadius <= 0) return 0;

  const minRequiredRadius = sizes.centerSize + maxBubbleRadius + minGap;
  const desired = Math.max(idealRadius, minRequiredRadius);
  return Math.max(Math.min(desired, availableOrbitX, availableOrbitY), 0);
}

function clampToBounds(pos, bounds) {
  pos.x = clamp(pos.x, bounds.padding + pos.r + 5, bounds.width - bounds.padding - pos.r - 5);
  pos.y = clamp(pos.y, bounds.topPadding + 5, bounds.height - bounds.bottomPadding - 5);
}

function placeOnOrbit({ index, total, radius, r, center, centerSize, isMobile, bounds }) {
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // start from top
  let x = center.x + radius * Math.cos(angle);
  let y = center.y + radius * Math.sin(angle);

  const distFromCenter = Math.hypot(x - center.x, y - center.y);
  const minCenterDist = centerSize + r + (isMobile ? 15 : 20);
  if (distFromCenter > 0 && distFromCenter < minCenterDist) {
    const scale = minCenterDist / distFromCenter;
    x = center.x + (x - center.x) * scale;
    y = center.y + (y - center.y) * scale;
  }

  const pos = { x, y, r };
  clampToBounds(pos, bounds);
  return pos;
}

// Push two overlapping bubbles apart. Returns true if they collided.
function separatePair(a, b, gap, bounds) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.r + b.r + gap;
  if (dist >= minDist) return false;

  const angle = Math.atan2(dy, dx);
  const push = (minDist - dist) / 2 + 2;
  a.x -= Math.cos(angle) * push;
  a.y -= Math.sin(angle) * push;
  b.x += Math.cos(angle) * push;
  b.y += Math.sin(angle) * push;
  clampToBounds(a, bounds);
  clampToBounds(b, bounds);
  return true;
}

function separateAllPairs(positions, gap, bounds) {
  let collided = false;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (separatePair(positions[i], positions[j], gap, bounds)) collided = true;
    }
  }
  return collided;
}

// Keep every bubble (ellipse: rx = r, ry = 0.6r) clear of the center circle.
function pushClearOfCenter(positions, center, centerSize) {
  let moved = false;
  positions.forEach(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const phi = Math.atan2(dy, dx);
    const rx = p.r;
    const ry = p.r * 0.6;
    const extent = (rx * ry) / Math.hypot(ry * Math.cos(phi), rx * Math.sin(phi));
    const minD = centerSize + extent + 10;
    if (Math.hypot(dx, dy) < minD) {
      moved = true;
      p.x = center.x + Math.cos(phi) * minD;
      p.y = center.y + Math.sin(phi) * minD;
    }
  });
  return moved;
}

function resolveCollisions(positions, { sizes, bounds, center, maxIterations = 30 }) {
  const gap = COLLISION_GAPS[sizes.deviceType] ?? 20;
  for (let i = 0; i < maxIterations; i++) {
    const pairsMoved = separateAllPairs(positions, gap, bounds);
    const centerMoved = pushClearOfCenter(positions, center, sizes.centerSize);
    if (!pairsMoved && !centerMoved) break;
  }
}

function applyDarkCalendarStyles() {
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

  dayNames.forEach(dayName => {
    dayName.style.color = '#e2e8f0';
    dayName.style.backgroundColor = 'transparent';
  });

  days.forEach(day => {
    if (!day.classList.contains('react-datepicker__day--selected')) {
      day.style.color = '#f8fafc';
      day.style.backgroundColor = 'transparent';
    }
  });
}

const TEST_DATASETS = {
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

function MFKDatePickers({
  darkMode,
  isMobile,
  startDate,
  endDate,
  today,
  handleStartDateChange,
  handleEndDateChange,
  handleClearDates,
  renderCalendarContainer,
  applyDarkCalendarTheme,
  renderCalendarHeader,
  mfkStyles,
}) {
  return (
    <>
      <div className={mfkStyles.controlGroup}>
        <label htmlFor="start-date" className={mfkStyles.mfkLabel}>
          From
        </label>
        <DatePicker
          id="start-date"
          selected={startDate}
          onChange={handleStartDateChange}
          className={`${mfkStyles.mfkDatepicker} ${darkMode ? mfkStyles.mfkDatepickerDark : ''}`}
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
      <div className={mfkStyles.controlGroup}>
        <label htmlFor="end-date" className={mfkStyles.mfkLabel}>
          To
        </label>
        <DatePicker
          id="end-date"
          selected={endDate}
          onChange={handleEndDateChange}
          className={`${mfkStyles.mfkDatepicker} ${darkMode ? mfkStyles.mfkDatepickerDark : ''}`}
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
        <button
          type="button"
          className={mfkStyles.clearButton}
          onClick={handleClearDates}
          title="Clear"
        >
          ✕
        </button>
      )}
    </>
  );
}

const mfkStylesShape = PropTypes.shape({
  controlGroup: PropTypes.string,
  mfkLabel: PropTypes.string,
  mfkDatepicker: PropTypes.string,
  mfkDatepickerDark: PropTypes.string,
  clearButton: PropTypes.string,
  mfkChartContainer: PropTypes.string,
  mfkLoading: PropTypes.string,
  mfkError: PropTypes.string,
  mfkEmpty: PropTypes.string,
});

MFKDatePickers.propTypes = {
  darkMode: PropTypes.bool,
  isMobile: PropTypes.bool,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  today: PropTypes.instanceOf(Date),
  handleStartDateChange: PropTypes.func,
  handleEndDateChange: PropTypes.func,
  handleClearDates: PropTypes.func,
  renderCalendarContainer: PropTypes.func,
  applyDarkCalendarTheme: PropTypes.func,
  renderCalendarHeader: PropTypes.func,
  mfkStyles: mfkStylesShape,
};

function MFKChartArea({ isLoading, error, tags, selectedOption, svgRef, containerRef, mfkStyles }) {
  return (
    <div ref={containerRef} className={mfkStyles.mfkChartContainer}>
      {isLoading && <div className={mfkStyles.mfkLoading}>Loading...</div>}
      {!isLoading && error && <div className={mfkStyles.mfkError}>{error}</div>}
      {!isLoading && !error && tags.length === 0 && (
        <div className={mfkStyles.mfkEmpty}>{selectedOption ? 'No data' : 'Select source'}</div>
      )}
      {!isLoading && !error && tags.length > 0 && (
        <svg
          ref={svgRef}
          role="group"
          aria-label="Keyword mind map. Use the navigation controls to zoom and pan."
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}

MFKChartArea.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.shape({ tag: PropTypes.string, count: PropTypes.number })),
  selectedOption: PropTypes.shape({ value: PropTypes.string, type: PropTypes.string }),
  svgRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.object })]),
  containerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  mfkStyles: mfkStylesShape,
};

const DropdownIndicator = props => (
  <selectComponents.DropdownIndicator {...props}>
    <span className={styles.mfkChevron}>▾</span>
  </selectComponents.DropdownIndicator>
);

function MostFrequentKeywords({ darkMode: propDarkMode } = {}) {
  const svgRef = useRef();
  const containerRef = useRef();
  const zoomRef = useRef();
  const transformRef = useRef(d3.zoomIdentity);
  const requestRef = useRef(0);
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
  const API_BASE = process.env.REACT_APP_APIENDPOINT;
  const reduxDarkMode = useSelector(state => state.theme.darkMode);
  const darkMode = propDarkMode ?? reduxDarkMode;
  const palette = buildPalette(darkMode);

  // Get today's date for max date restriction
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: token },
      });
      setProjects(res.data || []);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch projects', err);
      }
    }
  };

  const fetchProjectData = async projectId => {
    const requestId = ++requestRef.current;
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('projectId', projectId);
      params.append('limit', 8);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }

      const token = localStorage.getItem('token');

      try {
        const response = await axios.get(`${API_BASE}/tags/frequent?${params.toString()}`, {
          headers: { Authorization: token },
        });

        if (requestId !== requestRef.current) return;
        const responseData = response?.data?.data;
        if (responseData && responseData.length > 0) {
          const normalizedData = responseData.slice(0, 8).map(item => ({
            tag: item.tag,
            count: Number(item.frequency ?? item.count ?? 0),
            category: item.category || 'Unspecified',
            source: item.source || 'Project tags',
            date: item.date || null,
          }));
          setAllTags(normalizedData);
          return;
        }

        // API returned empty — no keywords for this project
        setAllTags([]);
      } catch {
        if (requestId !== requestRef.current) return;
        setError('Failed to load keywords. Please try again.');
        setAllTags([]);
      }
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  };

  const handleOptionChange = selected => {
    setSelectedOption(selected);

    if (!selected) {
      setAllTags([]);
      setTags([]);
      return;
    }
  };

  useEffect(() => {
    requestRef.current += 1;
    setError('');
    setTags([]);
    setIsLoading(false);
    transformRef.current = d3.zoomIdentity;
    if (selectedOption?.type === 'test') {
      setAllTags(TEST_DATASETS[selectedOption.value].data);
    } else if (selectedOption?.type === 'project') {
      fetchProjectData(selectedOption.value);
    } else {
      setAllTags([]);
    }
    // Project frequencies must be filtered by the API before ranking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, startDate, endDate]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive sizing - optimized for all devices
  const getResponsiveSizes = useCallback(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    const smallestDim = Math.min(width, height);

    // Extra small devices (< 360px)
    if (width < 360) {
      return {
        centerSize: Math.min(28, smallestDim * 0.12),
        minBubbleSize: 22,
        maxBubbleSize: 36,
        maxFontSize: 9,
        countFontSize: 7,
        centerFontSize: 9,
        padding: 6,
        radiusFactor: 0.24,
        isMobile: true,
        deviceType: 'extra-small',
      };
    }

    // Small devices (360px - 480px)
    if (width <= 480) {
      return {
        centerSize: Math.min(35, smallestDim * 0.14),
        minBubbleSize: 28,
        maxBubbleSize: 42,
        maxFontSize: 10,
        countFontSize: 8,
        centerFontSize: 10,
        padding: 8,
        radiusFactor: 0.24,
        isMobile: true,
        deviceType: 'small',
      };
    }

    // Tablet (481px - 768px)
    if (width <= 768) {
      return {
        centerSize: Math.min(42, smallestDim * 0.12),
        minBubbleSize: 32,
        maxBubbleSize: 50,
        maxFontSize: 12,
        countFontSize: 10,
        centerFontSize: 12,
        padding: 12,
        radiusFactor: 0.22,
        isMobile: false,
        deviceType: 'tablet',
      };
    }

    // Large devices (> 768px)
    return {
      centerSize: Math.min(50, smallestDim * 0.1),
      minBubbleSize: 35,
      maxBubbleSize: 58,
      maxFontSize: 14,
      countFontSize: 11,
      centerFontSize: 13,
      padding: 15,
      radiusFactor: 0.22,
      isMobile: false,
      deviceType: 'large',
    };
  }, [dimensions, isMobile]);

  // Top keywords by count (ties broken by most recent), one entry per tag.
  const getLatestData = useCallback(
    data => {
      if (!data || data.length === 0) return [];
      const maxItems = isMobile ? 6 : 8;
      const sorted = [...data].sort(
        (a, b) => b.count - a.count || new Date(b.date) - new Date(a.date),
      );
      return deduplicateByTag(sorted, maxItems); // keeps the highest-count entry per tag
    },
    [isMobile],
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
        return checkDateInRange(itemDate, startDate, endDate);
      });

      const sorted = [...filtered].sort((a, b) => b.count - a.count);
      const maxItems = isMobile ? 6 : 8;
      const result = sorted.slice(0, maxItems);

      setError(result.length === 0 ? 'No keywords available for selected filters' : '');

      return result;
    },
    [startDate, endDate, isMobile, getLatestData],
  );

  useEffect(() => {
    if (allTags.length > 0) {
      const filtered =
        selectedOption?.type === 'project' ? getLatestData(allTags) : filterTagsByDate(allTags);
      setTags(filtered);
    } else {
      setTags([]);
    }
  }, [allTags, startDate, endDate, filterTagsByDate, selectedOption, getLatestData]);

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

  // Base bubble size based ONLY on frequency, not text length
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

  // Decide lines, font size and bubble radius so the full label always fits.
  const getLabelLayout = useCallback(
    (tag, baseR) => {
      const sizes = getResponsiveSizes();
      const cw = isMobile ? 0.55 : 0.6; // avg char width / font size
      const lines = wrapLabel(tag);
      const longest = Math.max(...lines.map(l => l.length));
      const countFs = sizes.countFontSize;

      let fontSize = Math.max(8, Math.min(sizes.maxFontSize, 11));
      const neededR = fs =>
        Math.max(
          (longest * fs * cw) / 1.7, // width: text must fit inside ~1.7r
          ((lines.length * fs * 1.2 + countFs * 1.3) / 2 + 3) / 0.6, // height: ry = 0.6r
        );

      let r = Math.max(baseR, neededR(fontSize));

      // Safety cap so one long word can't produce a giant bubble: shrink font instead.
      const rMax = sizes.maxBubbleSize * 1.35;
      if (r > rMax) {
        r = rMax;
        const byWidth = (r * 1.7) / (longest * cw);
        const byHeight = ((0.6 * r - 3) * 2 - countFs * 1.3) / (lines.length * 1.2);
        fontSize = Math.max(7, Math.min(fontSize, byWidth, byHeight));
      }
      return { lines, fontSize, r };
    },
    [getResponsiveSizes, isMobile],
  );

  // Position calculation with collision avoidance (logic lives in the helpers above)
  const getPositions = useCallback(
    (tags, width, height, centerX, centerY) => {
      if (!tags.length) return [];

      const sizes = getResponsiveSizes();
      const counts = tags.map(t => t.count);
      const layouts = tags.map((t, i) => getLabelLayout(t.tag, getBubbleSize(counts[i], counts)));
      const maxBubbleRadius = Math.max(...layouts.map(l => l.r), sizes.minBubbleSize);

      const center = { x: centerX, y: centerY };
      const bounds = computeBounds(sizes, width, height, maxBubbleRadius);
      const radius = computeOrbitRadius(sizes, bounds, centerY, maxBubbleRadius);

      const positions = tags.map((t, i) => ({
        ...placeOnOrbit({
          index: i,
          total: tags.length,
          radius,
          r: layouts[i].r,
          center,
          centerSize: sizes.centerSize,
          isMobile,
          bounds,
        }),
        tag: t.tag,
        fullTag: t.tag,
        count: t.count,
        lines: layouts[i].lines,
        fontSize: layouts[i].fontSize,
      }));

      resolveCollisions(positions, { sizes, bounds, center });

      // Pushing moves bubbles, so recompute angles for the connector lines.
      positions.forEach(p => {
        p.angle = Math.atan2(p.y - centerY, p.x - centerX);
      });

      return positions;
    },
    [getBubbleSize, getResponsiveSizes, getLabelLayout, isMobile],
  );

  const categories = [...new Set(tags.map(tag => tag.category || 'Unspecified'))].sort();
  const getNodeColor = useCallback(
    index => {
      const category = tags[index]?.category || 'Unspecified';
      const hue = [...category].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 0);
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
    },
    [tags, darkMode],
  );

  // Function to create hit area for bubble
  const createHitArea = useCallback((nodeGroup, r) => {
    return nodeGroup
      .append('ellipse')
      .attr('rx', r + 5)
      .attr('ry', r * 0.6 + 5)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .style('pointer-events', 'all');
  }, []);

  // Function to create visible bubble
  const createVisibleBubble = useCallback(
    (nodeGroup, colors, r) => {
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
    },
    [darkMode],
  );

  // Function to create text elements: full label wrapped to at most two lines, never truncated
  const createTextElements = useCallback((svg, pos, sizes, colors) => {
    const { x, y, lines, fontSize, count } = pos;
    const textGroup = svg
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .style('pointer-events', 'none');

    const countFs = sizes.countFontSize;
    const lh = fontSize * 1.2;
    const total = lines.length * lh + countFs * 1.3;
    const top = -total / 2;

    lines.forEach((line, i) => {
      textGroup
        .append('text')
        .attr('x', 0)
        .attr('y', top + lh * (i + 0.5))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', fontSize)
        .attr('font-weight', '600')
        .attr('fill', colors.text)
        .text(line);
    });

    textGroup
      .append('text')
      .attr('x', 0)
      .attr('y', top + lines.length * lh + countFs * 0.65)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', countFs)
      .attr('font-weight', '500')
      .attr('fill', colors.text)
      .style('opacity', 0.9)
      .text(count);
  }, []);

  // Add event handlers to bubble
  const addBubbleEventHandlers = useCallback(
    hitArea => {
      hitArea
        .on('mouseenter', event => {
          d3.select(event.currentTarget.parentNode)
            .select('ellipse.bubble-fill')
            .attr('stroke-width', 2.5)
            .attr('stroke', darkMode ? '#ffffff' : '#000000');
        })

        .on('mouseleave', () => {
          d3.select(svgRef.current)
            .selectAll('.bubble-fill')
            .attr('stroke-width', 1.5)
            .attr('stroke', (d, j) => getNodeColor(j).stroke);
        })
        .on('touchstart', event => {
          d3.select(event.currentTarget.parentNode)
            .select('ellipse.bubble-fill')
            .attr('stroke-width', 2.5)
            .attr('stroke', darkMode ? '#ffffff' : '#000000');
        });
    },
    [darkMode, getNodeColor],
  );

  // Function to render a single bubble
  const renderSingleBubble = useCallback(
    (svg, pos, i, sizes) => {
      const { x, y, r, count, fullTag } = pos;
      const colors = getNodeColor(i);

      const nodeGroup = svg
        .append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .attr('class', 'bubble-group');

      const item = tags[i];
      nodeGroup
        .attr('tabindex', 0)
        .attr('role', 'img')
        .attr(
          'aria-label',
          `${fullTag}: ${count} occurrences. Category: ${item.category ||
            'Unspecified'}. Source: ${item.source || selectedOption?.label || 'Unknown'}.`,
        );
      nodeGroup
        .append('title')
        .text(
          `${fullTag}: ${count} occurrences\nCategory: ${item.category ||
            'Unspecified'}\nSource: ${item.source || selectedOption?.label || 'Unknown'}`,
        );

      // Create hit area
      const hitArea = createHitArea(nodeGroup, r);
      addBubbleEventHandlers(hitArea);

      // Create visible bubble
      createVisibleBubble(nodeGroup, colors, r);

      // Create text elements
      createTextElements(svg, pos, sizes, colors);
    },
    [
      tags,
      selectedOption,
      getNodeColor,
      createHitArea,
      addBubbleEventHandlers,
      createVisibleBubble,
      createTextElements,
    ],
  );

  // Function to render all bubbles
  const renderBubbles = useCallback(
    (svg, positions, sizes) => {
      positions.forEach((pos, i) => {
        renderSingleBubble(svg, pos, i, sizes);
      });
    },
    [renderSingleBubble],
  );

  const drawCenterCircle = useCallback(
    (svg, centerX, centerY, sizes) => {
      const centerGroup = svg
        .append('g')
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .style('pointer-events', 'none');

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

      // Size "Top Words" (9 chars) from the circle so it never touches the edge
      const centerFontSize = Math.min(sizes.centerFontSize, (sizes.centerSize * 1.7) / (9 * 0.6));

      centerGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', darkMode ? '#f1f5f9' : '#1e293b')
        .attr('font-weight', '700')
        .attr('font-size', centerFontSize)
        .text('Top Words');
    },
    [darkMode],
  );

  // Function to draw connection lines
  const drawConnectionLines = useCallback(
    (svg, positions, centerX, centerY, centerSize, sizes) => {
      positions.forEach((pos, i) => {
        const angle = pos.angle;
        const startX = centerX + centerSize * Math.cos(angle);
        const startY = centerY + centerSize * Math.sin(angle);
        const endX = pos.x - pos.r * 0.2 * Math.cos(angle);
        const endY = pos.y - pos.r * 0.2 * Math.sin(angle);

        const lineColor = getNodeColor(i).stroke;

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
    },
    [getNodeColor],
  );

  // Main draw function
  const drawChart = useCallback(() => {
    const svgEl = svgRef.current;
    if (
      isLoading ||
      error ||
      !tags?.length ||
      !svgEl ||
      dimensions.width === 0 ||
      dimensions.height === 0
    )
      return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    const viewport = svg
      .append('g')
      .attr('class', 'map-viewport')
      .attr('transform', transformRef.current.toString());
    const content = viewport.append('g');
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4])
      .extent([
        [0, 0],
        [dimensions.width, dimensions.height],
      ])
      .on('zoom', event => {
        transformRef.current = event.transform;
        viewport.attr('transform', event.transform);
      });
    svg.call(zoom).call(zoom.transform, transformRef.current);
    zoomRef.current = zoom;

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const sizes = getResponsiveSizes();
    const centerY = height / 2;

    // Get positions
    const positions = getPositions(tags, width, height, centerX, centerY);

    // Draw connection lines
    drawConnectionLines(content, positions, centerX, centerY, sizes.centerSize, sizes);

    // Draw bubbles
    renderBubbles(content, positions, sizes);

    // Draw center circle last so nothing can ever cover it
    drawCenterCircle(content, centerX, centerY, sizes);

    // Fit the complete layout, including long labels, inside the chart at reset zoom.
    const bounds = content.node().getBBox();
    const padding = 20;
    const scale = Math.min(
      1,
      (width - padding * 2) / Math.max(bounds.width, 1),
      (height - padding * 2) / Math.max(bounds.height, 1),
    );
    const x = (width - bounds.width * scale) / 2 - bounds.x * scale;
    const y = (height - bounds.height * scale) / 2 - bounds.y * scale;
    content.attr('transform', `translate(${x}, ${y}) scale(${scale})`);
  }, [
    tags,
    dimensions,
    getPositions,
    getResponsiveSizes,
    renderBubbles,
    drawConnectionLines,
    drawCenterCircle,
    isLoading,
    error,
  ]);

  useEffect(() => {
    const drawTimeout = setTimeout(drawChart, 100);
    return () => {
      clearTimeout(drawTimeout);
      if (svgRef.current) d3.select(svgRef.current).on('.zoom', null);
    };
  }, [drawChart]);

  const getDropdownOptions = useCallback(() => {
    const options = [];

    options.push({
      label: '📊 TEST DATASETS',
      options: Object.entries(TEST_DATASETS).map(([key, dataset]) => ({
        label: dataset.label,
        value: key,
        type: 'test',
      })),
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

  const selectStyles = buildSelectStyles(palette, isMobile);

  const applyDarkCalendarTheme = useCallback(() => {
    requestAnimationFrame(applyDarkCalendarStyles);
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

  const navigate = (action, amount) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    if (action === 'reset') svg.call(zoomRef.current.transform, d3.zoomIdentity);
    if (action === 'zoom') svg.call(zoomRef.current.scaleBy, amount);
    if (action === 'pan') {
      const scale = transformRef.current.k;
      svg.call(zoomRef.current.translateBy, -amount[0] / scale, -amount[1] / scale);
    }
  };

  const exportSummary = () => {
    const cell = value =>
      `"${String(value ?? '')
        .replace(/^[=+@-]/, "'$&")
        .replace(/"/g, '""')}"`;
    const rows = [
      ['Keyword', 'Frequency', 'Category', 'Source', 'Project / dataset', 'Start date', 'End date'],
      ...tags.map(tag => [
        tag.tag,
        tag.count,
        tag.category || 'Unspecified',
        tag.source || (selectedOption?.type === 'test' ? 'Example dataset' : 'Project tags'),
        selectedOption?.label,
        startDate?.toLocaleDateString('en-CA') || 'All dates',
        endDate?.toLocaleDateString('en-CA') || 'All dates',
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\uFEFF', rows.map(row => row.map(cell).join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keyword-summary.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasData = !isLoading && !error && tags.length > 0;

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
            styles={selectStyles}
          />
        </div>
        <MFKDatePickers
          darkMode={darkMode}
          isMobile={isMobile}
          startDate={startDate}
          endDate={endDate}
          today={today}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
          handleClearDates={handleClearDates}
          renderCalendarContainer={renderCalendarContainer}
          applyDarkCalendarTheme={applyDarkCalendarTheme}
          renderCalendarHeader={renderCalendarHeader}
          mfkStyles={styles}
        />
      </div>

      <div className={styles.mapToolbar} role="group" aria-label="Mind map controls">
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={!hasData}
          onClick={() => navigate('zoom', 1.25)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={!hasData}
          onClick={() => navigate('zoom', 0.8)}
        >
          &minus;
        </button>
        <button
          type="button"
          aria-label="Pan left"
          title="Pan left"
          disabled={!hasData}
          onClick={() => navigate('pan', [50, 0])}
        >
          &larr;
        </button>
        <button
          type="button"
          aria-label="Pan right"
          title="Pan right"
          disabled={!hasData}
          onClick={() => navigate('pan', [-50, 0])}
        >
          &rarr;
        </button>
        <button
          type="button"
          aria-label="Pan up"
          title="Pan up"
          disabled={!hasData}
          onClick={() => navigate('pan', [0, 50])}
        >
          &uarr;
        </button>
        <button
          type="button"
          aria-label="Pan down"
          title="Pan down"
          disabled={!hasData}
          onClick={() => navigate('pan', [0, -50])}
        >
          &darr;
        </button>
        <button type="button" disabled={!hasData} onClick={() => navigate('reset')}>
          Reset
        </button>
        <button type="button" disabled={!hasData} onClick={exportSummary}>
          Export summary (CSV)
        </button>
      </div>
      <details className={styles.mapHelp}>
        <summary>How to read this mind map</summary>
        <p>
          Numbers show keyword frequency for the selected source and dates. Bubble size reflects
          relative frequency; labels can enlarge bubbles to fit. Lines connect keywords to the
          selected source and do not indicate relationships between keywords. Colors identify
          categories, not impact or severity. Unspecified means no category was supplied.
        </p>
        <p>
          Drag the background to pan, scroll or pinch to zoom, or use the controls. Hover over a
          node for details. The keyword summary below provides the same details for keyboard and
          touch users. Only the top {isMobile ? 6 : 8} keywords are displayed; exports contain these
          displayed keywords. Test datasets are examples.
        </p>
      </details>
      {hasData && (
        <div className={styles.mapLegend} aria-label="Keyword categories">
          {categories.map(category => (
            <span key={category}>
              <span
                aria-hidden="true"
                style={{
                  backgroundColor: getNodeColor(
                    tags.findIndex(tag => (tag.category || 'Unspecified') === category),
                  ).stroke,
                }}
              />
              {category}
            </span>
          ))}
        </div>
      )}
      <MFKChartArea
        isLoading={isLoading}
        error={error}
        tags={tags}
        selectedOption={selectedOption}
        svgRef={svgRef}
        containerRef={containerRef}
        mfkStyles={styles}
      />
      {hasData && (
        <details className={styles.mapHelp}>
          <summary>Keyword summary ({tags.length})</summary>
          <div className={styles.summaryScroll}>
            <table className={styles.keywordSummary}>
              <caption>{selectedOption?.label} ? displayed keywords</caption>
              <thead>
                <tr>
                  <th scope="col">Keyword</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">Category</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {tags.map(tag => (
                  <tr key={tag.tag}>
                    <th scope="row">{tag.tag}</th>
                    <td>{tag.count}</td>
                    <td>{tag.category || 'Unspecified'}</td>
                    <td>
                      {tag.source ||
                        (selectedOption?.type === 'test' ? 'Example dataset' : 'Project tags')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

export default MostFrequentKeywords;
