import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { useEffect, useState } from 'react';
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fontSize, index, fill }) => {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(RADIAN * midAngle)
  const cos = Math.cos(RADIAN * midAngle)
  const startX = cx + (outerRadius) * cos
  const startY = cy + (outerRadius) * -sin
  const middleY = cy + (outerRadius + 100 * Math.abs(sin)) * -sin 
  let endX = startX + (cos >= 0 ? 1 : -1) * 50
  let textAnchor = cos >= 0 ? 'start' : 'end'
  const mirrorNeeded = midAngle > 180 && midAngle < -30 && percent < 0.02 && index % 2 === 1
  if (mirrorNeeded) {
    endX = startX + outerRadius * -cos * 2
    textAnchor = 'start'
  }

  return (
    <g>
      <path
        d={`M${startX},${startY}L${startX},${middleY}L${endX},${middleY}`}
        fill="none"
        stroke='#8884d8'
        strokeWidth={1}
      />
      <text
        x={endX + (cos >= 0 || mirrorNeeded ? 1 : -1) * 5}
        y={middleY + fontSize /2}
        textAnchor={textAnchor}
        fontSize={fontSize}
        fill={fill}
      >{`${name || ''} ${(percent * 100).toFixed(0)}%`}</text>
    </g>
  )
}

export default function SelectTeamPieChart(props) {
  const { chartData, COLORS, total } = props;
  if (chartData.length === 0) {
    return (
      <div>
        <p>There are ZERO persons after FILTERING!</p>
      </div>
    );
  }else if(chartData.length > 100){
    return (
      <div>
        <p>PLEASE Choose AT MOST 100 teams!</p>
      </div>
    );
  }
  const [radiusSize, setRadiusSize] = useState(150);
  const [activeIndex, setActiveIndex] = useState(-1);
  const updateRadiusSize = () => {
    if (window.innerWidth <= 1560) {
      setRadiusSize(110);
    }else if(window.innerWidth <= 1230){
      setRadiusSize(80);
    }else if(window.innerWidth <= 1180){
      setRadiusSize(60);
    }

  };
  useEffect(() => {
    window.addEventListener('resize', updateRadiusSize);
    updateRadiusSize();
    return () => {
      window.removeEventListener('resize', updateRadiusSize);
    };
  }, []);
  
  return (
    <ResponsiveContainer minWidth={400} Height={200}>
      <PieChart>
        <Pie
          data={chartData}
          margin={{
            left: 5,
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
          fontSize={10}
          label={renderCustomizedLabel}


        >
          {chartData.map((entry, index) => (
            /* eslint-disable react/no-array-index-key */
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={index === activeIndex ? '#000' : '#fff'}
            strokeWidth={index === activeIndex ? 2 : 1}
          />
          ))}
        </Pie>
        <text x="50%" y="50%" style={{fontWeight:'bold'}}  textAnchor="middle" dominantBaseline="middle">
          Total: {total}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
