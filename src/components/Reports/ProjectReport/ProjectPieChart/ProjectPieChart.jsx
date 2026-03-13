/* eslint-disable import/prefer-default-export */

import { useState, useId, useEffect, useRef } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, LabelList} from 'recharts';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import './ProjectPieChart.css';

const RAD = Math.PI / 180;

// Smart label layout: distribute from center outward to prevent overlap
function distributeLabels(items, minGap, top, bottom, centerY) {
  if (items.length === 0) return;
  
  // Sort by distance from center
  items.sort((a, b) => Math.abs(a.rawY - centerY) - Math.abs(b.rawY - centerY));
  
  // Place items starting from closest to center, expanding outward
  const placed = [];
  
  for (const item of items) {
    let y = item.rawY;
    
    // Find non-overlapping position
    for (const p of placed) {
      if (Math.abs(y - p.y) < minGap) {
        // Push away from center
        if (y < centerY) {
          y = p.y - minGap;
        } else {
          y = p.y + minGap;
        }
      }
    }
    
    // Clamp to bounds
    y = Math.max(top, Math.min(y, bottom));
    item.y = y;
    placed.push(item);
  }
  
  // Final adjustment: if any item is out of bounds, shift all
  const minY = Math.min(...items.map(i => i.y));
  const maxY = Math.max(...items.map(i => i.y));
  
  if (minY < top) {
    const shift = top - minY;
    items.forEach(it => it.y += shift);
  } else if (maxY > bottom) {
    const shift = bottom - maxY;
    items.forEach(it => it.y += shift);
  }
}

// Aggregate small values into "Others" category
function aggregateSmallValues(userData, threshold = 0.03) {
  const total = userData.reduce((s, d) => s + d.value, 0) || 1;
  
  const significant = [];
  const small = [];
  
  userData.forEach((d, i) => {
    const pct = d.value / total;
    if (pct >= threshold) {
      significant.push({ ...d, originalIndex: i, pct });
    } else {
      small.push({ ...d, value: d.value, originalIndex: i });
    }
  });
  
  // If there are small values, aggregate them
  if (small.length > 0) {
    const othersValue = small.reduce((s, d) => s + d.value, 0);
    const othersPct = othersValue / total;
    
    significant.push({
      name: `Others (${small.length})`,
      value: othersValue,
      lastName: '',
      totalHoursCalculated: total,
      pct: othersPct,
      isOthers: true,
      othersItems: small
    });
  }
  
  return { aggregatedData: significant, hasOthers: small.length > 0 };
}

// Calculate adaptive gap based on available space
function getAdaptiveGap(availableSpace, itemCount) {
  // Minimum 18px, or distribute evenly if many items
  const evenGap = availableSpace / Math.max(itemCount - 1, 1);
  return Math.max(18, Math.min(evenGap, 28));
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
        <svg className="flex flex-column justify-content-center align-items-center">
          <text x={cx} y={cy} dy={-32} textAnchor="middle" fill={darkMode ? 'white' : fill}>
            Selected values
          </text>
          <text x={cx} y={cy} dy={-14} textAnchor="middle" fill={darkMode ? 'white' : fill}>
            {accumulatedValues.toFixed(2)}hrs.
          </text>
          <text x={cx} y={cy} dy={4} textAnchor="middle" fill={darkMode ? 'white' : fill}>
            Total hrs.({payload.totalHoursCalculated?.toFixed(2) || 0})
          </text>
        </svg>
          <text x={ex * .94 + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={darkMode ? 'white' : '#333'}>
            {`${payload.name?.substring(0, 14) || ''}`} {`${payload.lastName?.substring(0, 1) || ''}`} {`${value?.toFixed(2) || 0}hrs`} ({`${((percent || 0) * 100).toFixed(2)}%`})
          </text>
        </>
      ) : (
        <>
        <text x={cx} y={cy} dy={-30} textAnchor="middle" fill={darkMode ? 'white' : fill}>
          All Members
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill={darkMode ? 'white' : fill}>
          Total hrs: {payload.totalHoursCalculated?.toFixed(2) || 0}
        </text>
        </>
      )}
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
        startAngle={startAngle} endAngle={endAngle} fill={hexColor}
      />
      <Sector
        cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
        innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={hexColor}
      />
    </g>
  );
};

