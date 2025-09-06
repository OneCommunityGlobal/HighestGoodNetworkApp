/* eslint-disable import/prefer-default-export */

import { useState, useId, useEffect, useRef } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, LabelList} from 'recharts';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import './ProjectPieChart.css';

const RAD = Math.PI / 180;

function dodgeY(items, minGap, top, bottom) {
  // items: [{ idx, side, sx, sy, tx, rawY, text, y }]
  items.sort((a, b) => a.rawY - b.rawY);
  let last = top;
  for (const it of items) {
    const y = Math.max(it.rawY, last + minGap);
    it.y = Math.min(y, bottom);
    last = it.y;
  }
}

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
  const switchId = useId();
  const layoutRef = useRef(null);
  useEffect(() => { layoutRef.current = null; }, [userData, windowSize, showAllValues, darkMode]);

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
        <TwoWayToggleSwitch
          id={switchId}
          isOn={showAllValues} 
          handleToggle={toggleShowAllValues} 
        />
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
                content={(props) => {
                  const { viewBox, index, value } = props;
                  if (!viewBox) return null;

                  // build layout once
                  if (!layoutRef.current) {
                    const { cx, cy, outerRadius } = viewBox;
                    const R = outerRadius + 6;
                    const textOffset = 80;
                    const minGap = 16;
                    const topBound = cy - (R + 60);
                    const botBound = cy + (R + 60);

                    const total = userData.reduce((s, d) => s + d.value, 0) || 1;
                    let acc = 0;
                    const left = [], right = [];

                    userData.forEach((d, i) => {
                      const mid = ((acc + d.value / 2) / total) * 360; 
                      acc += d.value;

                      const cos = Math.cos(-RAD * mid);
                      const sin = Math.sin(-RAD * mid);
                      const side = cos >= 0 ? 'right' : 'left';

                      const sx = cx + (R - 8) * cos;
                      const sy = cy + (R - 8) * sin;
                      const tx = cx + (R + textOffset) * (side === 'right' ? 1 : -1);
                      const rawY = cy + (R + 8) * sin;

                      const pct = (d.value * 100 / (d.totalHoursCalculated || total)) || 0;
                      const text = `${d.name.substring(0,14)} ${d.lastName?.[0] ?? ''} ${d.value.toFixed(2)}Hrs (${pct.toFixed(1)}%)`;

                      const item = { idx: i, side, sx, sy, tx, rawY, y: rawY, text };
                      (side === 'right' ? right : left).push(item);
                    });

                    // helpers
                    const dodgeY = (items, gap, top, bottom) => {
                      items.sort((a, b) => a.rawY - b.rawY);
                      let last = top;
                      for (const it of items) {
                        const y = Math.max(it.rawY, last + gap);
                        it.y = Math.min(y, bottom);
                        last = it.y;
                      }
                    };
                    dodgeY(left, minGap, topBound, botBound);
                    dodgeY(right, minGap, topBound, botBound);

                    const map = {};
                    [...left, ...right].forEach(it => { map[it.idx] = it; });
                    layoutRef.current = map;
                  }

                  const node = layoutRef.current[index];
                  if (!node) return null;

                  return (
                    <g>
                      <path
                        d={`M${node.sx},${node.sy} L${(node.sx + node.tx)/2},${node.y} L${node.tx},${node.y}`}
                        stroke={darkMode ? '#fff' : '#333'}
                        fill="none"
                      />
                      <text
                        x={node.tx}
                        y={node.y}
                        textAnchor={node.side === 'right' ? 'start' : 'end'}
                        fill={darkMode ? '#fff' : '#333'}
                        dominantBaseline="middle"
                      >
                        {node.text}
                      </text>
                    </g>
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
