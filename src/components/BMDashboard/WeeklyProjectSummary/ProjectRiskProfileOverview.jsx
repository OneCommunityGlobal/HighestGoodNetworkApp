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

  const allSpanRef = useRef(null);
  const dateSpanRef = useRef(null);

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
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  if (loading) return <div className={`${styles.loading}`}>Loading project risk profiles...</div>;
  if (error) return <div className={`${styles.error}`}>{error}</div>;

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.headerRow}`}>
          <h2 className={`${styles.heading}`}>Overall Risk Profile</h2>

          <div className={`${styles.filterRow}`}>
            {/* Project Dropdown */}
            <div className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Project</span>
              <button
                ref={allSpanRef}
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
                  />
                </div>
              )}
            </div>

            {/* Date Dropdown */}
            <div className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Dates</span>
              <button
                ref={dateSpanRef}
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
                stroke={darkMode ? '#3a3a3a' : '#e8e8e8'}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="projectName"
                angle={-45}
                textAnchor="end"
                height={110}
                tick={{ fontSize: 13, fill: darkMode ? '#888' : '#666', fontWeight: 500 }}
                axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1.5 }}
                tickLine={{ stroke: darkMode ? '#555' : '#d5d5d5' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: darkMode ? '#888' : '#666', fontWeight: 500 }}
                axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1.5 }}
                tickLine={{ stroke: darkMode ? '#555' : '#d5d5d5' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  border: `2px solid ${darkMode ? '#666' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  padding: '14px',
                  color: darkMode ? '#fff' : '#333',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                cursor={{ fill: 'rgba(66, 133, 244, 0.08)' }}
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
        </div>
      </div>
    </div>
  );
}
