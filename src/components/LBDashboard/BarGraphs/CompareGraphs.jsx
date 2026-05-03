import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { Card, CardBody } from 'reactstrap';
import styles from '../LBDashboard.module.css';

export function CompareBarGraph({
  title,
  metricLabel,
  tooltipLabel,
  showMetricPill = false,
  orientation,
  data,
  nameKey,
  valueKey,
  xLabel,
  yLabel,
  barColor = '#3b82f6',
  valueFormatter = v => v,
  headerChips = [],
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  barSize,
  height = 420,
  yCategoryWidth = 70,
  margins = { top: 16, right: 20, bottom: 46, left: 0 },
  maxBars,
  showYAxisTitle = true,
  yTickFormatter,
  darkMode = false,
}) {
  const isHorizontal = orientation === 'horizontal';
  const tickColor = darkMode ? '#e1e1e1' : '#444';
  const gridColor = darkMode ? '#3a506b' : '#e0e0e0';

  return (
    <Card
      className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}
      style={
        darkMode ? { background: '#1c2541', borderColor: '#3a506b', color: '#e1e1e1' } : undefined
      }
    >
      <CardBody className={`${styles.graphCardBody} ${darkMode ? styles.darkCardBody : ''}`}>
        {/* Title row + chips */}
        <div
          className={styles.graphTitle}
          style={{ display: 'flex', alignItems: 'center', color: darkMode ? '#e1e1e1' : undefined }}
        >
          <span style={{ flex: 1 }}>{title}</span>
          {showMetricPill && (
            <span className={styles.metricPill} style={{ marginRight: 12 }}>
              {metricLabel}
            </span>
          )}

          {/* chips on the right */}
          <div style={{ display: 'flex', gap: 16 }}>
            {headerChips.map((c, i) => (
              <div key={i} style={{ textAlign: 'center', lineHeight: 1.1 }}>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: darkMode ? '#e1e1e1' : undefined }}
                >
                  {c.label}
                </div>
                <div
                  style={{ fontSize: 11, color: darkMode ? '#a0b0c8' : '#777', letterSpacing: 0.2 }}
                >
                  {String(c.value).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* chart */}
        <div className={styles.graphCanvas}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout={isHorizontal ? 'vertical' : 'horizontal'}
              margin={margins}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    domain={xDomain || ['dataMin', 'dataMax']}
                    ticks={xTicks}
                    tickFormatter={valueFormatter}
                    tick={{ fontSize: 11, fill: tickColor }}
                    label={{
                      value: xLabel,
                      position: 'insideBottom',
                      offset: -10,
                      style: { fontSize: 15, fill: tickColor },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey={nameKey}
                    width={yCategoryWidth}
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickFormatter={yTickFormatter}
                    label={
                      showYAxisTitle
                        ? {
                            value: yLabel,
                            angle: -90,
                            position: 'insideLeft',
                            offset: 0,
                            style: { fontSize: 15, fill: tickColor, fontWeight: 600 },
                          }
                        : undefined
                    }
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={nameKey}
                    interval={0}
                    tick={{ fontSize: 11, angle: 0, fill: tickColor }}
                    height={60}
                    label={{
                      value: xLabel,
                      position: 'insideBottom',
                      offset: -10,
                      style: { fontSize: 15, fill: tickColor },
                    }}
                  />
                  <YAxis
                    domain={yDomain || ['dataMin', 'dataMax']}
                    ticks={yTicks}
                    tickFormatter={valueFormatter}
                    tick={{ fontSize: 15, fill: tickColor }}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      style: { fontSize: 12, fill: tickColor },
                    }}
                  />
                </>
              )}

              <Tooltip
                formatter={v => [valueFormatter(v), tooltipLabel || metricLabel || title]}
                labelFormatter={lbl => `${lbl}`}
                contentStyle={{
                  background: darkMode ? '#1c2541' : '#fff',
                  border: `1px solid ${darkMode ? '#3a506b' : '#ccc'}`,
                  color: darkMode ? '#e1e1e1' : '#333',
                }}
                itemStyle={{ color: darkMode ? '#e1e1e1' : '#333' }}
                labelStyle={{ color: darkMode ? '#e1e1e1' : '#333', fontWeight: 600 }}
              />
              <Bar dataKey={valueKey} radius={[4, 4, 4, 4]} fill={barColor} barSize={barSize}>
                <LabelList
                  dataKey={valueKey}
                  position={isHorizontal ? 'right' : 'top'}
                  formatter={valueFormatter}
                  style={{ fontSize: 15, fontWeight: 600 }}
                  offset={8}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
