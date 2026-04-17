import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const calculatePercentages = (data, total) => {
  let sumOfPercentages = 0;
  const result = data.map((entry, index) => {
    const percentCal = Math.round((entry.value / total) * 100);
    if (index < data.length - 1) {
      sumOfPercentages += percentCal;
      return {
        ...entry,
        percent: percentCal,
      };
    }
    return {
      ...entry,
      percent: 100 - sumOfPercentages,
    };
  });

  return result;
};

const getWrappedLines = (text, maxCharsPerLine = 16) => {
  if (!text) return [''];
  const words = text.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    // Break very long words so they don't overflow the SVG viewBox.
    const chunks =
      word.length > maxCharsPerLine
        ? word.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g'))
        : [word];

    chunks.forEach(chunk => {
      const candidate = currentLine ? `${currentLine} ${chunk}` : chunk;
      if (candidate.length <= maxCharsPerLine) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = chunk;
      }
    });
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fontSize,
  index,
  darkMode,
}) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(RADIAN * midAngle);
  const cos = Math.cos(RADIAN * midAngle);
  const startX = cx + outerRadius * cos;
  const startY = cy + outerRadius * -sin;
  const middleY = cy + (outerRadius + 88 * Math.abs(sin)) * -sin;
  let endX = startX + (cos >= 0 ? 1 : -1) * 30;
  let textAnchor = cos >= 0 ? 'start' : 'end';
  const mirrorNeeded = midAngle > 270 && midAngle < -90 && percent < 0.02 && index % 2 === 1;
  if (mirrorNeeded) {
    endX = startX + outerRadius * -cos * 2;
    textAnchor = 'start';
  }

  const isMobile = window.innerWidth <= 634;

  const xPadding = 14;
  const minX = xPadding;
  const maxX = cx * 2 - xPadding;
  endX = Math.max(minX, Math.min(maxX, endX));

  const lineX = Math.max(minX, Math.min(maxX, endX + (cos >= 0 || mirrorNeeded ? 1 : -1) * 5));
  const labelColor = darkMode ? '#e2e8f0' : '#1f2937';
  const lines = getWrappedLines(name, isMobile ? 11 : 16);

  return (
    <g>
      <path
        d={`M${startX},${startY}L${startX},${middleY}L${endX},${middleY}`}
        fill="none"
        stroke={darkMode ? '#94a3b8' : '#64748b'}
        strokeWidth={1}
      />
      <text
        x={lineX}
        y={middleY + fontSize / 2}
        textAnchor={textAnchor}
        fontSize={fontSize}
        fill={labelColor}
      >
        {isMobile ? (
          <>
            {lines.map((line, lineIndex) => (
              <tspan key={`${line}-${lineIndex}`} x={lineX} dy={lineIndex === 0 ? '0' : '1.1em'}>
                {line}
              </tspan>
            ))}
            <tspan x={lineX} dy="1.2em">{`${percent}%`}</tspan>
          </>
        ) : (
          <>
            {lines.map((line, lineIndex) => (
              <tspan key={`${line}-${lineIndex}`} x={lineX} dy={lineIndex === 0 ? '0' : '1.1em'}>
                {line}
              </tspan>
            ))}
            <tspan x={lineX} dy="1.1em">{`${percent}%`}</tspan>
          </>
        )}
      </text>
    </g>
  );
};

export default function SelectTeamPieChart(props) {
  const { chartData, COLORS, total, darkMode } = props;
  const [radiusSize, setRadiusSize] = useState(150);
  const [fontSize, setFontSize] = useState(12);
  const updateRadiusSize = () => {
    const width = window.innerWidth;
    if (width <= 634) {
      setFontSize(8.5);
      setRadiusSize(75);
    } else if (width <= 992) {
      setRadiusSize(120);
    } else if (width <= 1230) {
      setRadiusSize(100);
    } else {
      setRadiusSize(150);
      setFontSize(15);
    }
  };
  useEffect(() => {
    window.addEventListener('resize', updateRadiusSize);
    updateRadiusSize();
    return () => {
      window.removeEventListener('resize', updateRadiusSize);
    };
  }, []);
  const processedData = calculatePercentages(chartData, total);
  if (chartData.length === 0) {
    return (
      <div>
        <p style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>
          There are ZERO persons after FILTERING!
        </p>
      </div>
    );
  }
  if (chartData.length > 100) {
    return (
      <div>
        <p style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>PLEASE Choose AT MOST 100 teams!</p>
      </div>
    );
  }

  const renderLabel = labelProps =>
    renderCustomizedLabel({
      ...labelProps,
      darkMode,
      fontSize,
    });

  return (
    <ResponsiveContainer minHeight={600} maxHeight={800}>
      <PieChart>
        <Pie
          data={processedData}
          margin={{
            left: 24,
            right: 24,
          }}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={radiusSize}
          startAngle={90}
          endAngle={-270}
          labelLine={false}
          paddingAngle={0}
          label={renderLabel}
        >
          {processedData.map((entry, index) => (
            /* eslint-disable react/no-array-index-key */
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <text
          x="50%"
          y="50%"
          style={{ fontWeight: 'bold' }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Total: {total}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
