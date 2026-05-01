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
  height = 320,
  yCategoryWidth = 140,
  margins = { top: 8, right: 24, bottom: 36, left: 36 },
  maxBars,
  showYAxisTitle = true,
  yTickFormatter,
}) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Card className={styles.graphCard}>
      <CardBody>
        {/* Title row + chips */}
        <div className={styles.graphTitle} style={{ display: 'flex', alignItems: 'center' }}>
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
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#777', letterSpacing: 0.2 }}>
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
              <CartesianGrid strokeDasharray="3 3" />
              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    domain={xDomain || ['dataMin', 'dataMax']}
                    ticks={xTicks}
                    tickFormatter={valueFormatter}
                    label={{ value: xLabel, position: 'insideBottom', offset: -4 }}
                  />
                  <YAxis
                    type="category"
                    dataKey={nameKey}
                    width={yCategoryWidth}
                    label={
                      showYAxisTitle
                        ? {
                            value: yLabel,
                            angle: -90,
                            position: 'insideLeft',
                            offset: 6,
                            style: { fontSize: 12, fill: '#8c8c8c', fontWeight: 600 },
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
                    label={{ value: xLabel, position: 'insideBottom', offset: -4 }}
                  />
                  <YAxis
                    domain={yDomain || ['dataMin', 'dataMax']}
                    ticks={yTicks}
                    tickFormatter={valueFormatter}
                    label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
                  />
                </>
              )}

              <Tooltip
                formatter={v => [valueFormatter(v), tooltipLabel || metricLabel || title]}
                labelFormatter={lbl => `${lbl}`}
              />
              <Bar dataKey={valueKey} radius={[4, 4, 4, 4]} fill={barColor} barSize={barSize}>
                <LabelList
                  dataKey={valueKey}
                  position={isHorizontal ? 'right' : 'top'}
                  formatter={valueFormatter}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
