import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getNoShowsByLocation,
  getNoShowsData,
  getNoShowsByAgeGroup,
  getNoShowProportions,
  getUniqueEventTypes,
  getAttendanceByDay,
} from '../../../actions/communityPortal/NoShowVizActions';
import styles from './NoshowViz.module.css';

function EventNoShowChart() {
  const [period, setPeriod] = useState('month');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const tooltipStyle = {
    contentStyle: darkMode
      ? { backgroundColor: '#1b2a41', border: '1px solid #3a506b', color: '#f9fafb' }
      : undefined,
    labelStyle: darkMode ? { color: '#f9fafb' } : undefined,
  };
  const tooltipCursor = darkMode ? { fill: '#26364d', stroke: '#64748b' } : undefined;
  const axisTick = { fill: darkMode ? '#d1d5db' : '#666' };

  useEffect(() => {
    dispatch(getNoShowsByLocation());
    dispatch(getNoShowsByAgeGroup());
    dispatch(getNoShowProportions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getNoShowsData(period));
    dispatch(getUniqueEventTypes());
  }, [dispatch, period]);

  useEffect(() => {
    dispatch(getAttendanceByDay(selectedEventType));
  }, [dispatch, selectedEventType]);

  const locationData = useSelector(state => state.noShowViz.noShowsByLocation);
  // const ageGroupData = useSelector(state => state.noShowViz.noShowsByAgeGroup);
  const noShowProportions = useSelector(state => state.noShowViz.noShowProportions);
  const noShowPeriod = useSelector(state => state.noShowViz.noShowsData);
  const attendanceByDay = useSelector(state => state.noShowViz.attendanceByDay);
  const uniqueEventTypes = useSelector(state => state.noShowViz.uniqueEventTypes);
  const eventTypesWithAll = ['All', ...uniqueEventTypes];
  const { ageGroupData = [], genderTypes = [] } = useSelector(
    state => state.noShowViz.noShowsByAgeGroup,
  );

  const maxNoShows = Math.max(
    0,
    noShowPeriod.flatMap(data =>
      uniqueEventTypes.flatMap(event => [
        data[event]?.attended || 0,
        data[event]?.notAttended || 0,
      ]),
    ),
  );
  const tickInterval = maxNoShows > 10 ? Math.ceil(maxNoShows / 5) : 1;
  const ticks = Array.from(
    { length: Math.ceil(maxNoShows / tickInterval) + 1 },
    (_, i) => i * tickInterval,
  )
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a - b);

  const maxAttendance = Math.max(...attendanceByDay.map(data => data.attended));
  const tickIntervalLine = maxAttendance > 10 ? Math.ceil(maxAttendance / 5) : 1; // Adjust the tick interval based on the max attendance

  // Generate ticks, ensuring they're whole numbers
  const ticksLine = Array.from(
    { length: Math.ceil(maxAttendance / tickIntervalLine) + 1 },
    (_, i) => i * tickIntervalLine,
  )
    .map(Math.floor) // Ensure values are whole numbers
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => a - b); // Sort in ascending order

  const handleEventTypeChange = e => {
    const selectedType = e.target.value;
    setSelectedEventType(selectedType);
  };

  const colorMapping = {
    WorkShop: { attended: '#4CAF50', notAttended: '#8BC34A' },
    Conference: { attended: '#FFC107', notAttended: '#FF9800' },
    Webinar: { attended: '#2196F3', notAttended: '#33BFF9' },
  };

  const genderColorMapping = {
    Male: '#8884d8',
    Female: '#82ca9d',
    'Non-binary': '#ffc658',
  };

  const renderPieLabel = ({ name, percent, x, y }) => (
    // Recharts draws this label outside the slice, on the chart background —
    // hardcoded black was invisible once that background went dark.
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={darkMode ? '#f9fafb' : 'black'}
      fontSize="12px"
      dy={10}
    >
      <tspan x={x} dy="0">
        {name}
      </tspan>
      <tspan x={x} dy="15">
        {(percent * 100).toFixed(1)}%
      </tspan>
    </text>
  );

  return (
    <div className={`${styles.eventContainer} ${darkMode ? styles.dark : ''}`}>
      <h2 className={`${styles.eventTitle}`}>Event No Shows by Date</h2>
      <div className={`${styles.buttonGroup}`}>
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`${styles.chartButton} ${period === 'month' ? styles.active : ''} ${
            darkMode ? styles.dark : ''
          }`}
        >
          Month View
        </button>
        <button
          type="button"
          onClick={() => setPeriod('year')}
          className={`${styles.chartButton} ${period === 'year' ? styles.active : ''} ${
            darkMode ? styles.dark : ''
          }`}
        >
          Year View
        </button>
      </div>
      <div className={`${styles.chartWrapper} ${darkMode ? styles.dark : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={noShowPeriod}>
            <XAxis dataKey="date" tick={axisTick} />
            <YAxis ticks={ticks} tick={axisTick} />
            <Tooltip {...tooltipStyle} cursor={tooltipCursor} />
            <Legend wrapperStyle={darkMode ? { color: '#d1d5db' } : undefined} />
            {uniqueEventTypes.map(event => (
              <React.Fragment key={event}>
                <Bar
                  key={`${event}-attended`}
                  dataKey={`${event}.attended`}
                  fill={colorMapping[event]?.attended || '#8884d8'}
                  name={`${event} - Attended`}
                />
                <Bar
                  key={`${event}-notAttended`}
                  dataKey={`${event}.notAttended`}
                  fill={colorMapping[event]?.notAttended || '#FF5733'}
                  name={`${event} - Not Attended`}
                />
              </React.Fragment>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2 className={`${styles.eventTitle}`}>Event No Shows by Location</h2>
      <div className={`${styles.chartWrapper} ${darkMode ? styles.dark : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={locationData}>
            <XAxis dataKey="location" tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip {...tooltipStyle} cursor={tooltipCursor} />
            <Legend wrapperStyle={darkMode ? { color: '#d1d5db' } : undefined} />
            {locationData.length > 0 &&
              Object.keys(locationData[0])
                .filter(key => key !== 'location') // Exclude 'location' key
                .map(eventType => (
                  <Bar
                    key={eventType} // Unique key for each event type
                    dataKey={eventType} // Event data for the corresponding key
                    fill={colorMapping[eventType]?.notAttended || '#8884d8'} // Set color dynamically
                  />
                ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className={`${styles.eventTitle}`}>No Shows by Age Group and Gender</h2>
      <div className={`${styles.chartWrapper} ${darkMode ? styles.dark : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ageGroupData}>
            <XAxis dataKey="ageGroup" tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip {...tooltipStyle} cursor={tooltipCursor} />
            <Legend wrapperStyle={darkMode ? { color: '#d1d5db' } : undefined} />
            {genderTypes.map(gender => (
              <Bar key={gender} dataKey={gender} fill={genderColorMapping[gender] || '#8884d8'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className={`${styles.eventTitle}`}>Proportion of No-Shows by Gender</h2>
      <div className={`${styles.chartWrapper} ${darkMode ? styles.dark : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={noShowProportions}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={renderPieLabel}
            >
              {noShowProportions.map(entry => (
                <Cell key={`cell-${entry.name}`} fill={genderColorMapping[entry.name]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} cursor={tooltipCursor} />
            <Legend wrapperStyle={darkMode ? { color: '#d1d5db' } : undefined} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h2 className={`${styles.eventTitle}`}>Attendance Trend by Day of the Week</h2>
      <label
        className={`${styles['no-show-viz-label']} ${darkMode ? styles.dark : ''}`}
        htmlFor="event-type-select"
      >
        Select Event Type:
      </label>
      <select
        className={`${styles['no-show-viz-select']} ${darkMode ? styles.dark : ''}`}
        value={selectedEventType}
        onChange={handleEventTypeChange}
      >
        {eventTypesWithAll.map(eventType => (
          <option key={eventType} value={eventType}>
            {eventType}
          </option>
        ))}
      </select>

      <div className={`${styles.chartWrapper} ${darkMode ? styles.dark : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceByDay}>
            <XAxis dataKey="day" tick={axisTick} />
            <YAxis ticks={ticksLine} tick={axisTick} />
            <Tooltip {...tooltipStyle} cursor={tooltipCursor} />
            <Legend wrapperStyle={darkMode ? { color: '#d1d5db' } : undefined} />
            <Line
              type="monotone"
              dataKey="attended"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Attended"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EventNoShowChart;
