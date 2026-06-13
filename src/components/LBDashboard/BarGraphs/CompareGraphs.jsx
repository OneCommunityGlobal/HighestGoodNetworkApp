import React from 'react';
import PropTypes from 'prop-types';
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

const getHorizontalAxes = ({
  xDomain,
  xTicks,
  valueFormatter,
  tickColor,
  xLabel,
  nameKey,
  yCategoryWidth,
  yTickFormatter,
  showYAxisTitle,
  yLabel,
}) => ({
  xAxis: (
    <XAxis
      type="number"
      domain={xDomain || ['dataMin', 'dataMax']}
      ticks={xTicks}
      tickFormatter={valueFormatter}
      tick={{ fontSize: 11, fill: tickColor }}
      label={{
        value: xLabel,
        position: 'insideBottom',
        offset: -40,
        style: { fontSize: 15, fill: tickColor },
      }}
    />
  ),
  yAxis: (
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
  ),
});

const getVerticalAxes = (nameKey, tickColor, xLabel, yDomain, yTicks, valueFormatter, yLabel) => ({
  xAxis: (
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
  ),
  yAxis: (
    <YAxis
      domain={yDomain || ['dataMin', 'dataMax']}
      ticks={yTicks}
      tickFormatter={valueFormatter}
      tick={{ fontSize: 15, fill: tickColor }}
      label={{
        value: yLabel,
        angle: -90,
        position: 'insideLeft',
        offset: -35,
        style: { fontSize: 12, fill: tickColor },
      }}
    />
  ),
});

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
  showYAxisTitle = true,
  yTickFormatter,
  darkMode = false,
}) {
  const isHorizontal = orientation === 'horizontal';
  const tickColor = darkMode ? '#e1e1e1' : '#444';
  const gridColor = darkMode ? '#3a506b' : '#e0e0e0';

  const horizontalAxes = getHorizontalAxes({
    xDomain,
    xTicks,
    valueFormatter,
    tickColor,
    xLabel,
    nameKey,
    yCategoryWidth,
    yTickFormatter,
    showYAxisTitle,
    yLabel,
  });

  const verticalAxes = getVerticalAxes(
    nameKey,
    tickColor,
    xLabel,
    yDomain,
    yTicks,
    valueFormatter,
    yLabel,
  );

  const renderedAxes = isHorizontal ? horizontalAxes : verticalAxes;

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
        <div
          className={styles.graphCanvas}
          style={{
            width: '100%',
            minHeight: `${height}px`,
          }}
        >
          {data?.length ? (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart
                data={data}
                layout={isHorizontal ? 'vertical' : 'horizontal'}
                margin={margins}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                {renderedAxes.xAxis}
                {renderedAxes.yAxis}

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
          ) : (
            <div
              style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? '#e1e1e1' : '#666',
              }}
            >
              No data available
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

CompareBarGraph.propTypes = {
  title: PropTypes.string.isRequired,
  metricLabel: PropTypes.string,
  tooltipLabel: PropTypes.string,
  showMetricPill: PropTypes.bool,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  nameKey: PropTypes.string.isRequired,
  valueKey: PropTypes.string.isRequired,
  xLabel: PropTypes.string.isRequired,
  yLabel: PropTypes.string.isRequired,
  barColor: PropTypes.string,
  valueFormatter: PropTypes.func,
  headerChips: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  xDomain: PropTypes.array,
  yDomain: PropTypes.array,
  xTicks: PropTypes.array,
  yTicks: PropTypes.array,
  barSize: PropTypes.number,
  height: PropTypes.number,
  yCategoryWidth: PropTypes.number,
  margins: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  showYAxisTitle: PropTypes.bool,
  yTickFormatter: PropTypes.func,
  darkMode: PropTypes.bool,
};
