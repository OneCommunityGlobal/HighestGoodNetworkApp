
import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, LabelList} from 'recharts';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import './ProjectPieChart.css';


const generateRandomHexColor = () => {

  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const hexColor = "#" + "0".repeat(6 - randomColor.length) + randomColor;
  return hexColor;
}

const renderActiveShape = (props, darkMode, showAllValues) => {
  const hexColor = generateRandomHexColor()
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';


  return (
    <g>
      {!showAllValues ? (
        <>

          <text x={cx} y={cy} dy={-60} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
            {payload.name.substring(0, 5)} {payload.lastName.substring(0, 5)}
          </text>
          <text x={cx} y={cy} dy={-32} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
            {payload.value.toFixed(2)}  of {payload.totalHoursCalculated.toFixed(2)} total hrs.
          </text>
          <text x={ex * .94 + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={darkMode ? 'white' : '#333'}>
              {`${payload.name.substring(0, 14)}`} {`${payload.lastName.substring(0, 1)}`} {`${value.toFixed(2)}Hrs`} ({`${(percent * 100).toFixed(2)}%`})
          </text>

        </>
      ) : (
        <>

        <text x={cx} y={cy} dy={-60} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
          All Members
        </text>
        <text x={cx} y={cy} dy={-32} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
        Total hrs: {payload.totalHoursCalculated.toFixed(2)}
        </text>

        </>
      )
      }
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={hexColor}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={hexColor}
      />

    </g>
  );
};

export function ProjectPieChart  ({ userData, windowSize, darkMode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllValues, setShowAllValues] = useState(false);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const toggleShowAllValues = () => {
    setShowAllValues(!showAllValues);
  };
  let circleSize = 30;
  if (windowSize <= 1280) {
    circleSize = windowSize / 10 * 0.5;
  }

  return (
    <div className={`position-relative ${darkMode ? 'text-light' : ''} h-100`}>
      <div className="button-container">
        <TwoWayToggleSwitch isOn={showAllValues} handleToggle={toggleShowAllValues} />
      </div>
      <ResponsiveContainer maxWidth={640} maxHeight={640} minWidth={350} minHeight={350}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={(props) => renderActiveShape(props, darkMode, showAllValues)}
            data={userData}
            cx="50%"
            cy="50%"
            innerRadius={60 + circleSize}
            outerRadius={120 + circleSize}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={showAllValues ? null : onPieEnter}
            darkMode={darkMode}
            >
            {showAllValues && (
              <LabelList
                dataKey="value"
                position="outside"
                fill={darkMode ? 'white' : '#333'}
                color={darkMode ? "white" : "black"}
                content={(props) => {
                  const { cx, cy, value, index, viewBox} = props;
                  const entry = userData[index];
                  const midAngle = (viewBox.startAngle + viewBox.endAngle) / 2;
                  const RADIAN = Math.PI / 180;
                  const x = cx + (viewBox.outerRadius + 90) * Math.cos(-RADIAN * midAngle);
                  const y = cy + (viewBox.outerRadius + 10) * Math.sin(-RADIAN * midAngle);
                  return (
                    <text x={x} y={y} fill={darkMode ? 'white' : '#333'} textAnchor="middle">
                      {`${entry.name.substring(0, 14)} ${entry.lastName.substring(0, 1)} ${value.toFixed(2)}Hrs (${(value * 100 / entry.totalHoursCalculated).toFixed(2)}%)`}
                    </text>
                  );
                }}
              />
            )}
          </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
  );
}
