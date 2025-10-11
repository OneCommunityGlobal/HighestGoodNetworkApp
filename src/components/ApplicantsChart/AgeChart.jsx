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
import { useSelector } from 'react-redux';
import { useRef, useEffect, useState } from 'react';
import styles from './ApplicationChart.module.css';

function AgeChart({ data, compareLabel }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerRef = useRef(null);
  const [chartColors, setChartColors] = useState({
    gridColor: '#ccc',
    textColor: '#000',
    tooltipBg: '#fff',
    tooltipTextColor: '#000',
    tooltipBorder: '#ccc',
    barColor: '#3b82f6',
  });

  useEffect(() => {
    if (containerRef.current) {
      const computedStyle = getComputedStyle(containerRef.current);
      setChartColors({
        gridColor: computedStyle.getPropertyValue('--grid-color').trim(),
        textColor: computedStyle.getPropertyValue('--text-color').trim(),
        tooltipBg: computedStyle.getPropertyValue('--tooltip-bg').trim(),
        tooltipTextColor: computedStyle.getPropertyValue('--tooltip-text-color').trim(),
        tooltipBorder: computedStyle.getPropertyValue('--tooltip-border').trim(),
        barColor: computedStyle.getPropertyValue('--bar-color').trim(),
      });
    }
  }, [darkMode]);
  const formatTooltip = (value, name, props) => {
    const { change } = props.payload;
    if (compareLabel && change !== undefined) {
      let changeText = '';
      if (change > 0) {
        changeText = `${change}% more than ${compareLabel}`;
      } else if (change < 0) {
        changeText = `${Math.abs(change)}% less than ${compareLabel}`;
      } else {
        changeText = `No change from ${compareLabel}`;
      }
      return [`${value} (${changeText})`, 'Applicants'];
    }
    return [`${value}`, 'Applicants'];
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.ageChartContainer} ${darkMode ? styles.darkMode : ''}`}
    >
      <h2 className={styles.ageChartTitle}>Applicants Grouped by Age</h2>
      <div className={styles.ageChartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} />
            <XAxis
              dataKey="ageGroup"
              label={{
                value: 'Age Group',
                position: 'insideBottom',
                offset: -5,
                fill: chartColors.textColor,
              }}
              tick={{ fill: chartColors.textColor }}
            />
            <YAxis
              label={{
                value: 'Number of Applicants',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                fill: chartColors.textColor,
              }}
              tick={{ fill: chartColors.textColor }}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                color: chartColors.tooltipTextColor,
                border: `1px solid ${chartColors.tooltipBorder}`,
              }}
            />
            <Bar dataKey="applicants" fill={chartColors.barColor}>
              <LabelList dataKey="applicants" position="top" fill={chartColors.textColor} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AgeChart;
