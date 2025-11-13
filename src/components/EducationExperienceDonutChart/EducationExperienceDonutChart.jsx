import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import styles from './EducationExperienceDonutChart.module.css';

/** ---------- Stable color mapping by category ---------- */
const COLOR_BY_CATEGORY = {
  'High School': '#FF4D4F',
  "Associate's Degree": '#FFC107',
  "Bachelor's Degree": '#1890FF',
  "Master's Degree": '#00C49F',
  "Bachelor's Degree + Experience": '#8884D8',
  "Master's Degree + Experience": '#00BFFF',
};

const ORDERED_CATEGORIES = [
  'High School',
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Bachelor's Degree + Experience",
  "Master's Degree + Experience",
];

/** ---------- Dummy rows (have role & date so filters work) ---------- */
const DUMMY_ROWS = [
  { category: "Master's Degree", value: 12, role: 'Frontend Developer', date: '2025-07-30' },
  { category: "Master's Degree", value: 10, role: 'Backend Developer', date: '2025-08-01' },
  {
    category: "Master's Degree + Experience",
    value: 15,
    role: 'Frontend Developer',
    date: '2025-08-02',
  },
  { category: "Bachelor's Degree", value: 20, role: 'Backend Developer', date: '2025-07-28' },
  {
    category: "Bachelor's Degree + Experience",
    value: 18,
    role: 'Data Engineer',
    date: '2025-08-03',
  },
  { category: "Associate's Degree", value: 9, role: 'Frontend Developer', date: '2025-07-25' },
  { category: 'High School', value: 6, role: 'QA Engineer', date: '2025-08-04' },
];

/** ---------- Helpers ---------- */
const toDateOnlyString = d => (d ? d.toISOString().split('T')[0] : null);

const useIsMobile = (bp = 640) => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w < bp;
};

const summarizeRolesForCenter = (selectedRoles, isMobile) => {
  if (!selectedRoles?.length) return 'ALL ROLES';
  const names = selectedRoles.map(r => r.value);
  if (!isMobile) return names.join(', ');

  // Mobile: show "FirstRole [+N more]" and clamp first role length
  const first = names[0] || '';
  const firstClamped = first.length > 18 ? first.slice(0, 18) + '…' : first;
  const rest = names.length - 1;
  return rest > 0 ? `${firstClamped} +${rest} more` : firstClamped;
};

const formatDatesForCenter = (startDate, endDate) => {
  if (!startDate && !endDate) return 'ALL DATES';
  return `${toDateOnlyString(startDate) || '…'} → ${toDateOnlyString(endDate) || '…'}`;
};

