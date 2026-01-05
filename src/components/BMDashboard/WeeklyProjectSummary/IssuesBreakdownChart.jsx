import { useEffect, useMemo, useState, useRef } from 'react';
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

/** Light palette (unchanged) */
const COLORS_LIGHT = {
  equipmentIssues: '#4F81BD', // blue
  laborIssues: '#C0504D', // red
  materialIssues: '#F3C13A', // yellow
};

/** Dark palette – brighter & higher contrast, inspired by risk-chart style */
const COLORS_DARK = {
  equipmentIssues: '#6AA6FF', // brighter blue
  laborIssues: '#FF7A7A', // brighter red
  materialIssues: '#FFD166', // warm gold
};

export default function IssuesBreakdownChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  const containerRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  /** Theme variables injected into the container so CSS can pick them up */
  const themeVars = useMemo(
    () =>
      darkMode
        ? {
            // container + text
            '--card-bg': '#0f1721',
            '--section-bg': '#0b141b',
            '--text-color': '#C9D1D9',

            // chart specifics
            '--grid-color': '#22303C',
            '--chart-axis-color': '#D1D7E0', // X/Y tick labels
            '--chart-label-color': '#F9FAFB', // numbers on bars
            '--chart-label-outline': 'rgba(0,0,0,0.55)', // subtle dark halo
          }
        : {
            '--card-bg': '#fafbfc',
            '--section-bg': '#ffffff',
            '--text-color': '#4B5563',

            '--grid-color': '#E5E7EB',
            '--chart-axis-color': '#374151',
            '--chart-label-color': '#111827',
            '--chart-label-outline': 'rgba(255,255,255,0.65)', // subtle light halo
          },
    [darkMode],
  );

  /** Derived colors for this render */
  const PALETTE = darkMode ? COLORS_DARK : COLORS_LIGHT;
  const axisColor = themeVars['--chart-axis-color'];
  const gridColor = themeVars['--grid-color'];
  const labelColor = themeVars['--chart-label-color'];
  const tooltipBg = themeVars['--section-bg'];
  const tooltipText = themeVars['--text-color'];

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setIsSmallScreen(width < 700);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await httpService.get(`${process.env.REACT_APP_APIENDPOINT}/issues/breakdown`);
        setData(res.data);
        setError(null);
      } catch (err) {
        setError(err?.message || 'Failed to fetch issue statistics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ color: textColor }}>Loading...</div>;
  if (error) return <div style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>Error: {error}</div>;
  if (!data || data.length === 0) return <div style={{ color: textColor }}>No data available</div>;

  return (
    <div ref={containerRef} className={styles.container} style={themeVars}>
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
              style={{ backgroundColor: PALETTE.equipmentIssues }}
            />
            <span className={styles.legendLabel} style={{ color: legendTextColor }}>
              Equipment Issues
            </span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: PALETTE.laborIssues }} />
            <span className={styles.legendLabel}>Labor Issues</span>
          </span>
          <span className={styles.legendItem}>
            <span
              className={styles.legendBox}
              style={{ backgroundColor: PALETTE.materialIssues }}
            />
            <span className={styles.legendLabel}>Materials Issues</span>
          </span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: isSmallScreen ? 60 : 30 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

            {/* Stronger axis text for dark mode; hide tick/axis lines for cleaner look */}
            <XAxis
              dataKey="projectName"
              tick={{
                fill: axisColor,
                fontWeight: 600,
                fontSize: isSmallScreen ? 10 : 12,
              }}
              angle={isSmallScreen ? -45 : 0}
              textAnchor={isSmallScreen ? 'end' : 'middle'}
              height={isSmallScreen ? 70 : 30}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: axisColor, fontWeight: 600, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: '1px solid rgba(128,128,128,0.25)',
                borderRadius: 8,
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipText, fontWeight: 600 }}
              itemStyle={{ color: tooltipText }}
            />

            <Bar
              dataKey="equipmentIssues"
              name="Equipment Issues"
              fill={PALETTE.equipmentIssues}
              radius={[4, 4, 0, 0]}
            >
              <LabelList dataKey="equipmentIssues" position="top" fill={labelColor} />
            </Bar>

            <Bar
              dataKey="laborIssues"
              name="Labor Issues"
              fill={PALETTE.laborIssues}
              radius={[4, 4, 0, 0]}
            >
              <LabelList dataKey="laborIssues" position="top" fill={labelColor} />
            </Bar>

            <Bar
              dataKey="materialIssues"
              name="Materials Issues"
              fill={PALETTE.materialIssues}
              radius={[4, 4, 0, 0]}
            >
              <LabelList dataKey="materialIssues" position="top" fill={labelColor} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
