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
}) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Card className={styles.graphCard}>
      <CardBody className={styles.graphCardBody}>
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
                    tick={{ fontSize: 11 }}
                    label={{
                      value: xLabel,
                      position: 'insideBottom',
                      offset: -10,
                      style: { fontSize: 15 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey={nameKey}
                    width={yCategoryWidth}
                    tick={{ fontSize: 11 }}
                    tickFormatter={yTickFormatter}
                    label={
                      showYAxisTitle
                        ? {
                            value: yLabel,
                            angle: -90,
                            position: 'insideLeft',
                            offset: 0,
                            style: { fontSize: 15, fill: '#8c8c8c', fontWeight: 600 },
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
                    tick={{ fontSize: 11, angle: 0 }}
                    height={60}
                    label={{
                      value: xLabel,
                      position: 'insideBottom',
                      offset: -10,
                      style: { fontSize: 15 },
                    }}
                  />
                  <YAxis
                    domain={yDomain || ['dataMin', 'dataMax']}
                    ticks={yTicks}
                    tickFormatter={valueFormatter}
                    tick={{ fontSize: 15 }}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      style: { fontSize: 12 },
                    }}
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
