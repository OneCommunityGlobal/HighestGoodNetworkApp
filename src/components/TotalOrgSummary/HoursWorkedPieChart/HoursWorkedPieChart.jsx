import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PropTypes from 'prop-types';

const RADIAN = Math.PI / 180;

const formatNumber = value => {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

export const formatChartLabelValue = value => {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value);
  const absoluteValue = Math.abs(rounded);

  if (absoluteValue < 1000) {
    return formatNumber(rounded);
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: absoluteValue >= 100000 ? 0 : 1,
  }).format(rounded);
};

const parseHexColor = color => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) return null;
  const hex = color.replace('#', '');
  const normalizedHex =
    hex.length === 3
      ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
      : hex.padEnd(6, '0').slice(0, 6);

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);

  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
};

const channelToLinear = c => {
  const normalized = c / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ({ r, g, b }) =>
  0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);

const contrastRatio = (l1, l2) => {
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const getReadableTextColor = (bgColor, fallbackDarkMode) => {
  const rgb = parseHexColor(bgColor);
  if (!rgb) return fallbackDarkMode ? '#F8FAFC' : '#111827';

  const bgL = relativeLuminance(rgb);
  const whiteContrast = contrastRatio(bgL, 1);
  const blackContrast = contrastRatio(bgL, 0);
  return whiteContrast >= blackContrast ? '#FFFFFF' : '#111111';
};

const getLabelToneClass = color =>
  color === '#FFFFFF' ? 'hours-distribution-label-light' : 'hours-distribution-label-dark';

export const renderCenterLabel = ({ darkMode, isMobile, totalHours }) => {
  const centerFill = darkMode ? '#D1D5DB' : '#696969';
  const totalText = formatNumber(totalHours || 0);
  const centerValueFontSize = totalText.length > 6 ? (isMobile ? 24 : 30) : isMobile ? 30 : 36;

  return (
    <>
      <text x="50%" y="50%" dy={-26} textAnchor="middle" fill={centerFill} fontSize={isMobile ? 16 : 20}>
        TOTAL HOURS
      </text>
      <text x="50%" y="50%" dy={-6} textAnchor="middle" fill={centerFill} fontSize={isMobile ? 16 : 20}>
        WORKED
      </text>
      <text x="50%" y="50%" dy={28} textAnchor="middle" fill={centerFill} fontSize={centerValueFontSize}>
        {totalText}
      </text>
    </>
  );
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  totalHours,
  fill,
  payload,
  index,
  colors,
  resolvedSliceColor,
  darkMode,
  isMobile,
}) => {
  if (value <= 0) return null;

  // Thin wedges cannot fit two long lines; use adaptive compact labels.
  const hideAllLabels = percent < 0.005; // < 0.5%
  const isTinySlice = percent < 0.025;   // < 2.5%
  const useCompactLabel = percent < 0.1; // < 10%
  const canShowPercent = percent >= 0.1; // >= 10% has room for percentage
  // Keep small-slice labels centered in each wedge band for better visual alignment.
  // Reduced radiusFactors to keep numbers more centered and prevent overflow
  const radiusFactor = isTinySlice ? 0.58 : useCompactLabel ? 0.54 : 0.48;
  const radius = innerRadius + (outerRadius - innerRadius) * radiusFactor;
  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const x = Math.round(cx + radius * cos);
  const y = Math.round(cy + radius * sin);

  const fallbackIndexedColor =
    Array.isArray(colors) && typeof index === 'number' ? colors[index % colors.length] : undefined;
  const sliceColor = resolvedSliceColor || payload?.sliceColor || fill || fallbackIndexedColor;
  const numberTextColor = getReadableTextColor(sliceColor, darkMode);
  const labelToneClass = getLabelToneClass(numberTextColor);

  const valueFontSize = isMobile ? 11 : 12;
  const percentFontSize = isMobile ? 8 : 9;
  const valueY = y - (isMobile ? 7 : 9);   // More breathing room above
  const percentY = y + (isMobile ? 7 : 9); // More breathing room below
  const chartLabelValue = formatChartLabelValue(value);

  return (
    <>
      {!hideAllLabels && (isTinySlice || useCompactLabel) && (
        <text
          className={labelToneClass}
          x={x}
          y={y}
          fill={numberTextColor}
          style={{ fill: numberTextColor }}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize={isMobile ? 9 : 11}
        >
          {chartLabelValue}
        </text>
      )}
      {!hideAllLabels && canShowPercent && (
        <>
          <text
            className={labelToneClass}
            x={x}
            y={valueY}
            fill={numberTextColor}
            textAnchor="middle"
            dominantBaseline="central"
            fontWeight="bold"
            fontSize={valueFontSize}
          >
            {chartLabelValue}
          </text>
          <text
            className={labelToneClass}
            x={x}
            y={percentY}
            fill={numberTextColor}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={percentFontSize}
            fontWeight="bold"
          >
            {`(${(percent * 100).toFixed(0)}%)`}
          </text>
        </>
      )}
    </>
  );
};

import CustomTooltip from '../../CustomTooltip';

export default function HoursWorkedPieChart({ userData, windowSize, colors, totalHours = 0, darkMode = false }) {
  let innerRadius = 80;
  let outerRadius = 160;
  if (windowSize.width <= 650) {
    innerRadius = 65;
    outerRadius = 130;
  }
  const isMobile = windowSize.width <= 650;
  const chartData = Array.isArray(userData)
    ? userData.map((entry, index) => ({
        ...entry,
        sliceColor: colors[index % colors.length],
      }))
    : [];

  // We'll display totalHours in centre
  const displayTotalHours = totalHours || 0;
  return (
    <div>
      <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={320} minHeight={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={props =>
              renderCustomizedLabel({
                ...props,
                totalHours: displayTotalHours,
                darkMode,
                isMobile,
                colors,
                resolvedSliceColor:
                  typeof props.index === 'number' ? chartData[props.index]?.sliceColor : undefined,
              })
            }
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {Array.isArray(chartData) &&
              chartData.length > 0 &&
              chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
          </Pie>
          {renderCenterLabel({ darkMode, isMobile, totalHours: displayTotalHours })}
          <Tooltip content={<CustomTooltip tooltipType="hoursDistribution" />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

HoursWorkedPieChart.propTypes = {
  userData: PropTypes.array.isRequired,
  windowSize: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }).isRequired,
  colors: PropTypes.array,
  totalHours: PropTypes.number,
  darkMode: PropTypes.bool,
};
