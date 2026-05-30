import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Select from 'react-select';
import httpService from '../../../services/httpService';
import { useSelector } from 'react-redux';
import styles from './ProjectRiskProfileOverview.module.css';

export default function ProjectRiskProfileOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [trendData, setTrendData] = useState({});

  const projectWrapperRef = useRef(null);
  const dateWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (projectWrapperRef.current && !projectWrapperRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile`,
        );
        let result = res.data;
        if (!Array.isArray(result)) result = [result];
        setData(result);
        setAllProjects(result.map(p => p.projectName));
        setSelectedProjects(result.map(p => p.projectName));
        const dates = Array.from(new Set(result.flatMap(p => p.dates || [])));
        setAllDates(dates);
        setSelectedDates(dates);
        // create trend history used for movement indicators and timeline
        generateTrendData(result);
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const generateTrendData = riskData => {
    const trends = {};
    riskData.forEach(item => {
      const key = item.projectName || 'Unknown';
      if (!trends[key]) trends[key] = [];
      const date = (item.dates && item.dates[0]) || item.date || new Date().toLocaleDateString();
      trends[key].push({
        date,
        // Risk metrics for timeline
        costOverrun: item.predictedCostOverrun || 0,
        issues: item.totalOpenIssues || 0,
        timeDelay: item.predictedTimeDelay || 0,
        // Risk attributes for historical tracking
        severity: item.severity || 'N/A',
        likelihood: item.likelihood || 'N/A',
        status: item.status || 'N/A',
        owner: item.owner || 'N/A',
        mitigationState: item.mitigationState || 'N/A',
      });
    });
    Object.keys(trends).forEach(k => {
      trends[k].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    setTrendData(trends);
  };

  const getTrendIndicator = (current, previous) => {
    if (previous === undefined || previous === null) return null;
    if (current > previous) return { symbol: '↑', color: '#EA4335', label: 'Increased' };
    if (current < previous) return { symbol: '↓', color: '#34A853', label: 'Decreased' };
    return { symbol: '→', color: '#FBBC05', label: 'Unchanged' };
  };

  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  const getDateLabel = () => {
    if (selectedDates.length === allDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

  const chartTheme = {
    grid: darkMode ? '#3f4652' : '#e8e8e8',
    axisText: darkMode ? '#d7dbe2' : '#666',
    axisLine: darkMode ? '#6b7280' : '#d5d5d5',
    tooltipBg: darkMode ? '#1f2937' : '#fff',
    tooltipBorder: darkMode ? '#4b5563' : '#e0e0e0',
    tooltipText: darkMode ? '#f3f4f6' : '#333',
    hover: darkMode ? 'rgba(66, 133, 244, 0.16)' : 'rgba(66, 133, 244, 0.08)',
  };

  const customSelectStyles = {
    control: base => ({
      ...base,
      fontSize: 12,
      minHeight: 34,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderColor: darkMode ? '#555' : '#d5d5d5',
      boxShadow: 'none',
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 6px',
    }),
    multiValue: base => ({
      ...base,
      background: darkMode ? '#444' : '#e8f0fe',
      fontSize: 11,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
      ':hover': {
        backgroundColor: darkMode ? '#555' : '#dbe7ff',
        color: darkMode ? '#fff' : '#111',
      },
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#c7c7c7' : '#666',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      border: darkMode ? '1px solid #555' : '1px solid #e2e2e2',
      boxShadow: darkMode ? '0 4px 16px rgba(0, 0, 0, 0.45)' : '0 4px 16px rgba(0,0,0,0.12)',
    }),
    option: (base, state) => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
      backgroundColor: state.isSelected
        ? darkMode
          ? '#4a4a4a'
          : '#dbe7ff'
        : state.isFocused
        ? darkMode
          ? '#3a3a3a'
          : '#f5f5f5'
        : darkMode
        ? '#2c2c2c'
        : '#fff',
    }),
  };

  if (loading)
    return (
      <div className={`${styles.statusCard} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.loading}`}>Loading project risk profiles...</div>
      </div>
    );
  if (error)
    return (
      <div className={`${styles.statusCard} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.error}`}>{error}</div>
      </div>
    );

  const getTimelineData = () => {
    if (selectedProjects.length !== 1) return [];
    const projectName = selectedProjects[0];
    return trendData[projectName] || [];
  };

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.headerRow}`}>
          <h2 className={`${styles.heading}`}>Overall Risk Profile</h2>

          <div className={`${styles.filterRow}`}>
            {/* Project Dropdown */}
            <div ref={projectWrapperRef} className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Project</span>
              <button
                type="button"
                className={`${styles.dropdownButton}`}
                onClick={() => setShowProjectDropdown(prev => !prev)}
                aria-label="Show project dropdown"
              >
                {getProjectLabel()}
              </button>
              {showProjectDropdown && (
                <div className={`${styles.dropdownMenu}`}>
                  <Select
                    isMulti
                    classNamePrefix="customSelect"
                    options={allProjects.map(p => ({ label: p, value: p }))}
                    value={selectedProjects.map(p => ({ label: p, value: p }))}
                    onChange={opts => setSelectedProjects(opts ? opts.map(o => o.value) : [])}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                    styles={customSelectStyles}
                    placeholder="Select projects"
                  />
                </div>
              )}
            </div>

            {/* Date Dropdown */}
            <div ref={dateWrapperRef} className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Dates</span>
              <button
                type="button"
                className={`${styles.dropdownButton}`}
                onClick={() => setShowDateDropdown(prev => !prev)}
                aria-label="Show date dropdown"
              >
                {getDateLabel()}
              </button>
              {showDateDropdown && (
                <div className={`${styles.dropdownMenu}`}>
                  <Select
                    isMulti
                    classNamePrefix="customSelect"
                    options={allDates.map(d => ({ label: d, value: d }))}
                    value={selectedDates.map(d => ({ label: d, value: d }))}
                    onChange={opts => setSelectedDates(opts ? opts.map(o => o.value) : [])}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                    styles={customSelectStyles}
                    placeholder="Select dates"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.chartWrapper}`}>
          <div className={`${styles.legendWrapper}`}>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#4285F4' }}
              ></span>
              <span>Predicted Cost Overrun Percentage</span>
            </div>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#EA4335' }}
              ></span>
              <span>Issues</span>
            </div>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#FBBC05' }}
              ></span>
              <span>Predicted Time Delay Percentage</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 40, left: 50, bottom: 100 }}
              barGap="5%"
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="5 5"
                stroke={chartTheme.grid}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="projectName"
                angle={-45}
                textAnchor="end"
                height={110}
                tick={{ fontSize: 13, fill: chartTheme.axisText, fontWeight: 500 }}
                axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1.5 }}
                tickLine={{ stroke: chartTheme.axisLine }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: chartTheme.axisText, fontWeight: 500 }}
                axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1.5 }}
                tickLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `2px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  padding: '14px',
                  color: chartTheme.tooltipText,
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: chartTheme.tooltipText }}
                itemStyle={{ color: chartTheme.tooltipText }}
                cursor={{ fill: chartTheme.hover }}
              />
              <Bar
                dataKey="predictedCostOverrun"
                name="Predicted Cost Overrun Percentage"
                fill="#4285F4"
                radius={[3, 3, 0, 0]}
              />
              <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" radius={[3, 3, 0, 0]} />
              <Bar
                dataKey="predictedTimeDelay"
                name="Predicted Time Delay Percentage"
                fill="#FBBC05"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {filteredData.length === 0 && (
            <div className={styles.emptyState}>No risk profile data for selected filters.</div>
          )}
        </div>
      </div>

      {/* Trend Indicators Section */}
      {filteredData.length > 0 && (
        <div className={`${styles.trendSection}`}>
          <h3 className={`${styles.trendTitle}`}>Risk Movement Tracking</h3>
          <div className={`${styles.trendGrid}`}>
            {filteredData.map(project => {
              const prevData =
                trendData[project.projectName] && trendData[project.projectName].length > 1
                  ? trendData[project.projectName][trendData[project.projectName].length - 2]
                  : trendData[project.projectName]?.[0];
              const costTrend = getTrendIndicator(
                project.predictedCostOverrun,
                prevData?.costOverrun,
              );
              const issueTrend = getTrendIndicator(project.totalOpenIssues, prevData?.issues);
              const timeTrend = getTrendIndicator(project.predictedTimeDelay, prevData?.timeDelay);
              const currentData =
                trendData[project.projectName]?.[trendData[project.projectName]?.length - 1];

              return (
                <div key={project.projectName} className={`${styles.trendCard}`}>
                  <div className={`${styles.projectName}`}>{project.projectName}</div>

                  {/* Risk Metrics with Trends */}
                  <div className={`${styles.trendRow}`}>
                    <span>Cost Overrun:</span>
                    {costTrend && (
                      <span
                        className={`${styles.trendIndicator}`}
                        style={{ color: costTrend.color }}
                        title={costTrend.label}
                      >
                        {costTrend.symbol}
                      </span>
                    )}
                    <span>{project.predictedCostOverrun || 0}%</span>
                  </div>
                  <div className={`${styles.trendRow}`}>
                    <span>Issues:</span>
                    {issueTrend && (
                      <span
                        className={`${styles.trendIndicator}`}
                        style={{ color: issueTrend.color }}
                        title={issueTrend.label}
                      >
                        {issueTrend.symbol}
                      </span>
                    )}
                    <span>{project.totalOpenIssues || 0}</span>
                  </div>
                  <div className={`${styles.trendRow}`}>
                    <span>Time Delay:</span>
                    {timeTrend && (
                      <span
                        className={`${styles.trendIndicator}`}
                        style={{ color: timeTrend.color }}
                        title={timeTrend.label}
                      >
                        {timeTrend.symbol}
                      </span>
                    )}
                    <span>{project.predictedTimeDelay || 0}%</span>
                  </div>

                  {/* Risk Attributes */}
                  {currentData && (
                    <>
                      <div className={`${styles.attributeRow}`}>
                        <span className={`${styles.label}`}>Status:</span>
                        <span className={`${styles.value}`}>{currentData.status}</span>
                      </div>
                      <div className={`${styles.attributeRow}`}>
                        <span className={`${styles.label}`}>Severity:</span>
                        <span className={`${styles.value}`}>{currentData.severity}</span>
                      </div>
                      <div className={`${styles.attributeRow}`}>
                        <span className={`${styles.label}`}>Likelihood:</span>
                        <span className={`${styles.value}`}>{currentData.likelihood}</span>
                      </div>
                      <div className={`${styles.attributeRow}`}>
                        <span className={`${styles.label}`}>Owner:</span>
                        <span className={`${styles.value}`}>{currentData.owner}</span>
                      </div>
                      <div className={`${styles.attributeRow}`}>
                        <span className={`${styles.label}`}>Mitigation:</span>
                        <span className={`${styles.value}`}>{currentData.mitigationState}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Chart for Single Project */}
      {selectedProjects.length === 1 && getTimelineData().length > 1 && (
        <div className={`${styles.timelineSection}`}>
          <h3 className={`${styles.trendTitle}`}>Historical Risk Trend - {selectedProjects[0]}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={getTimelineData()}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid
                strokeDasharray="5 5"
                stroke={darkMode ? '#3a3a3a' : '#e8e8e8'}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: darkMode ? '#888' : '#666' }}
                axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1 }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: darkMode ? '#888' : '#666' }}
                axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  border: `1px solid ${darkMode ? '#666' : '#e0e0e0'}`,
                  borderRadius: '6px',
                  padding: '10px',
                  color: darkMode ? '#fff' : '#333',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  color: darkMode ? '#ddd' : '#444',
                }}
              />
              <Line
                type="monotone"
                dataKey="costOverrun"
                stroke="#4285F4"
                name="Cost Overrun %"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="issues"
                stroke="#EA4335"
                name="Issues"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="timeDelay"
                stroke="#FBBC05"
                name="Time Delay %"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
