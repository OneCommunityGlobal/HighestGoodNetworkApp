import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import httpService from '../../../services/httpService';
import styles from './IssueBreakdownChart.module.css';

const COLORS = {
  equipmentIssues: '#4F81BD', // blue
  laborIssues: '#C0504D', // red
  materialIssues: '#F3C13A', // yellow
};

export default function IssuesBreakdownChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Enhanced color scheme with better accessibility
  const textColor = darkMode ? '#f7fafc' : '#1a202c';
  const gridColor = darkMode ? '#4a5568' : '#e2e8f0';
  const tooltipBg = darkMode ? '#2d3748' : '#ffffff';
  const tooltipBorder = darkMode ? '#4a5568' : '#e2e8f0';
  const headingColor = darkMode ? '#f7fafc' : '#2d3748';
  const legendTextColor = darkMode ? '#e2e8f0' : '#4a5568';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/issues/breakdown`,
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch issue statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{ color: textColor }}>Loading...</div>;
  if (error) return <div style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>Error: {error}</div>;
  if (!data || data.length === 0) return <div style={{ color: textColor }}>No data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading} style={{ color: headingColor }}>
            Issues breakdown by Type
          </h2>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span
              className={styles.legendBox}
              style={{ backgroundColor: COLORS.equipmentIssues }}
            />
            <span className={styles.legendLabel} style={{ color: legendTextColor }}>
              Equipment Issues
            </span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.laborIssues }} />
            <span className={styles.legendLabel} style={{ color: legendTextColor }}>
              Labor Issues
            </span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.materialIssues }} />
            <span className={styles.legendLabel} style={{ color: legendTextColor }}>
              Materials Issues
            </span>
          </span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeWidth={1} />
            <XAxis
              dataKey="projectName"
              tick={{
                fill: textColor,
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fill: textColor,
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: textColor,
                boxShadow: darkMode
                  ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                  : '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '13px',
                fontWeight: '500',
              }}
              labelStyle={{
                color: textColor,
                fontWeight: '600',
                marginBottom: '4px',
              }}
              itemStyle={{
                color: textColor,
                fontWeight: '500',
              }}
              cursor={{
                fill: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }}
            />
            <Bar dataKey="equipmentIssues" name="Equipment Issues" fill={COLORS.equipmentIssues}>
              <LabelList
                dataKey="equipmentIssues"
                position="top"
                fill={textColor}
                fontSize={11}
                fontWeight={600}
                offset={4}
              />
            </Bar>
            <Bar dataKey="laborIssues" name="Labor Issues" fill={COLORS.laborIssues}>
              <LabelList
                dataKey="laborIssues"
                position="top"
                fill={textColor}
                fontSize={11}
                fontWeight={600}
                offset={4}
              />
            </Bar>
            <Bar dataKey="materialIssues" name="Materials Issues" fill={COLORS.materialIssues}>
              <LabelList
                dataKey="materialIssues"
                position="top"
                fill={textColor}
                fontSize={11}
                fontWeight={600}
                offset={4}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
