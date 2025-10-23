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
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fontSize,
  index,
  fill,
}) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(RADIAN * midAngle);
  const cos = Math.cos(RADIAN * midAngle);
  const startX = cx + outerRadius * cos;
  const startY = cy + outerRadius * -sin;
  const middleY = cy + (outerRadius + 100 * Math.abs(sin)) * -sin;
  let endX = startX + (cos >= 0 ? 1 : -1) * 40;
  let textAnchor = cos >= 0 ? 'start' : 'end';
  const mirrorNeeded = midAngle > 270 && midAngle < -90 && percent < 0.02 && index % 2 === 1;
  if (mirrorNeeded) {
    endX = startX + outerRadius * -cos * 2;
    textAnchor = 'start';
  }
  return (
    <g>
      <path
        d={`M${startX},${startY}L${startX},${middleY}L${endX},${middleY}`}
        fill="none"
        stroke="#8884d8"
        strokeWidth={1}
      />
      <text
        x={endX + (cos >= 0 || mirrorNeeded ? 1 : -1) * 5}
        y={middleY + fontSize / 2}
        textAnchor={textAnchor}
        fontSize={fontSize}
        fill={fill}
      >{`${name || ''} ${percent}%`}</text>
    </g>
  );
};

export default function SelectTeamPieChart(props) {
  const { chartData, COLORS, total } = props;
  const [radiusSize, setRadiusSize] = useState(150);
  const [fontSize, setFontSize] = useState(12);
  const updateRadiusSize = () => {
    const width = window.innerWidth;
    if (width <= 400) {
      setRadiusSize(30);
      setFontSize(10);
    } else if (width <= 500) {
      setRadiusSize(60);
      setFontSize(10);
    } else if (width <= 634) {
      setRadiusSize(80);
      setFontSize(10);
    } else if (width <= 992) {
      setRadiusSize(120);
    } else if (width <= 1180) {
      setRadiusSize(60);
    } else if (width <= 1230) {
      setRadiusSize(80);
    } else if (width <= 1560) {
      setRadiusSize(110);
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
        <p>There are ZERO persons after FILTERING!</p>
      </div>
    );
  }
  if (chartData.length > 100) {
    return (
      <div>
        <p>PLEASE Choose AT MOST 100 teams!</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer minWidth={400} height={600}>
      <PieChart>
        <Pie
          data={processedData}
          margin={{
            left: 5,
            right: 5,
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
          fontSize={fontSize}
          label={renderCustomizedLabel}
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
