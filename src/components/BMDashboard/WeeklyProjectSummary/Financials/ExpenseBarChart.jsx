import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ExpenseBarChart.module.css';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

export default function ExpenseBarChart() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const rawData = [
          {
            projectId: 'Project A',
            category: 'Plumbing',
            plannedCost: 1000,
            actualCost: 1200,
            date: '2025-04-01',
          },
          {
            projectId: 'Project A',
            category: 'Electrical',
            plannedCost: 1500,
            actualCost: 1300,
            date: '2025-04-01',
          },
          {
            projectId: 'Project B',
            category: 'Plumbing',
            plannedCost: 1100,
            actualCost: 1050,
            date: '2025-04-02',
          },
          {
            projectId: 'Project B',
            category: 'Structural',
            plannedCost: 2200,
            actualCost: 2150,
            date: '2025-04-02',
          },
          {
            projectId: 'Project C',
            category: 'Mechanical',
            plannedCost: 1300,
            actualCost: 1350,
            date: '2025-04-03',
          },
          {
            projectId: 'Project C',
            category: 'Electrical',
            plannedCost: 1400,
            actualCost: 1600,
            date: '2025-04-03',
          },
        ];

        const filtered = rawData.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          // Reset time to start/end of day for proper comparison
          if (start) start.setHours(0, 0, 0, 0);
          if (end) end.setHours(23, 59, 59, 999);
          entryDate.setHours(0, 0, 0, 0);
          const dateMatch = (!start || entryDate >= start) && (!end || entryDate <= end);
          const projectMatch = projectId === '' || entry.projectId === projectId;
          const categoryMatch = categoryFilter === 'ALL' || entry.category === categoryFilter;
          return dateMatch && projectMatch && categoryMatch;
        });

        const aggregated = {};
        filtered.forEach(entry => {
          const key = entry.projectId;
          if (!aggregated[key]) {
            aggregated[key] = { project: key, planned: 0, actual: 0 };
          }
          aggregated[key].planned += entry.plannedCost;
          aggregated[key].actual += entry.actualCost;
        });

        setData(Object.values(aggregated));
      } catch (error) {
        setErrorMessage('Something went wrong while loading chart data.');
      }
    }

    fetchData();
  }, [projectId, categoryFilter, startDate, endDate]);

  return (
    <div className={`${styles.expenseChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.expenseChartTitle}>
        <h4>Planned vs Actual Cost</h4>
        {errorMessage && <div className={styles.expenseChartError}>{errorMessage}</div>}
      </div>

      <div className={styles.expenseChartFilters}>
        <label className={styles.expenseChartFilterLabel}>
          Project:{' '}
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className={styles.expenseChartSelect}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.expenseChartFilterLabel}>
          Category:{' '}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={styles.expenseChartSelect}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.expenseChartFilterLabel}>
          Start Date:{' '}
          <div className={styles.expenseChartDatePickerWrapper}>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || undefined}
              placeholderText="Start date"
              className={styles.expenseChartDatePickerInput}
              wrapperClassName={styles.expenseChartDatePickerInputWrapper}
              style={{
                backgroundColor: darkMode ? '#2b3344' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: `1px solid ${darkMode ? '#3a506b' : '#ccc'}`,
                borderRadius: '4px',
                padding: '0.375rem',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>
        </label>
        <label className={styles.expenseChartFilterLabel}>
          End Date:{' '}
          <div className={styles.expenseChartDatePickerWrapper}>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="End date"
              className={styles.expenseChartDatePickerInput}
              wrapperClassName={styles.expenseChartDatePickerInputWrapper}
              style={{
                backgroundColor: darkMode ? '#2b3344' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: `1px solid ${darkMode ? '#3a506b' : '#ccc'}`,
                borderRadius: '4px',
                padding: '0.375rem',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
          </div>
        </label>
      </div>

      <div className={styles.expenseChartLegend}>
        <span className={styles.expenseChartLegendItem}>
          <span className={styles.expenseChartLegendBox} style={{ backgroundColor: '#4285F4' }} />{' '}
          Planned
        </span>
        <span className={styles.expenseChartLegendItem}>
          <span className={styles.expenseChartLegendBox} style={{ backgroundColor: '#EA4335' }} />{' '}
          Actual
        </span>
      </div>

      <div className={styles.expenseChartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 35, bottom: 35 }}>
            <XAxis
              dataKey="project"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              label={{ value: 'Project Name', position: 'insideBottom', dy: 25, fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 10 }} axisLine tickLine />
            <Bar dataKey="planned" fill="#4285F4" name="Planned">
              <LabelList dataKey="planned" position="top" style={{ fontSize: 8 }} />
            </Bar>
            <Bar dataKey="actual" fill="#EA4335" name="Actual">
              <LabelList dataKey="actual" position="top" style={{ fontSize: 8 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
