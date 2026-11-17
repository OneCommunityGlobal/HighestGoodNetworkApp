import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MonthPicker from '../LossTrackingLineCharts/MonthPicker';
import useLossTrackingData from './useLossTrackingData';
import {
  filterLossRecords,
  lossByCategory,
  lossByProject,
  lossByMonth,
  totalLoss,
  formatCurrency,
} from './lossTrackingData';
import styles from './LossTrackingSection.module.css';

const CATEGORY_COLORS = {
  Materials: '#3b82f6',
  Labor: '#f59e0b',
  Equipment: '#10b981',
  Waste: '#ef4444',
};

function LossTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const title = label || item.payload?.name || item.name;
    const share = item.payload?.share;
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{title}</div>
        <div>
          {formatCurrency(item.value)}
          {Number.isFinite(share) ? ` (${share}%)` : ''}
        </div>
      </div>
    );
  }
  return null;
}

LossTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

LossTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
};

export default function LossTrackingSection() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const { records, isSample } = useLossTrackingData();
  const [project, setProject] = useState('All');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  const projects = useMemo(() => ['All', ...new Set(records.map(r => r.project))], [records]);
  const months = useMemo(() => records.map(r => r.date).sort((a, b) => a.localeCompare(b)), [
    records,
  ]);
  const minMonth = months[0] || '';
  const maxMonth = months[months.length - 1] || '';

  const filtered = useMemo(() => filterLossRecords(records, { project, startMonth, endMonth }), [
    records,
    project,
    startMonth,
    endMonth,
  ]);
  const byCategory = useMemo(() => lossByCategory(filtered), [filtered]);
  const byProject = useMemo(() => lossByProject(filtered), [filtered]);
  const byMonth = useMemo(() => lossByMonth(filtered), [filtered]);
  const total = totalLoss(filtered);

  const axisColor = darkMode ? '#cbd5e1' : '#374151';
  const gridColor = darkMode ? 'rgb(255 255 255 / 12%)' : 'rgb(0 0 0 / 10%)';
  const tickProps = { fill: axisColor, fontSize: 12 };

  const resetFilters = () => {
    setProject('All');
    setStartMonth('');
    setEndMonth('');
  };

  return (
    <section
      className={`${styles.section} ${darkMode ? styles.dark : ''}`}
      aria-label="Loss tracking"
    >
      <div className={styles.header}>
        {isSample && <span className={styles.sampleBadge}>Sample data</span>}
      </div>

      <div className={styles.filters}>
        <label className={styles.field} htmlFor="loss-project-filter">
          <span>Project</span>
          <select
            id="loss-project-filter"
            value={project}
            onChange={e => setProject(e.target.value)}
          >
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.field}>
          <span>Start month</span>
          <MonthPicker
            ariaLabel="Start month"
            value={startMonth}
            onChange={setStartMonth}
            min={minMonth}
            max={endMonth || maxMonth}
          />
        </div>
        <div className={styles.field}>
          <span>End month</span>
          <MonthPicker
            ariaLabel="End month"
            value={endMonth}
            onChange={setEndMonth}
            min={startMonth || minMonth}
            max={maxMonth}
          />
        </div>
        <button type="button" className={styles.resetButton} onClick={resetFilters}>
          Reset
        </button>
        <div className={styles.total}>
          Total loss: <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No losses for the selected filters.</p>
      ) : (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Loss by category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {byCategory.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<LossTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className={styles.legend}>
              {byCategory.map(entry => (
                <li key={entry.name} className={styles.legendItem}>
                  <span
                    className={styles.swatch}
                    style={{ background: CATEGORY_COLORS[entry.name] || '#94a3b8' }}
                  />
                  {entry.name} – {entry.share}%
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Loss by project</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byProject} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={tickProps} tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="name" width={150} tick={tickProps} />
                <Tooltip content={<LossTooltip />} cursor={{ fill: gridColor }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${styles.card} ${styles.wide}`}>
            <h3 className={styles.cardTitle}>Loss over time (monthly)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={byMonth} margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke={gridColor} />
                <XAxis dataKey="label" tick={tickProps} />
                <YAxis tick={tickProps} tickFormatter={formatCurrency} width={70} />
                <Tooltip content={<LossTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
