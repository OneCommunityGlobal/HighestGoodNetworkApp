/* eslint-disable import/prefer-default-export */

import { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, LabelList} from 'recharts';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import './ProjectPieChart.css';


const generateRandomHexColor = () => {

  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const hexColor = `#${  "0".repeat(6 - randomColor.length)  }${randomColor}`;
  return hexColor;
}

const renderActiveShape = (props, darkMode, showAllValues, accumulatedValues) => {
  const hexColor = generateRandomHexColor()
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';


  return (
    <g>
      {!showAllValues ? (
        <>
        <svg
        className="flex flex-column justify-content-center align-items-center"
        >
          <text x={cx} y={cy} dy={-32} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
          Selected values
          </text>
          <text x={cx} y={cy} dy={-14} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
          {accumulatedValues.toFixed(2)}hrs.
          </text>
          <text x={cx} y={cy} dy={4} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
          Total hrs.({payload.totalHoursCalculated.toFixed(2)})
          </text>
        </svg>
          <text x={ex * .94 + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={darkMode ? 'white' : '#333'}>
              {`${payload.name.substring(0, 14)}`} {`${payload.lastName.substring(0, 1)}`} {`${value.toFixed(2)}hrs`} ({`${(percent * 100).toFixed(2)}%`})
          </text>
        </>

      ) : (
        <>
        <text x={cx} y={cy} dy={-30} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
          All Members
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill={darkMode ? 'white' : fill}  >
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

  const [activeIndices, setActiveIndices] = useState([]);
  const [showAllValues, setShowAllValues] = useState(false);
  const [accumulatedValues, setAccumulatedValues] = useState(0);

  const onPieEnter = (data, index, event) => {
    if (event.ctrlKey) {
      setActiveIndices(prevIndices => {
        if (prevIndices.includes(index)) {
          const newIndices = prevIndices.filter(i => i !== index);
          const newAccumulatedValues = newIndices.reduce((acc, i) => acc + userData[i].value, 0);
          setAccumulatedValues(newAccumulatedValues);
          return newIndices;
        } 
          const newAccumulatedValues = accumulatedValues + userData[index].value;
          setAccumulatedValues(newAccumulatedValues);
          return [...prevIndices, index];
        
      });
    } else {
      setActiveIndices([index]);
      setAccumulatedValues(userData[index].value);
    }
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
            activeIndex={activeIndices}
            activeShape={(props) => renderActiveShape(props, darkMode, showAllValues, accumulatedValues)}
            data={userData}
            cx="50%"
            cy="50%"
            innerRadius={60 + circleSize}
            outerRadius={120 + circleSize}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={showAllValues ? null : (data, index, event) => onPieEnter(data, index, event.nativeEvent)}
            darkMode={darkMode}
            >
            {showAllValues && (
              <LabelList
                dataKey="value"
                position="outside"
                fill={darkMode ? 'white' : '#333'}
                color={darkMode ? "white" : "black"}
                // eslint-disable-next-line react/no-unstable-nested-components
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
  )
}
