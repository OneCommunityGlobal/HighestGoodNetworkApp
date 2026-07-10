import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

import { ENDPOINTS } from '../../../utils/URL';
import styles from './LessonsLearntChart.module.css';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const toYMD = d =>
  d instanceof Date && !Number.isNaN(d.getTime())
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
    : '';

const useLessonsData = (selectedProjects, startDate, endDate) => {
  const [allProjects, setAllProjects] = useState([]);
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProjects = async () => {
      try {
        const response = await axios.get(ENDPOINTS.BM_PROJECTS);
        if (!cancelled) {
          setAllProjects(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (!cancelled) setAllProjects([]);
      }
    };
    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchLessons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};

        // Backend supports single projectId or 'ALL'.
        // For one selection send that ID; for 0 or 2+ send ALL and filter client-side.
        const hasSelection = Array.isArray(selectedProjects) && selectedProjects.length > 0;
        const singleProject = hasSelection && selectedProjects.length === 1;
        if (singleProject) {
          params.projectId = selectedProjects[0].value;
        } else if (hasSelection) {
          params.projectId = 'ALL';
        }

        const formattedStart = toYMD(startDate);
        const formattedEnd = toYMD(endDate);
        if (formattedStart) params.startDate = formattedStart;
        if (formattedEnd) params.endDate = formattedEnd;

        const response = await axios.get(ENDPOINTS.BM_LESSONS_LEARNT, { params });

        const responseData = response.data?.data || response.data || [];
        const lessonsArray = Array.isArray(responseData) ? responseData : [];

        const transformedData = lessonsArray.map(item => ({
          projectName: item.project || 'Unknown Project',
          projectId: item.projectId,
          lessonsCount: item.lessonsCount || 0,
          percentage:
            Number.parseFloat((item.changePercentage || '0%').replace('%', '').replace('+', '')) ||
            0,
          changePercentage: item.changePercentage || '0%',
        }));

        // When multiple projects selected, filter to only the chosen ones
        const needsClientFilter = hasSelection && !singleProject;
        let filtered = transformedData;
        if (needsClientFilter) {
          const selectedIds = new Set(selectedProjects.map(p => p.value));
          filtered = transformedData.filter(d => selectedIds.has(d.projectId));
        }

        if (!cancelled) setLessonsData(filtered);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch lessons data');
          setLessonsData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchLessons();
    return () => {
      cancelled = true;
    };
  }, [selectedProjects, startDate, endDate]);

  return { allProjects, lessonsData, isLoading, error };
};

const BAR_COLOR_LIGHT = '#10b981';
const BAR_COLOR_DARK = '#34d399';