const EducationExperienceDonutChart = () => {
  // Swap to fetched rows later; using dummy for now
  const [rows] = useState(DUMMY_ROWS);
  const [startDate, setStartDate] = useState(null); // All dates by default
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]); // All roles when empty
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile(640);
  const darkMode = useSelector(state => state.theme?.darkMode);

  /** Role dropdown options */
  const roleOptions = useMemo(() => {
    const uniq = Array.from(new Set(rows.map(r => r.role)));
    return uniq.map(r => ({ label: r, value: r }));
  }, [rows]);

  /** Filter + aggregate into pie data */
  const data = useMemo(() => {
    try {
      const s = toDateOnlyString(startDate);
      const e = toDateOnlyString(endDate);
      const selected = new Set(selectedRoles.map(r => r.value));

      const inRange = d => {
        if (!s && !e) return true;
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      };
      const roleMatch = r => (selected.size === 0 ? true : selected.has(r));

      const filtered = rows.filter(r => inRange(r.date) && roleMatch(r.role));

      const byCat = filtered.reduce((acc, cur) => {
        acc[cur.category] = (acc[cur.category] || 0) + cur.value;
        return acc;
      }, {});

      return ORDERED_CATEGORIES.map(cat => ({ category: cat, value: byCat[cat] || 0 })).filter(
        d => d.value > 0,
      );
    } catch (err) {
      setError('Failed to process data');
      return [];
    }
  }, [rows, startDate, endDate, selectedRoles]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  /** Center text lines (roles / dates / total) */
  const centerLine1 = useMemo(() => summarizeRolesForCenter(selectedRoles, isMobile), [
    selectedRoles,
    isMobile,
  ]);
  const centerLine2 = useMemo(() => formatDatesForCenter(startDate, endDate), [startDate, endDate]);

  /** Adaptive labels:
   *  - Desktop: outside with leader, "Category: Count (XX.X%)"
   *  - Mobile: inside slice, percent only; hide on tiny slices
   */
  const renderLabel = props => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, payload } = props;
    const RAD = Math.PI / 180;
    const labelName = name || payload?.category || '';
    const pctText = `${(percent * 100).toFixed(1)}%`;

    if (isMobile) {
      // Mobile: keep things clean—hide very small slices
      if (percent < 0.08) return null;
      const r = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + r * Math.cos(-midAngle * RAD);
      const y = cy + r * Math.sin(-midAngle * RAD);
      return (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#fff">
          {pctText}
        </text>
      );
    }

    // Desktop: outside label
    const r = outerRadius + 18;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const text = `${labelName}: ${value} (${pctText})`;

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fill="#111"
      >
        {text}
      </text>
    );
  };

  if (error) {
    return <div className={styles.error}>Something went wrong: {error}</div>;
  }

  const wrapperClass = `${styles.wrapper} ${darkMode ? styles.wrapperDark : ''}`;
  const headingClass = `${styles.heading} ${darkMode ? styles.headingDark : ''}`;
  const filtersClass = `${styles.filters} ${isMobile ? styles.filtersMobile : ''}`;
  const sectionClass = `${styles.section} ${isMobile ? styles.sectionFull : ''}`;
  const titleClass = `${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`;
  const datePickerClass = `${styles.datePicker} ${darkMode ? 'hgn-datepicker-dark' : ''}`;
  const chartWrapperClass = `${styles.chartWrapper} ${isMobile ? styles.chartWrapperMobile : ''}`;

  return (
    <div aria-label="Breakdown of Candidates by Experience and Educational Level" role="img">
      <div className={wrapperClass}>
        <h2 className={headingClass}>Breakdown of Candidates by Experience and Educational Level</h2>

        {/* Filters */}
        <div className={filtersClass}>
          <div className={sectionClass}>
            <strong className={titleClass}>Dates</strong>
            <div className={styles.datePickers}>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Start Date"
                isClearable
                dateFormat="yyyy-MM-dd"
                maxDate={endDate || undefined}
                className={datePickerClass}
                calendarClassName={darkMode ? 'hgn-datepicker-dark-calendar' : undefined}
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="End Date"
                isClearable
                dateFormat="yyyy-MM-dd"
                minDate={startDate || undefined}
                className={datePickerClass}
                calendarClassName={darkMode ? 'hgn-datepicker-dark-calendar' : undefined}
              />
            </div>
          </div>

          <div className={sectionClass}>
            <strong className={titleClass}>Role</strong>
            <Select
              options={roleOptions}
              isMulti
              onChange={setSelectedRoles}
              placeholder="All Roles"
              value={selectedRoles}
              classNamePrefix="roles"
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
                      multiValue: provided => ({
                        ...provided,
                        backgroundColor: '#2563eb',
                      }),
                      multiValueLabel: provided => ({
                        ...provided,
                        color: '#f8fafc',
                      }),
                    }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Chart / Empty / Loading */}
        {loading ? (
          <div className={styles.message}>Loading…</div>
        ) : total === 0 ? (
          <div className={styles.message}>
            No data for the selected filters. Try widening the date range or clearing roles.
          </div>
        ) : (
          <>
            <div className={chartWrapperClass}>
            <ResponsiveContainer width="100%" height="100%">
              {/* overflow visible so outside labels aren't clipped */}
              <PieChart
                style={{ overflow: 'visible' }}
                margin={{ top: 16, right: 36, bottom: 16, left: 36 }}
              >
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 74 : 95} // slightly larger hole on mobile → more center room
                  outerRadius={isMobile ? 110 : 140}
                  labelLine={!isMobile}
                  label={renderLabel}
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={COLOR_BY_CATEGORY[entry.category]} />
                  ))}

                  {/* Center text (roles/dates/total) */}
                  <Label
                    position="center"
                    content={() => (
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={darkMode ? '#f8fafc' : '#0f172a'}
                      >
                        {/* Roles: each on a new line */}
                        {selectedRoles.length > 0 ? (
                          selectedRoles.map((role, idx) => (
                            <tspan
                              key={role.value}
                              x="50%"
                              dy={idx === 0 ? 0 : '1.2em'} // only add vertical offset after first
                              fontSize={isMobile ? 12 : 14}
                            >
                              {role.value}
                            </tspan>
                          ))
                        ) : (
                          <tspan fontSize={isMobile ? 12 : 14}>ALL ROLES</tspan>
                        )}

                        {/* Dates */}
                        <tspan x="50%" dy="1.2em" fontSize={isMobile ? 10 : 12}>
                          {startDate || endDate
                            ? `${toDateOnlyString(startDate) || '…'} → ${toDateOnlyString(
                                endDate,
                              ) || '…'}`
                            : 'ALL DATES'}
                        </tspan>

                        {/* Total */}
                        <tspan x="50%" dy="1.2em" fontSize={isMobile ? 10 : 12}>
                          Total: {total}
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>

                <Tooltip
                  formatter={(value, name, { payload }) => {
                    const pct = total ? ((payload.value / total) * 100).toFixed(1) : '0.0';
                    return [`${value} (${pct}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mobile: counts list below chart (since slice labels show % only) */}
          {isMobile && (
            <div className={styles.mobileList}>
              {data.map(d => {
                const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={d.category} className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>
                      <span
                        className={styles.swatch}
                        style={{ background: COLOR_BY_CATEGORY[d.category] }}
                      />
                      {d.category}
                    </span>
                    <span className={styles.mobileValue}>
                      {d.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default EducationExperienceDonutChart;
