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

const getChartAxes = ({
  isHorizontal,
  tickColor,
  valueFormatter,
  nameKey,
  xLabel,
  yLabel,
  ...props
}) =>
  isHorizontal
    ? getHorizontalAxes({
        xDomain: props.xDomain,
        xTicks: props.xTicks,
        valueFormatter,
        tickColor,
        xLabel,
        nameKey,
        yCategoryWidth: props.yCategoryWidth,
        yTickFormatter: props.yTickFormatter,
        showYAxisTitle: props.showYAxisTitle,
        yLabel,
      })
    : getVerticalAxes(
        nameKey,
        tickColor,
        xLabel,
        props.yDomain,
        props.yTicks,
        valueFormatter,
        yLabel,
      );

const GraphHeader = ({ title, metricLabel, showMetricPill, headerChips, darkMode }) => (
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

    <div style={{ display: 'flex', gap: 16 }}>
      {headerChips.map((chip, index) => (
        <div key={index} style={{ textAlign: 'center', lineHeight: 1.1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: darkMode ? '#e1e1e1' : undefined }}>
            {chip.label}
          </div>
          <div style={{ fontSize: 11, color: darkMode ? '#a0b0c8' : '#777', letterSpacing: 0.2 }}>
            {String(chip.value).toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NoDataMessage = ({ height, darkMode }) => (
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
);

const CompareChart = ({
  data,
  height,
  isHorizontal,
  margins,
  gridColor,
  axes,
  valueKey,
  barColor,
  barSize,
  valueFormatter,
  tooltipLabel,
  metricLabel,
  title,
  darkMode,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'} margin={margins}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
      {axes.xAxis}
      {axes.yAxis}

      <Tooltip
        formatter={value => [valueFormatter(value), tooltipLabel || metricLabel || title]}
        labelFormatter={label => `${label}`}
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
);

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
  valueFormatter = value => value,
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

  const axes = getChartAxes({
    isHorizontal,
    tickColor,
    valueFormatter,
    nameKey,
    xLabel,
    yLabel,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    yCategoryWidth,
    yTickFormatter,
    showYAxisTitle,
  });

  return (
    <Card
      className={`${styles.graphCard} ${darkMode ? styles.darkCard : ''}`}
      style={
        darkMode ? { background: '#1c2541', borderColor: '#3a506b', color: '#e1e1e1' } : undefined
      }
    >
      <CardBody className={`${styles.graphCardBody} ${darkMode ? styles.darkCardBody : ''}`}>
        <GraphHeader
          title={title}
          metricLabel={metricLabel}
          showMetricPill={showMetricPill}
          headerChips={headerChips}
          darkMode={darkMode}
        />

        <div className={styles.graphCanvas} style={{ width: '100%', minHeight: `${height}px` }}>
          {data?.length ? (
            <CompareChart
              data={data}
              height={height}
              isHorizontal={isHorizontal}
              margins={margins}
              gridColor={gridColor}
              axes={axes}
              valueKey={valueKey}
              barColor={barColor}
              barSize={barSize}
              valueFormatter={valueFormatter}
              tooltipLabel={tooltipLabel}
              metricLabel={metricLabel}
              title={title}
              darkMode={darkMode}
            />
          ) : (
            <NoDataMessage height={height} darkMode={darkMode} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

GraphHeader.propTypes = {
  title: PropTypes.string.isRequired,
  metricLabel: PropTypes.string,
  showMetricPill: PropTypes.bool.isRequired,
  headerChips: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
};

NoDataMessage.propTypes = {
  height: PropTypes.number.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

CompareChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  height: PropTypes.number.isRequired,
  isHorizontal: PropTypes.bool.isRequired,
  margins: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  gridColor: PropTypes.string.isRequired,
  axes: PropTypes.shape({
    xAxis: PropTypes.node.isRequired,
    yAxis: PropTypes.node.isRequired,
  }).isRequired,
  valueKey: PropTypes.string.isRequired,
  barColor: PropTypes.string.isRequired,
  barSize: PropTypes.number,
  valueFormatter: PropTypes.func.isRequired,
  tooltipLabel: PropTypes.string,
  metricLabel: PropTypes.string,
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

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
