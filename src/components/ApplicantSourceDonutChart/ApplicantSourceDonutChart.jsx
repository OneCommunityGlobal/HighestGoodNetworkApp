import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import httpService from '../../services/httpService';
import { PieChart, Pie, Cell, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import config from '../../config.json';
import styles from './ApplicantSourceDonutChart.module.css';

const calculateTotal = payload => {
  if (!Array.isArray(payload)) return 0;
  return payload.reduce((sum, item) => sum + (item?.value ?? 0), 0);
};

const calculatePercentage = (value, total) => {
  if (!total || total <= 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
};

const getTooltipStyles = darkMode => ({
  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
  border: `1px solid ${darkMode ? '#475569' : '#e5e7eb'}`,
  borderRadius: '6px',
  padding: '10px 12px',
  boxShadow: darkMode
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  color: darkMode ? '#e2e8f0' : '#1f2937',
});

const CustomTooltip = ({ active, payload, darkMode }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  const name = data?.name ?? 'Unknown';
  const value = data?.value ?? 0;
  const total = calculateTotal(payload);
  const percentage = calculatePercentage(value, total);

  return (
    <div style={getTooltipStyles(darkMode)}>
      <div
        style={{
          fontWeight: 600,
          marginBottom: '4px',
          color: darkMode ? '#f1f5f9' : '#111827',
          fontSize: '14px',
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#4b5563' }}>
        Value: <strong style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>{value}</strong>
      </div>
      <div style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#4b5563' }}>
        Percentage:{' '}
        <strong style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>{percentage}%</strong>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  darkMode: PropTypes.bool,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  darkMode: false,
};

const COLORS = ['#FF4D4F', '#FFC107', '#1890FF', '#00C49F', '#8884D8'];
const toDateOnlyString = date => (date ? date.toISOString().split('T')[0] : null);

const COMPARISON_TYPE_OPTIONS = [
  { label: 'This same week last year', value: 'week' },
  { label: 'This same month last year', value: 'month' },
  { label: 'This same year', value: 'year' },
  { label: 'Custom Dates (no comparison)', value: '' },
];

const ROLE_OPTIONS = [
  'Project Manager',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'API Engineer',
  'QA Engineer',
  'Test Analyst',
  'Support Engineer',
  'Tech Lead',
  'Architect',
  'Junior Developer',
  'Intern',
].map(label => ({ label, value: label }));

const getDarkModeSelectStyles = isMulti => ({
  control: provided => ({
    ...provided,
    backgroundColor: '#1f2937',
    borderColor: '#3b82f6',
    color: '#e5e7eb',
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: '#111827',
    color: '#e5e7eb',
  }),
  singleValue: provided => ({
    ...provided,
    color: '#e5e7eb',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#2563eb' : '#111827',
    color: '#e5e7eb',
  }),
  ...(isMulti && {
    multiValue: provided => ({
      ...provided,
      backgroundColor: '#2563eb',
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: '#e5e7eb',
    }),
    multiValueRemove: provided => ({
      ...provided,
      color: '#bfdbfe',
      ':hover': {
        backgroundColor: '#1d4ed8',
        color: '#e5e7eb',
      },
    }),
  }),
});

const resetDataState = (setData, setComparisonText) => {
  setData([]);
  setComparisonText('');
};

const validateLocalStorage = () => {
  return typeof localStorage !== 'undefined' && localStorage !== null;
};

const getToken = () => {
  if (!validateLocalStorage()) return null;
  const token = localStorage.getItem(config?.tokenKey || 'token');
  return token && typeof token === 'string' ? token : null;
};

const validateDates = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return true;
  return startDate.getTime() <= endDate.getTime();
};

const buildRoleParams = filterRoles => {
  if (!Array.isArray(filterRoles) || filterRoles.length === 0) return null;
  const roleValues = filterRoles
    .map(r => {
      if (typeof r === 'object' && r !== null && r.value !== undefined) {
        return r.value;
      }
      return typeof r === 'string' ? r : '';
    })
    .filter(val => val !== '');
  return roleValues.length > 0 ? roleValues.join(',') : null;
};

const buildRequestParams = (filterStartDate, filterEndDate, filterRoles, filterComparisonType) => {
  const params = {};
  if (filterStartDate) params.startDate = toDateOnlyString(filterStartDate);
  if (filterEndDate) params.endDate = toDateOnlyString(filterEndDate);
  const roleParam = buildRoleParams(filterRoles);
  if (roleParam) params.roles = roleParam;
  if (filterComparisonType && filterComparisonType !== '') {
    params.comparisonType = filterComparisonType;
  }
  return params;
};

const formatSourceItem = item => {
  if (!item || typeof item !== 'object') return null;
  const value = Number(item.value ?? item.count ?? 0);
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) return null;
  return {
    name: item.name || item.source || 'Unknown',
    value,
  };
};

const formatSources = sources => {
  if (!Array.isArray(sources)) return [];
  return sources.map(formatSourceItem).filter(item => item !== null);
};

const calculatePastDate = (today, comparisonType) => {
  const pastDate = new Date(today);
  if (comparisonType === 'week') {
    pastDate.setDate(today.getDate() - 7);
  } else if (comparisonType === 'month') {
    pastDate.setMonth(today.getMonth() - 1);
  } else if (comparisonType === 'year') {
    pastDate.setFullYear(today.getFullYear() - 1);
  }
  return pastDate;
};

const ApplicantSourceDonutChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [comparisonText, setComparisonText] = useState('');
  const [comparisonType, setComparisonType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const darkMode = useSelector(state => state.theme?.darkMode);
  const chartWrapperRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  const fetchDataWithFilters = useCallback(
    async ({
      startDate: filterStartDate,
      endDate: filterEndDate,
      roles: filterRoles,
      comparisonType: filterComparisonType,
    }) => {
      setLoading(true);
      setError('');

      try {
        if (!validateLocalStorage()) {
          setError('LocalStorage is not available. Please log in again.');
          setLoading(false);
          resetDataState(setData, setComparisonText);
          return;
        }

        const token = getToken();
        if (!token) {
          setError('Please log in to view applicant source data.');
          setLoading(false);
          resetDataState(setData, setComparisonText);
          return;
        }

        if (httpService?.setjwt) {
          httpService.setjwt(token);
        }

        if (!validateDates(filterStartDate, filterEndDate)) {
          setError('Start date cannot be greater than end date');
          setLoading(false);
          resetDataState(setData, setComparisonText);
          return;
        }

        const url = ENDPOINTS?.APPLICANT_SOURCES;
        if (!url || typeof url !== 'string') {
          throw new Error('Invalid API endpoint configuration');
        }

        const params = buildRequestParams(
          filterStartDate,
          filterEndDate,
          filterRoles,
          filterComparisonType,
        );

        if (!httpService?.get) {
          throw new Error('HTTP service is not available');
        }

        const response = await httpService.get(url, { params });

        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from server');
        }

        const result = response.data || {};
        const formattedSources = formatSources(result.sources);

        setData(formattedSources);
        setComparisonText(typeof result.comparisonText === 'string' ? result.comparisonText : '');
      } catch (err) {
        if (err?.response?.status === 401) {
          setError('Authentication required. Please log in to view applicant source data.');
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Error fetching data. Please try again later.',
          );
        }
        resetDataState(setData, setComparisonText);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchDataWithFilters({ startDate: null, endDate: null, roles: [], comparisonType: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartWrapperRef.current?.offsetWidth) {
        const width = chartWrapperRef.current.offsetWidth;
        if (Number.isFinite(width) && width > 0) {
          setChartWidth(width);
        }
      }
    };

    updateDimensions();

    let observer;
    const globalWindow = globalThis.window;
    if (globalWindow?.ResizeObserver && chartWrapperRef.current) {
      try {
        observer = new globalWindow.ResizeObserver(updateDimensions);
        observer.observe(chartWrapperRef.current);
      } catch {
        if (globalWindow.addEventListener) {
          globalWindow.addEventListener('resize', updateDimensions);
        }
      }
    } else if (globalWindow?.addEventListener) {
      globalWindow.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (observer?.disconnect) {
        try {
          observer.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      } else if (globalWindow?.removeEventListener) {
        globalWindow.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  const handleStartDateChange = date => {
    setStartDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({
        startDate: date || null,
        endDate: endDate || null,
        roles: selectedRoles || [],
        comparisonType: comparisonType || '',
      });
    }
  };

  const handleEndDateChange = date => {
    setEndDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({
        startDate: startDate || null,
        endDate: date || null,
        roles: selectedRoles || [],
        comparisonType: comparisonType || '',
      });
    }
  };

  const handleRoleChange = roles => {
    const safeRoles = Array.isArray(roles) ? roles : [];
    setSelectedRoles(safeRoles);
    fetchDataWithFilters({
      startDate: startDate || null,
      endDate: endDate || null,
      roles: safeRoles,
      comparisonType: comparisonType || '',
    });
  };

  const handleComparisonTypeChange = option => {
    const newComparisonType =
      option && typeof option === 'object' && option.value !== undefined ? option.value : '';
    setComparisonType(newComparisonType);

    if (newComparisonType === '') {
      fetchDataWithFilters({
        startDate: startDate || null,
        endDate: endDate || null,
        roles: selectedRoles || [],
        comparisonType: '',
      });
      return;
    }

    const today = new Date();
    if (!(today instanceof Date) || !Number.isFinite(today.getTime())) {
      setError('Invalid date configuration. Please refresh the page.');
      return;
    }

    const pastDate = calculatePastDate(today, newComparisonType);
    if (!(pastDate instanceof Date) || !Number.isFinite(pastDate.getTime())) {
      setError('Invalid date calculation. Please try again.');
      return;
    }

    fetchDataWithFilters({
      startDate: pastDate,
      endDate: today,
      roles: selectedRoles || [],
      comparisonType: newComparisonType,
    });
  };

  const total = useMemo(() => {
    return data.reduce((sum, item) => {
      const value = item?.value ?? 0;
      return sum + (Number.isFinite(value) && value >= 0 ? value : 0);
    }, 0);
  }, [data]);

  const renderCenterText = ({ viewBox }) => {
    if (!viewBox || typeof viewBox !== 'object') {
      return null;
    }
    const { cx, cy } = viewBox;
    if (
      typeof cx !== 'number' ||
      typeof cy !== 'number' ||
      !Number.isFinite(cx) ||
      !Number.isFinite(cy)
    ) {
      return null;
    }
    const lines = comparisonText ? comparisonText.split('\n') : [];

    if (!lines.length) {
      return null;
    }

    // Adjust font sizes for mobile
    const isMobile = chartWidth < 640;
    const baseFontSize = isMobile ? 12 : 16;
    const secondaryFontSize = isMobile ? 10 : 12;
    const lineSpacing = isMobile ? 12 : 16;

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={darkMode ? '#e5e7eb' : '#2c3e50'}
      >
        {lines.map((line, index) => {
          // Word wrap for long lines on mobile
          const words = line.split(' ');
          const chunks = [];
          if (isMobile && line.length > 20) {
            let currentChunk = '';
            words.forEach(word => {
              const testChunk = currentChunk ? `${currentChunk} ${word}` : word;
              if (testChunk.length <= 20) {
                currentChunk = testChunk;
              } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = word;
              }
            });
            if (currentChunk) chunks.push(currentChunk);
          } else {
            chunks.push(line);
          }

          return chunks.map((chunk, chunkIndex) => (
            <tspan
              key={`center-text-${line}-${index}-${chunkIndex}`}
              x={cx}
              dy={index === 0 && chunkIndex === 0 ? 0 : lineSpacing}
              fontSize={index === 0 ? baseFontSize : secondaryFontSize}
              fontWeight={index === 0 ? 600 : 400}
            >
              {chunk}
            </tspan>
          ));
        })}
      </text>
    );
  };

  const pageClassName = `${styles.page} ${darkMode ? styles.pageDark : ''}`;
  const headingClassName = `${styles.heading} ${darkMode ? styles.darkHeading : ''}`;
  const containerClassName = `${styles.applicantChartContainer} ${
    darkMode ? styles.darkContainer : ''
  }`;
  const filterRowClassName = `${styles.filterRow} ${darkMode ? styles.dark : ''}`;
  const chartWrapperClassName = `${styles.chartWrapper} ${darkMode ? styles.dark : ''}`;

  const computedOuterRadius = useMemo(() => {
    if (!chartWidth) return 150;
    const proposed = chartWidth / 3.2;
    return Math.max(100, Math.min(proposed, 160));
  }, [chartWidth]);

  const computedInnerRadius = useMemo(() => Math.round(computedOuterRadius * 0.75), [
    computedOuterRadius,
  ]);
  const chartHeight = useMemo(() => {
    if (!chartWidth) return 400;
    const base = Math.max(360, Math.min(chartWidth * 0.85, 520));
    return base + (chartWidth < 640 ? 130 : 0);
  }, [chartWidth]);
  const showSliceLabels = chartWidth > 640;
  const legendLayout = chartWidth < 640 ? 'vertical' : 'horizontal';
  const legendVerticalAlign = 'bottom';
  const legendAlign = 'center';
  const legendWrapperStyle = useMemo(() => {
    if (chartWidth < 640) {
      return {
        paddingTop: 40,
        margin: '24px auto 0',
        width: '100%',
        maxWidth: 260,
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 6,
        alignItems: 'flex-start',
      };
    }

    return {
      paddingTop: 8,
      margin: '24px auto 0',
    };
  }, [chartWidth]);

  return (
    <div className={pageClassName}>
      <div className={containerClassName}>
        <h2
          className={headingClassName}
          style={{ textAlign: 'center', color: darkMode ? undefined : '#3977FF' }}
        >
          Source of Applicants
        </h2>

        {/* Filters */}
        <div className={filterRowClassName}>
          {comparisonType === '' && (
            <>
              <div className={styles.filterInput}>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  placeholderText="Start Date"
                  className={`filter-date ${darkMode ? styles.darkInput : ''}`}
                />
              </div>
              <div className={styles.filterInput}>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  placeholderText="End Date"
                  className={`filter-date ${darkMode ? styles.darkInput : ''}`}
                  minDate={startDate}
                />
              </div>
            </>
          )}
          <div className={styles.filterInput}>
            <Select
              isMulti
              value={selectedRoles}
              onChange={handleRoleChange}
              options={ROLE_OPTIONS}
              placeholder="Select Roles"
              classNamePrefix={darkMode ? 'hgn-select-dark' : 'hgn-select'}
              styles={darkMode ? getDarkModeSelectStyles(true) : undefined}
            />
          </div>
          <div className={styles.filterInput}>
            <Select
              options={COMPARISON_TYPE_OPTIONS}
              value={
                comparisonType
                  ? COMPARISON_TYPE_OPTIONS.find(opt => opt.value === comparisonType)
                  : null
              }
              onChange={handleComparisonTypeChange}
              placeholder="Comparison Type"
              classNamePrefix={darkMode ? 'hgn-select-dark' : 'hgn-select'}
              styles={darkMode ? getDarkModeSelectStyles(false) : undefined}
            />
          </div>
        </div>

        {/* Chart */}
        <div ref={chartWrapperRef} className={chartWrapperClassName}>
          {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}
          {error && !loading && (
            <p style={{ textAlign: 'center', color: darkMode ? '#fca5a5' : 'red' }}>{error}</p>
          )}
          {data.length === 0 && !loading && !error && (
            <p style={{ textAlign: 'center' }}>No data available for selected filters.</p>
          )}
          {data.length > 0 && !loading && !error && (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart margin={{ top: 40, right: 40, left: 40, bottom: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={computedInnerRadius}
                  outerRadius={computedOuterRadius}
                  dataKey="value"
                  label={
                    showSliceLabels
                      ? ({ name, value }) => {
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                          return `${name}: ${percentage}% (${value})`;
                        }
                      : undefined
                  }
                  labelLine={showSliceLabels}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${entry.value}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  {comparisonText && <Label content={renderCenterText} />}
                </Pie>
                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend
                  layout={legendLayout}
                  verticalAlign={legendVerticalAlign}
                  align={legendAlign}
                  wrapperStyle={legendWrapperStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantSourceDonutChart;