export function ProjectPieChart({ userData, windowSize, darkMode }) {
  const [activeIndices, setActiveIndices] = useState([]);
  const [showAllValues, setShowAllValues] = useState(false);
  const [accumulatedValues, setAccumulatedValues] = useState(0);
  const switchId = useId();
  const layoutRef = useRef(null);
  const layoutVersionRef = useRef(0);
  
  // Aggregate data to handle small values - recalculate when userData changes
  const aggregatedResult = aggregateSmallValues(userData, windowSize <= 640 ? 0.05 : 0.03);
  const aggregatedData = aggregatedResult.aggregatedData;
  const hasOthers = aggregatedResult.hasOthers;
  
  useEffect(() => { 
    layoutRef.current = null;
    layoutVersionRef.current += 1;
  }, [userData, windowSize, showAllValues, darkMode]);

  const onPieEnter = (data, index, event) => {
    if (event.ctrlKey) {
      setActiveIndices(prevIndices => {
        if (prevIndices.includes(index)) {
          const newIndices = prevIndices.filter(i => i !== index);
          const newAccumulatedValues = newIndices.reduce((acc, i) => acc + aggregatedData[i]?.value, 0);
          setAccumulatedValues(newAccumulatedValues);
          return newIndices;
        } 
        const newAccumulatedValues = accumulatedValues + (aggregatedData[index]?.value || 0);
        setAccumulatedValues(newAccumulatedValues);
        return [...prevIndices, index];
      });
    } else {
      setActiveIndices([index]);
      setAccumulatedValues(aggregatedData[index]?.value || 0);
    }
  };

  const toggleShowAllValues = () => {
    setShowAllValues(!showAllValues);
  };

  // Responsive circle size - smaller on mobile for more label space
  let circleSize = 30;
  if (windowSize <= 400) {
    circleSize = 15; // Much smaller on mobile
  } else if (windowSize <= 640) {
    circleSize = 20;
  } else if (windowSize <= 1280) {
    circleSize = windowSize / 10 * 0.5;
  }

  // Responsive container dimensions - constrain on mobile
  const containerWidth = windowSize <= 400 ? 320 : windowSize <= 640 ? 380 : 640;
  const containerHeight = windowSize <= 400 ? 400 : windowSize <= 640 ? 460 : 640;
  const containerMinHeight = 350;

  // Text offset based on screen size - much smaller for mobile
  const textOffset = windowSize <= 400 ? 35 : windowSize <= 500 ? 45 : windowSize <= 640 ? 60 : 85;
  
  // Font size based on screen
  const fontSize = windowSize <= 400 ? 10 : windowSize <= 640 ? 11 : 13;
  const lineStrokeWidth = windowSize <= 400 ? 1 : 1.5;

  return (
    <div className={`position-relative ${darkMode ? 'text-light' : ''} h-100`}>
      <div className="button-container">
        <TwoWayToggleSwitch
          id={switchId}
          isOn={showAllValues} 
          handleToggle={toggleShowAllValues} 
        />
      </div>
      <ResponsiveContainer maxWidth={containerWidth} maxHeight={containerHeight} minWidth={280} minHeight={containerMinHeight}>
        <PieChart>
          <Pie
            activeIndex={activeIndices}
            activeShape={(props) => renderActiveShape(props, darkMode, showAllValues, accumulatedValues)}
            data={aggregatedData}
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
                  const { viewBox, index } = props;
                  if (!viewBox || !aggregatedData[index]) return null;

                  const currentVersion = layoutVersionRef.current;
                  if (!layoutRef.current || layoutRef.current.version !== currentVersion) {
                    const { cx, cy, outerRadius } = viewBox;
                    const R = outerRadius + 6;
                    const centerY = cy;
                    
                    // Calculate available vertical space
                    const availableHeight = windowSize <= 400 ? 320 : windowSize <= 640 ? 380 : 480;
                    const topBound = centerY - availableHeight / 2;
                    const botBound = centerY + availableHeight / 2;
                    
                    const total = aggregatedData.reduce((s, d) => s + d.value, 0) || 1;
                    
                    // Collect items for both sides
                    const left = [], right = [];
                    let acc = 0;
                    
                    aggregatedData.forEach((d, i) => {
                      const mid = ((acc + d.value / 2) / total) * 360; 
                      acc += d.value;
                      
                      const cos = Math.cos(-RAD * mid);
                      const sin = Math.sin(-RAD * mid);
                      const side = cos >= 0 ? 'right' : 'left';
                      
                      const sx = cx + (R - 8) * cos;
                      const sy = cy + (R - 8) * sin;
                      const tx = cx + (R + textOffset) * (side === 'right' ? 1 : -1);
                      const rawY = cy + (R + 8) * sin;
                      
                      const pct = (d.value * 100 / total) || 0;
                      
                      // Generate text based on screen size - shorter for mobile
                      let text;
                      if (windowSize <= 400) {
                        // Very small screens: minimal text
                        text = d.isOthers 
                          ? d.name 
                          : `${d.name.substring(0, 6)} ${d.value.toFixed(0)}h`;
                      } else if (windowSize <= 640) {
                        // Mobile: shorter text
                        text = d.isOthers
                          ? d.name
                          : `${d.name.substring(0, 10)} ${d.value.toFixed(1)}h`;
                      } else {
                        // Desktop: full text
                        text = d.isOthers
                          ? d.name
                          : `${d.name.substring(0, 14)} ${d.lastName?.substring(0, 1) || ''} ${d.value.toFixed(2)}Hrs (${pct.toFixed(1)}%)`;
                      }
                      
                      const item = { idx: i, side, sx, sy, tx, rawY, text, pct };
                      
                      if (side === 'right') {
                        right.push(item);
                      } else {
                        left.push(item);
                      }
                    });
                    
                    // Distribute labels with adaptive gap
                    const minGap = getAdaptiveGap(availableHeight, Math.max(left.length, right.length));
                    distributeLabels(left, minGap, topBound, botBound, centerY);
                    distributeLabels(right, minGap, topBound, botBound, centerY);
                    
                    // Build lookup map
                    const map = { version: currentVersion };
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
                        strokeWidth={lineStrokeWidth}
                      />
                      <text
                        x={node.tx}
                        y={node.y}
                        textAnchor={node.side === 'right' ? 'start' : 'end'}
                        fill={darkMode ? '#fff' : '#333'}
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fontWeight={windowSize <= 400 ? 500 : 400}
                        style={{ 
                          pointerEvents: 'none',
                          textShadow: darkMode ? 'none' : '0 0 2px rgba(255,255,255,0.8)'
                        }}
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
  );
}
