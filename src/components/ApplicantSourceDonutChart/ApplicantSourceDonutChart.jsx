import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import styles from './ApplicantSourceDonutChart.module.css';

const COLORS = ['#FF4D4F', '#FFC107', '#1890FF', '#00C49F', '#8884D8'];
const toDateOnlyString = date => (date ? date.toISOString().split('T')[0] : null);

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

  const fetchDataWithFilters = async ({
    startDate: filterStartDate,
    endDate: filterEndDate,
    roles: filterRoles,
    comparisonType: filterComparisonType,
  }) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const url = ENDPOINTS.APPLICANT_SOURCES;
      const params = {};

      if (filterStartDate) params.startDate = toDateOnlyString(filterStartDate);
      if (filterEndDate) params.endDate = toDateOnlyString(filterEndDate);
      if (filterRoles?.length > 0) {
        const roleValues = filterRoles.map(r => (typeof r === 'object' ? r.value : r));
        params.roles = roleValues.join(',');
      }
      if (filterComparisonType && filterComparisonType !== '') {
        params.comparisonType = filterComparisonType;
      }

      const response = await axios.get(url, {
        headers: { Authorization: token },
        params,
      });

      const result = response.data || {};
      const formattedSources = Array.isArray(result.sources)
        ? result.sources.map(item => ({
            name: item.name || item.source || 'Unknown',
            value: Number(item.value ?? item.count ?? 0),
          }))
        : [];

      setData(formattedSources);
      setComparisonText(result.comparisonText || '');
      console.log('Comparison Text from backend:', result.comparisonText);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching data.');
      setData([]);
      setComparisonText('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataWithFilters({ startDate: null, endDate: null, roles: [], comparisonType: '' });
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartWrapperRef.current) {
        setChartWidth(chartWrapperRef.current.offsetWidth);
      }
    };

    updateDimensions();

    let observer;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window && chartWrapperRef.current) {
      observer = new window.ResizeObserver(updateDimensions);
      observer.observe(chartWrapperRef.current);
    } else {
      window.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  const handleStartDateChange = date => {
    setStartDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({ startDate: date, endDate, roles: selectedRoles, comparisonType });
    }
  };

  const handleEndDateChange = date => {
    setEndDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({ startDate, endDate: date, roles: selectedRoles, comparisonType });
    }
  };

  const handleRoleChange = roles => {
    setSelectedRoles(roles);
    fetchDataWithFilters({ startDate, endDate, roles, comparisonType });
  };

  const handleComparisonTypeChange = option => {
    const newComparisonType = option ? option.value : '';
    setComparisonType(newComparisonType);

    if (newComparisonType !== '') {
      const today = new Date();
      const pastDate = new Date(today);

      if (newComparisonType === 'week') {
        pastDate.setDate(today.getDate() - 7);
      } else if (newComparisonType === 'month') {
        pastDate.setMonth(today.getMonth() - 1);
      } else if (newComparisonType === 'year') {
        pastDate.setFullYear(today.getFullYear() - 1);
      }

      fetchDataWithFilters({
        startDate: pastDate,
        endDate: today,
        roles: selectedRoles,
        comparisonType: newComparisonType,
      });
    } else {
      fetchDataWithFilters({
        startDate,
        endDate,
        roles: selectedRoles,
        comparisonType: '',
      });
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCenterText = ({ viewBox }) => {
    const { cx, cy } = viewBox;
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
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill={darkMode ? '#e5e7eb' : '#2c3e50'}>
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

  const computedInnerRadius = useMemo(() => Math.round(computedOuterRadius * 0.75), [computedOuterRadius]);
  const chartHeight = useMemo(() => {
    if (!chartWidth) return 400;
    const base = Math.max(360, Math.min(chartWidth * 0.85, 520));
    return base + (chartWidth < 640 ? 130 : 0);
  }, [chartWidth]);
  const showSliceLabels = chartWidth > 640;
  const legendLayout = chartWidth < 640 ? 'vertical' : 'horizontal';
  const legendVerticalAlign = chartWidth < 640 ? 'bottom' : 'bottom';
  const legendAlign = chartWidth < 640 ? 'center' : 'center';
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
            options={[
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
            ].map(label => ({ label, value: label }))}
            placeholder="Select Roles"
            classNamePrefix={darkMode ? 'hgn-select-dark' : 'hgn-select'}
            styles={
              darkMode
                ? {
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
                  }
                : undefined
            }
          />
        </div>
        <div className={styles.filterInput}>
          <Select
            options={[
              { label: 'This same week last year', value: 'week' },
              { label: 'This same month last year', value: 'month' },
              { label: 'This same year', value: 'year' },
              { label: 'Custom Dates (no comparison)', value: '' },
            ]}
            value={
              comparisonType
                ? [
                    { label: 'This same week last year', value: 'week' },
                    { label: 'This same month last year', value: 'month' },
                    { label: 'This same year', value: 'year' },
                    { label: 'Custom Dates (no comparison)', value: '' },
                  ].find(opt => opt.value === comparisonType)
                : null
            }
            onChange={handleComparisonTypeChange}
            placeholder="Comparison Type"
            classNamePrefix={darkMode ? 'hgn-select-dark' : 'hgn-select'}
            styles={
              darkMode
                ? {
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
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Chart */}
      <div ref={chartWrapperRef} className={chartWrapperClassName}>
        {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: darkMode ? '#fca5a5' : 'red' }}>{error}</p>
        )}
        {!loading && !error && data.length === 0 && (
          <p style={{ textAlign: 'center' }}>No data available for selected filters.</p>
        )}
        {!loading && !error && data.length > 0 && (
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
                    ? ({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}% (${value})`
                    : undefined
                }
                labelLine={showSliceLabels}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                {comparisonText && <Label content={renderCenterText} />}
              </Pie>
              <Tooltip />
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