function LessonsLearntChart({ darkMode: propDarkMode }) {
  const reduxDarkMode = useSelector(state => state.theme.darkMode);
  const darkMode = propDarkMode === undefined ? reduxDarkMode : propDarkMode;

  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { allProjects, lessonsData, isLoading, error } = useLessonsData(
    selectedProjects,
    startDate,
    endDate,
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const projectOptions = useMemo(
    () =>
      Array.isArray(allProjects)
        ? allProjects
            .filter(proj => proj && (proj._id || proj.id))
            .map(proj => ({
              value: proj._id || proj.id,
              label: proj.name || 'Unnamed Project',
            }))
        : [],
    [allProjects],
  );

  const barColor = darkMode ? BAR_COLOR_DARK : BAR_COLOR_LIGHT;

  const chartData = useMemo(() => {
    const safeLabels = Array.isArray(lessonsData)
      ? lessonsData.map(d => d?.projectName || 'Unknown')
      : [];
    const safeData = Array.isArray(lessonsData) ? lessonsData.map(d => d?.lessonsCount || 0) : [];

    return {
      labels: safeLabels,
      datasets: [
        {
          label: 'Lessons Count',
          data: safeData,
          backgroundColor: barColor,
        },
      ],
    };
  }, [lessonsData, barColor]);

  const chartOptions = useMemo(() => {
    const tickColor = darkMode ? '#cbd5e1' : '#374151';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: context => {
              const { dataIndex } = context;
              if (Array.isArray(lessonsData) && lessonsData[dataIndex]) {
                return `MoM Change: ${lessonsData[dataIndex].changePercentage || '0%'}`;
              }
              return '';
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: tickColor },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: tickColor },
          grid: { color: gridColor },
        },
      },
    };
  }, [lessonsData, darkMode]);

  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#334155' : '#fff',
        borderColor: darkMode ? '#475569' : '#d1d5db',
        minHeight: '32px',
        fontSize: '13px',
        color: darkMode ? '#f1f5f9' : '#000',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#475569' : '#e2e8f0',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#f1f5f9' : '#000',
        fontSize: '11px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#94a3b8' : '#6b7280',
        ':hover': { backgroundColor: darkMode ? '#64748b' : '#cbd5e1', color: '#fff' },
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#1e293b' : '#fff',
      }),
      option: (base, state) => {
        const focusedBg = darkMode ? '#475569' : '#e2e8f0';
        const defaultBg = darkMode ? '#1e293b' : '#fff';
        return {
          ...base,
          backgroundColor: state.isFocused ? focusedBg : defaultBg,
          color: darkMode ? '#f1f5f9' : '#000',
          fontSize: '12px',
          padding: '6px 10px',
        };
      },
      input: base => ({
        ...base,
        color: darkMode ? '#f1f5f9' : '#000',
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#94a3b8' : '#9ca3af',
      }),
    }),
    [darkMode],
  );

  return (
    <div className={`${styles.chartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3 className={styles.chartTitle}>Lessons Learnt</h3>

      <div className={styles.filterRow}>
        <div className={styles.filter}>
          <label htmlFor="lessons-project-select" className={styles.filterLabel}>
            Project
          </label>
          <Select
            inputId="lessons-project-select"
            isMulti
            options={projectOptions}
            value={selectedProjects}
            onChange={selected => setSelectedProjects(selected || [])}
            placeholder="All projects"
            isClearable
            styles={selectStyles}
          />
        </div>
        <div className={styles.filter}>
          <label htmlFor="lessons-start-date" className={styles.filterLabel}>
            From
          </label>
          <DatePicker
            id="lessons-start-date"
            selected={startDate}
            onChange={date => setStartDate(date)}
            placeholderText="Start date"
            dateFormat="MM/dd/yyyy"
            isClearable
            maxDate={endDate || today}
          />
        </div>
        <div className={styles.filter}>
          <label htmlFor="lessons-end-date" className={styles.filterLabel}>
            To
          </label>
          <DatePicker
            id="lessons-end-date"
            selected={endDate}
            onChange={date => setEndDate(date)}
            placeholderText="End date"
            dateFormat="MM/dd/yyyy"
            isClearable
            minDate={startDate}
            maxDate={today}
          />
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {isLoading && <p className={styles.statusText}>Loading...</p>}
        {!isLoading && error && <p className={styles.statusText}>Error loading data: {error}</p>}
        {!isLoading && !error && (!Array.isArray(lessonsData) || lessonsData.length === 0) && (
          <p className={styles.statusText}>No lessons data available for the selected criteria</p>
        )}
        {!isLoading && !error && Array.isArray(lessonsData) && lessonsData.length > 0 && (
          <>
            <div className={styles.barContainer}>
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className={styles.percentageLabels}>
              {lessonsData.map((d, idx) => (
                <span
                  key={d?.projectId || idx}
                  className={styles.percentageLabel}
                  style={{
                    left: `${(idx + 0.5) * (100 / lessonsData.length)}%`,
                  }}
                >
                  {d?.changePercentage || '0%'}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

LessonsLearntChart.propTypes = {
  darkMode: PropTypes.bool,
};

LessonsLearntChart.defaultProps = {
  darkMode: undefined,
};

export default LessonsLearntChart;
