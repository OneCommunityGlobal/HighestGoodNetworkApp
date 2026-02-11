import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
// import httpService from '../../../../services/httpService';
import { getProjectExpenditure } from './mockExpenditureData';
import styles from './ExpenditureChart.module.css';

const COLORS = ['#6777EF', '#A0CD61', '#F5CD4B'];
const CATEGORIES = ['Labor', 'Equipment', 'Materials'];

function normalizeData(data) {
  return CATEGORIES.map(cat => {
    const found = data.find(d => d.category === cat);
    return found || { category: cat, amount: 0 };
  });
}

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="600"
    >
      {`${name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

function ExpenditureChart({ projectId }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [actual, setActual] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        // Using mock data instead of API call
        const data = getProjectExpenditure(projectId);
        setActual(data.actual);
        setPlanned(data.planned);
        // Original API call (commented out for mock data)
        // const res = await httpService.get(
        //   `${process.env.REACT_APP_APIENDPOINT}/bm/expenditure/${projectId}/pie`,
        // );
        // setActual(res.data.actual);
        // setPlanned(res.data.planned);
      } catch (err) {
        setError('Failed to load expenditure data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const renderChart = (data, title) => (
    <div className={styles.expenditureChartCard}>
      <h4 className={styles.expenditureChartTitle}>{title}</h4>
      <PieChart width={280} height={280}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={renderCustomLabel}
          labelLine={false}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry.category || index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? '#2c3344' : '#fff',
            border: `1px solid ${darkMode ? '#364156' : '#ccc'}`,
            color: darkMode ? '#e0e0e0' : '#333',
          }}
          itemStyle={{
            color: darkMode ? '#e0e0e0' : '#333',
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          height={20}
          wrapperStyle={{
            color: darkMode ? '#e0e0e0' : '#333',
          }}
          iconSize={10}
        />
      </PieChart>
    </div>
  );

  if (loading)
    return <div className={styles.expenditureChartLoading}>Loading expenditure data...</div>;
  if (error) return <div className={styles.expenditureChartError}>{error}</div>;

  return (
    <div className={styles.expenditureChartWrapper}>
      {renderChart(normalizeData(actual), 'Actual Expenditure')}
      {renderChart(normalizeData(planned), 'Planned Expenditure')}
    </div>
  );
}

ExpenditureChart.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default ExpenditureChart;
