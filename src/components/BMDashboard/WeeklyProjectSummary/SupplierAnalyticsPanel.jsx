import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { ENDPOINTS } from '../../../utils/URL';
import {
  analyzeSuppliers,
  rankSuppliers,
  comparisonRows,
  reportRows,
  reportHeaders,
  toCSV,
} from './supplierAnalytics';
import styles from './SupplierPerformanceGraph.module.css';

const api = ENDPOINTS.SUPPLIER_PROJECTS.replace(/\/projects$/, '');
const colors = ['#4caf50', '#2196f3', '#e58a12', '#bb67da', '#e05270'];
export default function SupplierAnalyticsPanel({ projectId, startDate, endDate }) {
  const role = useSelector(state => state.auth?.user?.role);
  const [data, setData] = useState({ records: [], causes: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [ranking, setRanking] = useState('all');
  const [benchmark, setBenchmark] = useState(90);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setStatus('loading');
    setFirst('');
    setSecond('');
    setEditing(null);
    setError('');
    axios
      .get(`${api}/analytics`, { params: { projectId, startDate, endDate } })
      .then(response => {
        if (active) {
          setData(response.data);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [projectId, startDate, endDate]);
  const suppliers = useMemo(() => analyzeSuppliers(data.records, data.causes, period, benchmark), [
    data,
    period,
    benchmark,
  ]);
  const ranked = rankSuppliers(suppliers, ranking);
  const selected = [first, second].filter(Boolean);
  const visible = selected.length ? ranked.filter(s => selected.includes(s.key)) : ranked;
  const chart = comparisonRows(visible);
  const context = `${startDate} to ${endDate}; project=${projectId}; ${period}; ${ranking}; benchmark=${benchmark}%; comparison=${selected.join(
    ' / ',
  ) || 'none'}`;
  const exportReport = async format => {
    try {
      const rows = reportRows(visible, context);
      if (format === 'csv') {
        const url = URL.createObjectURL(
          new Blob(['\uFEFF', toCSV([reportHeaders, ...rows])], { type: 'text/csv;charset=utf-8' }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = 'supplier-analytics.csv';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.text('Supplier analytics', 14, 12);
        autoTable(doc, { head: [reportHeaders], body: rows, startY: 18, styles: { fontSize: 7 } });
        doc.save('supplier-analytics.pdf');
      }
    } catch {
      setError('Export failed. Please try again.');
    }
  };
  const saveTags = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await axios.put(`${api}/root-causes`, {
        supplierKey: editing,
        tags: draft
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      });
      setData(previous => ({
        ...previous,
        causes: [...previous.causes.filter(c => c.supplierKey !== editing), response.data],
      }));
      setEditing(null);
    } catch {
      setError('Unable to save tags. Check permissions and tag lengths, then retry.');
    } finally {
      setSaving(false);
    }
  };
  const select = (id, label, value, change, options) => (
    <label className={styles['supplier-performance-filter-group']} htmlFor={id}>
      {label}
      <select
        id={id}
        className={styles['supplier-performance-select']}
        value={value}
        onChange={e => change(e.target.value)}
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  const options = [['', 'All / no selection'], ...ranked.map(s => [s.key, s.supplierName])];
  if (status === 'loading') return <p role="status">Loading supplier history...</p>;
  if (status === 'error')
    return (
      <p role="alert">
        Unable to load supplier history. Change the date or project filter to retry.
      </p>
    );
  return (
    <section className={styles.analytics} aria-label="Advanced supplier analytics">
      <h5>Historical supplier analytics</h5>
      <div className={styles['supplier-performance-filters']}>
        {select('supplier-period', 'Reporting period', period, setPeriod, [
          ['monthly', 'Monthly'],
          ['quarterly', 'Quarterly'],
          ['yearly', 'Yearly'],
        ])}
        {select(
          'supplier-ranking',
          'Supplier ranking',
          ranking,
          value => {
            setRanking(value);
            setFirst('');
            setSecond('');
          },
          [
            ['all', 'All Suppliers'],
            ['top', 'Top 5 Suppliers'],
            ['bottom', 'Bottom 5 Suppliers'],
          ],
        )}
        <label htmlFor="supplier-benchmark">
          Reporting benchmark (%)
          <input
            id="supplier-benchmark"
            className={styles['supplier-performance-select']}
            type="number"
            min="0"
            max="100"
            value={benchmark}
            onChange={e => setBenchmark(Math.min(100, Math.max(0, Number(e.target.value))))}
          />
        </label>
        {select(
          'supplier-compare-a',
          'Compare supplier A',
          first,
          value => {
            setFirst(value);
            if (value === second) setSecond('');
          },
          options,
        )}
        {select(
          'supplier-compare-b',
          'Compare supplier B',
          second,
          setSecond,
          options.filter(([key]) => !key || key !== first),
        )}
      </div>
      <p>
        History is grouped by observation end date (UTC). Missing periods remain gaps. Ranking uses
        the mean of recorded percentages; delivery counts are unavailable. The reporting benchmark
        applies only where a recorded SLA is missing.
      </p>
      {error && <p role="alert">{error}</p>}
      {!visible.length ? (
        <p>No historical observations for these filters.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart} margin={{ left: 5, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="currentColor" />
              <YAxis domain={[0, 100]} unit="%" stroke="currentColor" />
              <Tooltip formatter={value => `${value}%`} />
              <Legend />
              {visible.map((s, i) => (
                <Line
                  key={s.key}
                  dataKey={row => row[s.key]}
                  name={s.supplierName}
                  stroke={colors[i % colors.length]}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className={styles.tableScroll}>
            <table>
              <caption>Supplier metrics for the selected reporting period</caption>
              <thead>
                <tr>
                  {['Supplier', 'On time', 'Trend / change', 'Risk', 'Root causes'].map(h => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(s => (
                  <tr key={s.key}>
                    <th scope="row">{s.supplierName}</th>
                    <td>{s.average}%</td>
                    <td>
                      {s.trend}
                      {s.delta != null && ` (${s.delta > 0 ? '+' : ''}${s.delta} pp)`}
                    </td>
                    <td>
                      {s.riskLevel}
                      {s.risk != null && ` (${s.risk}/100)`}
                    </td>
                    <td>
                      {s.tags.join(', ') || 'None recorded'}
                      {['Administrator', 'Owner'].includes(role) &&
                        (s.belowTarget || s.tags.length > 0) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(s.key);
                              setDraft(s.tags.join(', '));
                            }}
                          >
                            Edit tags
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editing && (
            <fieldset disabled={saving}>
              <legend>Edit root causes</legend>
              <label htmlFor="supplier-tags">
                Comma-separated tags (up to 10; 80 characters each)
              </label>
              <input
                id="supplier-tags"
                className={styles['supplier-performance-select']}
                value={draft}
                onChange={e => setDraft(e.target.value)}
              />
              <small>
                Examples: Delayed Shipments, Quality Rejections, Material Shortages. Clear to remove
                all.
              </small>
              <button type="button" onClick={saveTags}>
                Save tags
              </button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </fieldset>
          )}
          <button type="button" onClick={() => exportReport('csv')}>
            Export CSV
          </button>{' '}
          <button type="button" onClick={() => exportReport('pdf')}>
            Export PDF
          </button>
        </>
      )}
      <details>
        <summary>Risk and trend methodology</summary>
        <p>
          Risk requires three observed reporting periods. Score (0-100) = 25% times min(100, twice
          the population standard deviation of period means) + 25% times mean absolute change
          between observed periods + 30% times percentage of records below target + 20% times mean
          target shortfall in percentage points. Low: below 30; Medium: 30-59.99; High: 60+. Each
          record uses its SLA, or the explicitly selected benchmark when absent. Trends compare the
          first and last observed period: changes under 2 percentage points are stable. Fewer than
          two periods cannot establish a trend. Tags apply to the supplier across projects. Legacy
          suppliers are matched by exact name until a supplier ID is recorded.
        </p>
      </details>
    </section>
  );
}
