import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchInjuryProjects, fetchInjuryTrend } from '../../../actions/bmdashboard/injuryActions';
import './InjuryTrendChart.css';

const toYMD = d =>
  d instanceof Date && !isNaN(d)
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
    : '';

function InjuryTrendChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const {
    projects = [],
    trend = { months: [], serious: [], medium: [], low: [] },
    loading,
    error,
  } = useSelector(state => state.bmInjury || {});

  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    dispatch(fetchInjuryProjects({}));
  }, [dispatch]);

  useEffect(() => {
    const params = {
      projectId: selectedProject?.value || '',
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
    };
    dispatch(fetchInjuryTrend(params));
  }, [dispatch, selectedProject, startDate, endDate]);

  // Make the page background full-width and dark on this page only
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('injury-dark-body');
    } else {
      document.body.classList.remove('injury-dark-body');
    }
    return () => {
      document.body.classList.remove('injury-dark-body');
    };
  }, [darkMode]);

  const projectOptions = useMemo(() => {
    return (projects || []).map(p => ({ value: String(p._id), label: p.name }));
  }, [projects]);

  // Transform backend series into recharts consumable array
  const chartData = useMemo(() => {
    let months = Array.isArray(trend.months) ? trend.months : [];
    const serious = Array.isArray(trend.serious) ? trend.serious : [];
    const medium = Array.isArray(trend.medium) ? trend.medium : [];
    const low = Array.isArray(trend.low) ? trend.low : [];

    // Fallback: if API returns no months, synthesize last 12 months so UI isn't blank
    if (months.length === 0) {
      const names = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const now = new Date();
      const list = [];
      for (let i = 11; i >= 0; i -= 1) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        list.push(names[d.getUTCMonth()]);
      }
      months = list;
    }

    return months.map((m, i) => ({
      month: m,
      serious: Number(serious[i]) || 0,
      medium: Number(medium[i]) || 0,
      low: Number(low[i]) || 0,
    }));
  }, [trend]);

  const tickColor = darkMode ? '#ccc' : '#666';
  const hasAnyData = useMemo(() => {
    const s = Array.isArray(trend.serious) ? trend.serious : [];
    const m = Array.isArray(trend.medium) ? trend.medium : [];
    const l = Array.isArray(trend.low) ? trend.low : [];
    const sum = [...s, ...m, ...l].reduce((acc, v) => acc + (Number(v) || 0), 0);
    return sum > 0;
  }, [trend]);

  return (
    <div className={`injury-trend-container ${darkMode ? 'darkMode' : ''}`}>
      <div className="injury-trend-header">
        <h3 className="injury-trend-title">Injury Trend Over Time</h3>
        <div className="injury-trend-filters">
          <div className="filter-item">
            <label htmlFor="injury-project-select">Project</label>
            <Select
              classNamePrefix="injury-select"
              isClearable
              placeholder="All projects"
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              inputId="injury-project-select"
            />
          </div>
          <div className="filter-item">
            <label htmlFor="injury-date-range">Date range</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={setDateRange}
              placeholderText="Select date range"
              isClearable
              className="injury-datepicker"
              id="injury-date-range"
            />
          </div>
        </div>
      </div>

      <div className="injury-trend-chart-wrapper">
        {/* Quick add button for local/dev testing; remove when dedicated page exists */}

        {loading && <div style={{ marginBottom: 8, color: tickColor }}>Loading injury trend…</div>}
        {error && (
          <div style={{ marginBottom: 8, color: '#c00' }}>
            Failed to load injury trend: {String(error)}
          </div>
        )}
        {!loading && !error && !hasAnyData && (
          <div style={{ marginBottom: 8, color: tickColor }}>
            No injuries recorded for the selected filters.
          </div>
        )}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
            <CartesianGrid
              stroke={darkMode ? 'rgba(255,255,255,0.12)' : '#e0e0e0'}
              strokeDasharray="3 3"
            />
            <XAxis dataKey="month" tick={{ fill: tickColor }} tickSize={10} />
            <YAxis
              tick={{ fill: tickColor }}
              tickSize={10}
              allowDecimals={false}
              label={{
                value: 'Number of Injuries',
                angle: -90,
                position: 'insideLeft',
                style: { fill: tickColor },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1e2736' : '#ffffff',
                borderColor: darkMode ? '#2d3a4d' : '#dddddd',
                color: tickColor,
              }}
              labelStyle={{ color: tickColor }}
              itemStyle={{ color: tickColor }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: tickColor }} />
            <Line
              type="monotone"
              dataKey="serious"
              name="Serious"
              stroke="#dc3545"
              strokeWidth={2}
              dot
            >
              <LabelList
                dataKey="serious"
                position="top"
                style={{ fill: '#dc3545', fontSize: 10 }}
              />
            </Line>
            <Line
              type="monotone"
              dataKey="medium"
              name="Medium"
              stroke="#fd7e14"
              strokeWidth={2}
              dot
            >
              <LabelList
                dataKey="medium"
                position="top"
                style={{ fill: '#fd7e14', fontSize: 10 }}
              />
            </Line>
            <Line type="monotone" dataKey="low" name="Low" stroke="#28a745" strokeWidth={2} dot>
              <LabelList dataKey="low" position="top" style={{ fill: '#28a745', fontSize: 10 }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default InjuryTrendChart;
