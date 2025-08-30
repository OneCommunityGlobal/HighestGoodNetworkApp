import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Select, DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';

import { fetchInjuriesOverTime } from '../../../actions/bmdashboard/injuryActions';
import styles from './InjuriesOverTimeChart.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const shortId = id => (id ? String(id).slice(-6) : 'unknown');

const generateColors = n =>
  Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 / Math.max(n, 1)) * i)},60%,55%)`);

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload
        .filter(p => p.value != null && Number(p.value) > 0)
        .map(p => (
          <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                width: 10,
                height: 10,
                background: p.color,
                display: 'inline-block',
                borderRadius: 2,
              }}
            />
            <span>{p.name}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
    </div>
  );
}

function InjuriesOverTimeLine({ darkMode = false }) {
  const dispatch = useDispatch();

  const rawData = useSelector(state => state.bmInjury?.injuryOverTimeData || []);

  const [loading, setLoading] = useState(false);

  const [selProjects, setSelProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selInjTypes, setSelInjTypes] = useState([]);
  const [selDepts, setSelDepts] = useState([]);
  const [selSeverities, setSelSeverities] = useState([]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchInjuriesOverTime({
        projectId: selProjects,
        date: dateRange,
        injuryType: selInjTypes,
        department: selDepts,
        severity: selSeverities,
      }),
    ).finally(() => setLoading(false));
  }, [dispatch, selProjects, selInjTypes, selDepts, dateRange, selSeverities]);

  const allProjects = useMemo(() => {
    const ids = Array.from(new Set(rawData.map(r => String(r.projectId)).filter(Boolean)));
    return ids.map(id => ({ id, label: `Project …${shortId(id)}` }));
  }, [rawData]);

  const allDepartments = useMemo(
    () => Array.from(new Set(rawData.map(r => r.department).filter(Boolean))),
    [rawData],
  );

  const allInjuryTypes = useMemo(
    () => Array.from(new Set(rawData.map(r => r.injuryType).filter(Boolean))),
    [rawData],
  );

  const allSeverities = useMemo(
    () => Array.from(new Set(rawData.map(r => r.severity).filter(Boolean))),
    [rawData],
  );

  const filtered = useMemo(() => {
    const [start, end] = dateRange || [null, null];
    return rawData.filter(r => {
      const pid = String(r.projectId);
      const keepProject = selProjects.length === 0 || selProjects.includes(pid);
      const keepDept = selDepts.length === 0 || selDepts.includes(r.department);
      const keepType = selInjTypes.length === 0 || selInjTypes.includes(r.injuryType);
      const keepSev = selSeverities.length === 0 || selSeverities.includes(r.severity);
      if (!r.date) return false;

      let keepDate = true;
      const d = dayjs(r.date);
      if (start && !end) keepDate = d.isSame(start, 'day') || d.isAfter(start);
      if (!start && end) keepDate = d.isSame(end, 'day') || d.isBefore(end);
      if (start && end)
        keepDate =
          (d.isSame(start, 'day') || d.isAfter(start)) && (d.isSame(end, 'day') || d.isBefore(end));

      return keepProject && keepDept && keepType && keepSev && keepDate;
    });
  }, [rawData, selProjects, selDepts, selInjTypes, selSeverities, dateRange]);

  const visibleProjectIds = useMemo(
    () => Array.from(new Set(filtered.map(r => String(r.projectId)))),
    [filtered],
  );
  const visibleProjects = useMemo(
    () => visibleProjectIds.map(id => ({ id, label: `Project …${shortId(id)}` })),
    [visibleProjectIds],
  );

  const chartData = useMemo(() => {
    const totals = new Map();
    filtered.forEach(r => {
      const monthIdx = dayjs(r.date).month();
      const pid = String(r.projectId);
      const key = `${monthIdx}|${pid}`;
      totals.set(key, (totals.get(key) || 0) + (Number(r.count) || 0));
    });

    const rows = MONTHS.map((month, idx) => {
      const row = { month };
      visibleProjects.forEach(({ id }) => {
        const v = totals.get(`${idx}|${id}`) || 0;
        row[id] = v > 0 ? v : null;
      });
      return row;
    });

    return rows;
  }, [filtered, visibleProjects]);

  const lineColors = useMemo(() => generateColors(visibleProjects.length || 1), [
    visibleProjects.length,
  ]);

  const maxY = Math.max(...chartData.flatMap(row => visibleProjects.map(p => row[p.id] || 0)), 0);

  const step = Math.ceil(maxY / 5);
  const ticks = Array.from({ length: 6 }, (_, i) => i * step);

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.wrapperDark : ''}`}>
      <h2 className={styles.title}>Injuries over time</h2>

      <div className={styles.filters}>
        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Projects"
          value={selProjects}
          onChange={setSelProjects}
          maxTagCount="responsive"
          maxTagPlaceholder={o => `+${o.length}`}
        >
          {allProjects.map(p => (
            <Option key={p.id} value={p.id}>
              {p.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          className={styles.filterSelect}
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
        />

        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Injury Types"
          value={selInjTypes}
          onChange={setSelInjTypes}
          maxTagCount="responsive"
          maxTagPlaceholder={o => `+${o.length}`}
        >
          {allInjuryTypes.map(t => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>

        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Departments"
          value={selDepts}
          onChange={setSelDepts}
          maxTagCount="responsive"
          maxTagPlaceholder={o => `+${o.length}`}
        >
          {allDepartments.map(d => (
            <Option key={d} value={d}>
              {d}
            </Option>
          ))}
        </Select>

        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Severity"
          value={selSeverities}
          onChange={setSelSeverities}
          maxTagCount="responsive"
          maxTagPlaceholder={o => `+${o.length}`}
        >
          {allSeverities.map(s => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : visibleProjects?.length > 0 ? (
        <div className={`${styles.chartCard} ${darkMode ? styles.chartCardDark : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={darkMode ? 0.2 : 1} />
              <XAxis dataKey="month" height={60} angle={-25} textAnchor="end" interval={0} />
              <YAxis
                label={{ value: 'Injury Count', angle: -90, position: 'insideLeft' }}
                allowDecimals={false}
                domain={[0, maxY]}
                ticks={ticks}
              />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 20 }} />
              {visibleProjects.map((proj, idx) => (
                <Line
                  key={proj.id}
                  type="linear"
                  dataKey={proj.id}
                  name={proj.label}
                  stroke={lineColors[idx]}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                >
                  <LabelList
                    position="top"
                    content={props => {
                      const { x, y, value } = props;
                      if (!value || value <= 0) return null;
                      return (
                        <text
                          x={x}
                          y={y - 6}
                          fill={lineColors[idx]}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={`${styles.noData} ${darkMode ? styles.noDataDark : ''}`}>No Data Available</p>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state?.theme?.darkMode,
});

export default connect(mapStateToProps)(InjuriesOverTimeLine);
