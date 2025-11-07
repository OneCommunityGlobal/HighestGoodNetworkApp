import axios from 'axios';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
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

/* eslint-disable react/prop-types */
function ExpenditureChart({ projectId }) {
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
        const res = await axios.get(
          `${process.env.REACT_APP_APIENDPOINT}/bm/expenditure/${projectId}/pie`,
        );
        setActual(res.data.actual);
        setPlanned(res.data.planned);
      } catch (err) {
        setError('Failed to load expenditure data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const renderChart = (data, title) => (
    <div className={styles.expenditure - chart - card}>
      <h4 className={styles.expenditure - chart - title}>{title}</h4>
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
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" height={20} />
      </PieChart>
    </div>
  );

  if (loading)
    return <div className={styles.expenditure - chart - loading}>Loading expenditure data...</div>;
  if (error) return <div className={styles.expenditure - chart - error}>{error}</div>;

  return (
    <div className={styles.expenditure - chart - wrapper}>
      {renderChart(normalizeData(actual), 'Actual Expenditure')}
      {renderChart(normalizeData(planned), 'Planned Expenditure')}
    </div>
  );
}

export default ExpenditureChart;
