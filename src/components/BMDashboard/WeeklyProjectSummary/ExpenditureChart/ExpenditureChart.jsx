import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Spinner } from 'reactstrap';
import { getProjectExpenditure } from './mockExpenditureData';
import styles from './ExpenditureChart.module.css';
import { getTooltipStyles } from '../../../../utils/bmChartStyles';

const COLORS = ['#6777EF', '#A0CD61', '#F5CD4B'];
const CATEGORIES = ['Labor', 'Equipment', 'Materials'];

function normalizeData(data) {
  const normalized = CATEGORIES.map(cat => {
    const found = data.find(d => d.category === cat);
    return found || { category: cat, amount: 0 };
  });
  // Check if all amounts are zero for "No Data" check
  const hasData = normalized.some(d => d.amount > 0);
  return { normalized, hasData };
}

// ... (renderCustomLabel remains the same) ...
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent === 0) return null; // Don't show labels for 0%
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
      try {
        // Simulating delay for feedback (Requirement #1)
        await new Promise(resolve => setTimeout(resolve, 400));
        const data = getProjectExpenditure(projectId);
        setActual(data.actual);
        setPlanned(data.planned);
      } catch (err) {
        setError('Failed to load expenditure data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const renderChart = (rawItems, title) => {
    const { normalized, hasData } = normalizeData(rawItems);

    return (
      <div
        className={styles.expenditureChartCard}
        style={{ position: 'relative', minHeight: '300px' }}
      >
        <h4 className={styles.expenditureChartTitle}>{title}</h4>

        {!hasData ? (
          /* Graceful Reset / No Data State (Requirement #3) */
          <div
            style={{
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '0.9rem',
            }}
          >
            No {title.toLowerCase()} recorded.
          </div>
        ) : (
          <PieChart width={280} height={280}>
            <Pie
              data={normalized}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomLabel}
              labelLine={false}
              stroke="none"
            >
              {normalized.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...getTooltipStyles(darkMode)} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} />
          </PieChart>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div
        className={styles.expenditureChartWrapper}
        style={{ justifyContent: 'center', padding: '50px' }}
      >
        <Spinner color="primary" />{' '}
        <span style={{ marginLeft: '10px' }}>Loading Financials...</span>
      </div>
    );

  if (error) return <div className={styles.expenditureChartError}>{error}</div>;

  return (
    <div className={styles.expenditureChartWrapper}>
      {renderChart(actual, 'Actual Expenditure')}
      {renderChart(planned, 'Planned Expenditure')}
    </div>
  );
}

ExpenditureChart.propTypes = { projectId: PropTypes.string.isRequired };
export default ExpenditureChart;
