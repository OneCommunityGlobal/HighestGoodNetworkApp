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

const shortId = id => (id ? String(id).slice(-6) : 'unknown');
const generateColors = n =>
  Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 / Math.max(n, 1)) * i)},60%,55%)`);

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload
        .filter(p => p?.value != null && Number(p.value) > 0)
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
    const keysSet = new Set(filtered.map(r => dayjs(r.date).format('YYYY-MM')));
    const monthKeys = Array.from(keysSet).sort();

    const totals = new Map();
    filtered.forEach(r => {
      const k = dayjs(r.date).format('YYYY-MM');
      const pid = String(r.projectId);
      const mapKey = `${k}|${pid}`;
      totals.set(mapKey, (totals.get(mapKey) || 0) + (Number(r.count) || 0));
    });

    return monthKeys.map(k => {
      const label = dayjs(k + '-01').format('MMM YYYY');
      const row = { month: label, _k: k };
      visibleProjects.forEach(({ id }) => {
        const v = totals.get(`${k}|${id}`) || 0;
        row[id] = v > 0 ? v : null;
      });
      return row;
    });
  }, [filtered, visibleProjects]);

  const { yTicks, yDomain } = useMemo(() => {
    let dataMax = 0;
    for (const row of chartData) {
      for (const { id } of visibleProjects) {
        const v = row[id];
        if (typeof v === 'number' && v > dataMax) dataMax = v;
      }
    }

    const divisions = 5;
    if (dataMax <= 0) {
      return {
        yTicks: Array.from({ length: divisions + 1 }, (_, i) => i),
        yDomain: [0, divisions],
      };
    }

    const rawStep = Math.ceil(dataMax / divisions);
    const step = Math.max(1, rawStep);
    const niceMax = step * divisions;
    const ticks = Array.from({ length: divisions + 1 }, (_, i) => i * step);
    return { yTicks: ticks, yDomain: [0, niceMax] };
  }, [chartData, visibleProjects]);

  const lineColors = useMemo(() => generateColors(visibleProjects.length || 1), [
    visibleProjects.length,
  ]);

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.wrapperDark : ''}`}>
      <h2 className={styles.title}>Injuries over time (Jan 1 2024 - Dec 31 2024)</h2>

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
          popupClassName={darkMode ? 'wrapperDark-dropdown' : ''}
        >
          {allProjects.map(p => (
            <Option className={styles.filterOptions} key={p.id} value={p.id}>
              {p.label}
            </Option>
          ))}
        </Select>

        <RangePicker
          className={styles.filterSelect}
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
          popupClassName={darkMode ? 'wrapperDark-dropdown' : ''}
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
          popupClassName={darkMode ? 'wrapperDark-dropdown' : ''}
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
          popupClassName={darkMode ? 'wrapperDark-dropdown' : ''}
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
          popupClassName={darkMode ? 'wrapperDark-dropdown' : ''}
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
              <CartesianGrid
                stroke={darkMode ? '#2f3b4a' : '#e5e7eb'}
                strokeDasharray="3 3"
                strokeOpacity={darkMode ? 0.2 : 1}
              />
              <XAxis dataKey="month" height={60} angle={-25} textAnchor="end" interval={0} />
              <YAxis
                label={{ value: 'Injury Count', angle: -90, position: 'insideLeft' }}
                allowDecimals={false}
                domain={yDomain}
                ticks={yTicks}
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
