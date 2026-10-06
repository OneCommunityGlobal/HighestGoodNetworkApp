import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './InjuriesDonutChart.module.css';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import { useSelector } from 'react-redux';

const SEVERITY_COLORS = {
  Minor: '#7BC8F6',
  Moderate: '#FFD166',
  Severe: '#06D6A0',
  Critical: '#FF6B6B',
};

const TYPE_COLORS = {
  Cut: '#8884d8',
  Fracture: '#82ca9d',
  Burn: '#8dd1e1',
  Bruise: '#a4de6c',
  Sprain: '#d0ed57',
  Other: '#ffc658',
};

const FALLBACK_COLORS = ['#8884d8', '#82ca9d', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc658'];

const CustomTooltip = ({ active, payload, darkMode }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const tooltipBg = darkMode ? '#1C2541' : '#ffffff';
  const tooltipText = darkMode ? '#E0E0E0' : '#000000';

  return (
    <div
      style={{
        backgroundColor: tooltipBg,
        padding: '12px',
        borderRadius: '6px',
        color: tooltipText,
        border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.category}</div>
      <div>
        {item.count} injuries - {item.percent}%
      </div>
    </div>
  );
};

const ChartDisplay = ({ data, total, darkMode, groupBy }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || data.length === 0) return null;

  const getColorForCategory = (category, index) => {
    if (groupBy === 'severity') {
      return SEVERITY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    }
    return TYPE_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * (isMobile ? 0.45 : 0.5);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight="bold"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)', pointerEvents: 'none' }}
      >
        {`${percent}%`}
      </text>
    );
  };

  return (
    <div className={styles['chart-container']}>
      <div className={styles['total-summary']}>
        <span className={styles['total-count']}>{total}</span>
        <span className={styles['total-label']}>Total Injuries</span>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 350 : 400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            innerRadius={isMobile ? '55%' : '65%'}
            outerRadius={isMobile ? '80%' : '90%'}
            paddingAngle={data.length > 1 ? 2 : 0}
            label={renderCustomizedLabel}
            labelLine={false}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorForCategory(entry.category, index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
          <Legend
            layout={isMobile ? 'horizontal' : 'vertical'}
            verticalAlign={isMobile ? 'bottom' : 'middle'}
            align="center"
            wrapperStyle={isMobile ? { paddingTop: '20px' } : { paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const Filters = ({
  projects,
  selectedProject,
  setSelectedProject,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  groupBy,
  setGroupBy,
  resetFilters,
}) => (
  <div className={styles.filters}>
    <div className={styles['filter-item']}>
      <label htmlFor="project-select">Project:</label>
      <Select
        id="project-select"
        options={projects}
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder="All Projects"
        isClearable
        classNamePrefix="injuries-chart__select"
      />
    </div>

    <div className={styles['filter-item']}>
      <span className={styles['label-text']}>Date Range:</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          isClearable
          className={styles.datePicker}
        />
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          isClearable
          className={styles.datePicker}
        />
      </div>
    </div>

    <div className={styles['filter-item']}>
      <span className={styles['label-text']}>Group By:</span>
      <fieldset className={styles['toggle-buttons']}>
        <button
          onClick={() => setGroupBy('severity')}
          className={`${styles['toggle-btn']} ${groupBy === 'severity' ? styles.active : ''}`}
        >
          Severity
        </button>
        <button
          onClick={() => setGroupBy('injuryType')}
          className={`${styles['toggle-btn']} ${groupBy === 'injuryType' ? styles.active : ''}`}
        >
          Type
        </button>
      </fieldset>
    </div>
    <button onClick={resetFilters} className={styles['reset-btn']}>
      Reset Filters
    </button>
  </div>
);

const InjuriesDonutChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupBy, setGroupBy] = useState('severity');

  const fetchProjects = useCallback(async () => {
    try {
      const res = await httpService.get(ENDPOINTS.INJURY_PROJECTS());
      const projectsArray = res?.data || [];
      const options = projectsArray.map(p => ({
        value: String(p._id || p.id || p.value || ''),
        label: p.projectName || p.name || p.label || 'Unnamed Project',
      }));
      setProjects(options);
    } catch (err) {
      setProjects([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setError('');
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setData([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const url = ENDPOINTS.INJURIES_DISTRIBUTION(
        selectedProject?.value || 'all',
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0],
        groupBy,
      );
      const res = await httpService.get(url);
      const dist = res?.data?.distribution || [];
      const apiTotal = Number(res?.data?.total ?? dist.reduce((s, r) => s + Number(r.count), 0));

      setData(
        dist.map(it => ({
          ...it,
          percent: apiTotal > 0 ? Number(((Number(it.count) / apiTotal) * 100).toFixed(1)) : 0,
        })),
      );
      setTotal(apiTotal);
    } catch (err) {
      setError('Failed to fetch data. Click Retry.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedProject, groupBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedProject(null);
    setError('');
  };

  return (
    <div className={darkMode ? styles['full-screen-dark'] : ''}>
      <div className={`${styles['injuries-donut-chart']} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.title}>Injuries Analysis</h2>
        <Filters
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          resetFilters={resetFilters}
        />
        {error && (
          <div className={styles.error}>
            {error}{' '}
            <button onClick={fetchData} className={styles['retry-btn']}>
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : data.length > 0 ? (
          <ChartDisplay data={data} total={total} darkMode={darkMode} groupBy={groupBy} />
        ) : (
          !error && <div className={styles.empty}>No data available for selected filters</div>
        )}
      </div>
    </div>
  );
};

export default InjuriesDonutChart;
