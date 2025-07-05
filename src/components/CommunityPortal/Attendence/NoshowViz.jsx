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
import './NoshowViz.css';

function EventNoShowChart() {
  const [period, setPeriod] = useState('month');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const dispatch = useDispatch();

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
    <text x={x} y={y} textAnchor="middle" fill="black" fontSize="12px" dy={10}>
      <tspan x={x} dy="0">
        {name}
      </tspan>
      <tspan x={x} dy="15">
        {(percent * 100).toFixed(1)}%
      </tspan>
    </text>
  );

  return (
    <div className="event-container">
      <h2 className="event-title">Event No Shows by Date</h2>
      <div className="button-group">
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`chart-button ${period === 'month' ? 'active' : ''}`}
        >
          Month View
        </button>
        <button
          type="button"
          onClick={() => setPeriod('year')}
          className={`chart-button ${period === 'year' ? 'active' : ''}`}
        >
          Year View
        </button>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={noShowPeriod}>
            <XAxis dataKey="date" />
            <YAxis ticks={ticks} />
            <Tooltip />
            <Legend />
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
      <h2 className="event-title">Event No Shows by Location</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={locationData}>
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Legend />
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

      <h2 className="event-title">No Shows by Age Group and Gender</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ageGroupData}>
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <Tooltip />
            <Legend />
            {genderTypes.map(gender => (
              <Bar key={gender} dataKey={gender} fill={genderColorMapping[gender] || '#8884d8'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="event-title">Proportion of No-Shows by Gender</h2>
      <div className="chart-wrapper">
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
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h2 className="event-title">Attendance Trend by Day of the Week</h2>
      <label>Select Event Type: </label>
      <select value={selectedEventType} onChange={handleEventTypeChange}>
        {eventTypesWithAll.map(eventType => (
          <option key={eventType} value={eventType}>
            {eventType}
          </option>
        ))}
      </select>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceByDay}>
            <XAxis dataKey="day" />
            <YAxis ticks={ticksLine} />
            <Tooltip />
            <Legend />
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
