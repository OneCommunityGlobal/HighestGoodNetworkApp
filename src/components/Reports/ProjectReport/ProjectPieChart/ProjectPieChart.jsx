/* eslint-disable import/prefer-default-export */

import { useEffect, useId, useRef, useState } from "react";
import PropTypes from 'prop-types';
import { LabelList, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import styles from './ProjectPieChart.module.css';

const RAD = Math.PI / 180;

export const getChartLayout = availableWidth => {
  if (availableWidth <= 400) {
    return {
      innerRadius: 44,
      outerRadius: 78,
      textOffset: 12,
      fontSize: 10,
      availableHeight: 280,
      horizontalMargin: 24,
      switchScale: 0.55,
    };
  }
  if (availableWidth <= 576) {
    return {
      innerRadius: 50,
      outerRadius: 90,
      textOffset: 20,
      fontSize: 11,
      availableHeight: 320,
      horizontalMargin: 24,
      switchScale: 0.65,
    };
  }
  if (availableWidth <= 640) {
    return {
      innerRadius: 60,
      outerRadius: 120,
      textOffset: 50,
      fontSize: 11,
      availableHeight: 380,
      horizontalMargin: 16,
      switchScale: 1,
    };
  }

  const circleSize = availableWidth <= 1280 ? (availableWidth / 10) * 0.5 : 30;
  return {
    innerRadius: 60 + circleSize,
    outerRadius: 120 + circleSize,
    textOffset: 85,
    fontSize: 13,
    availableHeight: 480,
    horizontalMargin: 0,
    switchScale: 1,
  };
};

// Place labels in angular order, then resolve collisions in both directions.
export function distributeLabels(items, minGap, top, bottom) {
  if (items.length === 0) return;

  items.sort((a, b) => a.rawY - b.rawY);
  const availableSpace = Math.max(bottom - top, 0);
  const gap =
    items.length > 1 ? Math.min(minGap, availableSpace / (items.length - 1)) : minGap;

  items[0].y = Math.max(top, Math.min(items[0].rawY, bottom));
  for (let index = 1; index < items.length; index += 1) {
    items[index].y = Math.max(items[index].rawY, items[index - 1].y + gap);
  }

  items[items.length - 1].y = Math.min(items[items.length - 1].y, bottom);
  for (let index = items.length - 2; index >= 0; index -= 1) {
    items[index].y = Math.min(items[index].y, items[index + 1].y - gap);
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

const renderActiveShape = props => {
  const hexColor = generateRandomHexColor()
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = props;

  return (
    <g>
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
  const chartContainerRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(null);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return undefined;

    const updateMeasuredWidth = width => {
      if (width > 0) setMeasuredWidth(width);
    };

    updateMeasuredWidth(chartContainer.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(entries => {
      updateMeasuredWidth(entries[0]?.contentRect.width || 0);
    });
    resizeObserver.observe(chartContainer);

    return () => resizeObserver.disconnect();
  }, []);

  const availableWidth = measuredWidth || windowSize;
  const chartLayout = getChartLayout(availableWidth);
  const isCompact = availableWidth <= 576;

  // Aggregate data to handle small values - recalculate when userData changes
  const aggregatedResult = aggregateSmallValues(userData, windowSize <= 640 ? 0.05 : 0.03);
  const aggregatedData = aggregatedResult.aggregatedData;
  const hasOthers = aggregatedResult.hasOthers;
  
  useEffect(() => { 
    layoutRef.current = null;
    layoutVersionRef.current += 1;
  }, [userData, availableWidth, showAllValues, darkMode]);

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

  const { innerRadius, outerRadius, textOffset, fontSize, availableHeight } = chartLayout;
  const lineStrokeWidth = availableWidth <= 400 ? 1 : 1.5;

  // Inline styles for mobile responsiveness (replacing CSS media queries)
  // Button should be centered in the pie chart (cx=50%, cy=50% of container)
  const buttonContainerStyle = {
    position: 'absolute',
    top: '50%', // Always center vertically in container
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    pointerEvents: 'auto',
  };

  const switchWrapperStyle = {
    transform: `scale(${chartLayout.switchScale})`,
    transition: 'transform 0.2s ease',
  };

  const displayedTotalHours =
    userData[0]?.totalHoursCalculated ?? userData.reduce((total, item) => total + item.value, 0);

  const centerContent = (
    <div className={`${styles.centerContent} ${darkMode ? styles.centerContentDark : ''}`}>
      <div className={styles.centerSummary} aria-live="polite">
        <span>{showAllValues ? 'All values' : 'Selected values'}</span>
        {!showAllValues && <span>{accumulatedValues.toFixed(2)} hrs</span>}
        <span>Total hrs ({Number(displayedTotalHours || 0).toFixed(2)})</span>
      </div>
      <div className={styles.centerToggleWrapper} style={switchWrapperStyle}>
        <TwoWayToggleSwitch
          className={styles.centerToggle}
          id={switchId}
          isOn={showAllValues}
          handleToggle={toggleShowAllValues}
        />
      </div>
    </div>
  );

  return (
    <div
      ref={chartContainerRef}
      className={`position-relative ${darkMode ? 'text-light' : ''} ${styles.chartRoot} ${
        isCompact ? styles.compactRoot : 'h-100'
      }`}
    >
      <div className={`${styles.chartCanvas} ${isCompact ? styles.compactCanvas : ''}`}>
      {!isCompact && <div style={buttonContainerStyle}>{centerContent}</div>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart
          margin={{
            top: 0,
            right: chartLayout.horizontalMargin,
            bottom: 0,
            left: chartLayout.horizontalMargin,
          }}
        >
          <Pie
            activeIndex={activeIndices}
            activeShape={renderActiveShape}
            data={aggregatedData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={showAllValues ? null : (data, index, event) => onPieEnter(data, index, event.nativeEvent)}
            darkMode={darkMode}
          >
            {!isCompact && (
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
                      if (availableWidth <= 400) {
                        // Very small screens: show only hours to prevent cutoff
                        text = d.isOthers 
                          ? d.name 
                          : `${d.value.toFixed(1)}h`;
                      } else if (availableWidth <= 640) {
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
                    distributeLabels(left, minGap, topBound, botBound);
                    distributeLabels(right, minGap, topBound, botBound);
                    
                    // Build lookup map
                    const map = { version: currentVersion };
                    [...left, ...right].forEach(it => { map[it.idx] = it; });
                    layoutRef.current = map;
                  }
                  
                  const node = layoutRef.current[index];
                  if (!node) return null;
                  if (!showAllValues && !activeIndices.includes(index)) return null;
                  
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
                        fontWeight={availableWidth <= 400 ? 500 : 400}
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
      {isCompact && centerContent}
      {isCompact && (
        <div className={styles.mobileLegend} aria-label="Chart member values">
          {aggregatedData.map(item => (
            <div
              className={styles.mobileLegendItem}
              key={`${item.name}-${item.lastName}-${item.originalIndex ?? 'others'}`}
            >
              <span className={styles.mobileLegendName}>
                {item.name} {item.lastName}
              </span>
              <span>{Number(item.value || 0).toFixed(2)} hrs</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ProjectPieChart.propTypes = {
  userData: PropTypes.arrayOf(PropTypes.object).isRequired,
  windowSize: PropTypes.number.isRequired,
  darkMode: PropTypes.bool,
};

ProjectPieChart.defaultProps = {
  darkMode: false,
};
