import React, { useState } from 'react';
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
import { format, parse } from 'date-fns';
// import { format as d3Format } from 'd3-format';
// import { format as d3Format } from 'd3';

import './NoshowViz.css';

// Sample data
const rawData = [
  {
    name: 'Alice',
    date: '01-10-2024',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 25,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2025',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 25,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2024',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 25,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2022',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 56,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2022',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 69,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2024',
    event: 'Workshops',
    attended: true,
    location: 'NY',
    age: 25,
    gender: 'Female',
  },
  {
    name: 'Alice',
    date: '01-10-2024',
    event: 'Workshops',
    attended: false,
    location: 'CA',
    age: 25,
    gender: 'Female',
  },
  {
    name: 'Bob',
    date: '01-10-2024',
    event: 'Conferences',
    attended: false,
    location: 'CA',
    age: 30,
    gender: 'Male',
  },
  {
    name: 'Bobs',
    date: '01-10-2024',
    event: 'Conferences',
    attended: false,
    location: 'NY',
    age: 30,
    gender: 'Male',
  },
  {
    name: 'Charlie',
    date: '01-10-2024',
    event: 'Webinars',
    attended: false,
    location: 'TX',
    age: 28,
    gender: 'Non-binary',
  },
  {
    name: 'David',
    date: '02-15-2024',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 35,
    gender: 'Male',
  },
  {
    name: 'Eve',
    date: '02-15-2024',
    event: 'Conferences',
    attended: false,
    location: 'CA',
    age: 22,
    gender: 'Female',
  },
  {
    name: 'Frank',
    date: '02-15-2024',
    event: 'Webinars',
    attended: true,
    location: 'TX',
    age: 40,
    gender: 'Male',
  },
  {
    name: 'Grace',
    date: '03-20-2024',
    event: 'Workshops',
    attended: true,
    location: 'NY',
    age: 29,
    gender: 'Female',
  },
  {
    name: 'Hank',
    date: '03-20-2024',
    event: 'Conferences',
    attended: false,
    location: 'CA',
    age: 33,
    gender: 'Male',
  },
  {
    name: 'Ivy',
    date: '03-20-2024',
    event: 'Webinars',
    attended: false,
    location: 'TX',
    age: 27,
    gender: 'Female',
  },
  {
    name: 'Jack',
    date: '04-25-2024',
    event: 'Workshops',
    attended: false,
    location: 'NY',
    age: 31,
    gender: 'Male',
  },
  {
    name: 'Kim',
    date: '04-25-2024',
    event: 'Conferences',
    attended: true,
    location: 'CA',
    age: 26,
    gender: 'Female',
  },
  {
    name: 'Leo',
    date: '04-25-2024',
    event: 'Webinars',
    attended: false,
    location: 'TX',
    age: 37,
    gender: 'Male',
  },
];

const getNoShowsData = (data, period) => {
  const groupedData = {};
  const allEventTypes = [...new Set(data.map(d => d.event))];

  data.forEach(item => {
    // let formattedDate = period === 'year' ? format(parseISO(item.date), 'yyyy') : format(parseISO(item.date), 'MMM yyyy');
    // const formattedDate =
    //   period === 'year'
    //     ? format(parse(item.date, 'MM-dd-yyyy', new Date()), 'yyyy')
    //     : format(parse(item.date, 'MM-dd-yyyy', new Date()), 'MMM yyyy');
    const parsedDate = new Date(item.date);
    const formattedDate =
      period === 'year'
        ? parsedDate.getFullYear().toString() // Extracts the year
        : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(parsedDate);

    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = {};
    }

    if (!groupedData[formattedDate][item.event]) {
      groupedData[formattedDate][item.event] = { attended: 0, notAttended: 0 };
    }

    if (item.attended) {
      groupedData[formattedDate][item.event].attended += 1;
    } else {
      groupedData[formattedDate][item.event].notAttended += 1;
    }
  });

  return Object.keys(groupedData)
    .sort((a, b) => {
      const dateA = period === 'year' ? new Date(a) : parse(a, 'MMM yyyy', new Date());
      const dateB = period === 'year' ? new Date(b) : parse(b, 'MMM yyyy', new Date());
      return dateA - dateB;
    })
    .map(date => {
      const entry = { date };

      allEventTypes.forEach(event => {
        entry[event] = groupedData[date][event] || { attended: 0, notAttended: 0 }; // Ensure all event types are included
      });

      return entry;
    });
};

// Function to group data by location and event type
const getNoShowsByLocation = data => {
  const groupedData = {};

  data.forEach(item => {
    if (!groupedData[item.location]) {
      groupedData[item.location] = {};
    }

    if (!item.attended) {
      if (!groupedData[item.location][item.event]) {
        groupedData[item.location][item.event] = 0;
      }
      groupedData[item.location][item.event] += 1;
    }
  });

  return Object.keys(groupedData).map(location => ({
    location,
    ...groupedData[location],
  }));
};

const getNoShowsByAgeGroup = data => {
  const ageGroups = {
    '0-18': [0, 18],
    '19-30': [19, 30],
    '31-40': [31, 40],
    '41-50': [41, 50],
    '51-60': [51, 60],
    '60+': [61, 100],
  };

  const groupedData = {};

  data.forEach(item => {
    if (!item.attended) {
      const ageGroup = Object.keys(ageGroups).find(group => {
        const [min, max] = ageGroups[group];
        return item.age >= min && item.age <= max;
      });

      if (!groupedData[ageGroup]) {
        groupedData[ageGroup] = {};
      }

      if (!groupedData[ageGroup][item.gender]) {
        groupedData[ageGroup][item.gender] = 0;
      }

      groupedData[ageGroup][item.gender] += 1;
    }
  });

  // return Object.keys(groupedData).map(ageGroup => ({
  //   ageGroup,
  //   ...groupedData[ageGroup],
  // }));
  return Object.keys(ageGroups)
    .filter(group => groupedData[group]) // Keep only the groups that exist in the data
    .map(ageGroup => ({
      ageGroup,
      ...groupedData[ageGroup],
    }));
};

const getNoShowProportions = data => {
  const genderCounts = {};

  data.forEach(item => {
    if (!item.attended) {
      genderCounts[item.gender] = (genderCounts[item.gender] || 0) + 1;
    }
  });

  // Convert to array format for PieChart
  return Object.keys(genderCounts).map(gender => ({
    name: gender,
    value: genderCounts[gender],
  }));
};

const eventTypesDay = ['All', ...Array.from(new Set(rawData.map(item => item.event)))];

const getAttendanceByDay = (data, selectedEvent) => {
  const groupedData = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  data.forEach(item => {
    if (item.attended && (selectedEvent === 'All' || item.event === selectedEvent)) {
      const day = format(parse(item.date, 'MM-dd-yyyy', new Date()), 'EEEE');
      groupedData[day] += 1;
    }
  });

  return Object.keys(groupedData).map(day => ({ day, attended: groupedData[day] }));
};

function EventNoShowChart() {
  const [period, setPeriod] = useState('month'); // Default is monthly
  const chartData = getNoShowsData(rawData, period);
  const locationData = getNoShowsByLocation(rawData);
  const ageGroupData = getNoShowsByAgeGroup(rawData);
  const noShowProportions = getNoShowProportions(rawData);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const attendanceData = getAttendanceByDay(rawData, selectedEvent);

  const genderTypes = Array.from(new Set(rawData.map(item => item.gender)));

  // Extract unique event types dynamically
  const eventTypes = Array.from(new Set(rawData.map(item => item.event)));

  // Dynamic color mapping for events
  const colorMapping = {
    Workshops: { attended: '#4CAF50', notAttended: '#8BC34A' },
    Conferences: { attended: '#FFC107', notAttended: '#FF9800' },
    Webinars: { attended: '#2196F3', notAttended: '#03A9F4' },
  };
  // Dynamic color mapping for genders
  const genderColorMapping = {
    Male: '#8884d8',
    Female: '#82ca9d',
    'Non-binary': '#ffc658',
  };

  const maxNoShowsLoc = Math.max(
    ...locationData.flatMap(data => Object.values(data).filter(value => typeof value === 'number')),
  );
  const ticksLoc = Array.from({ length: maxNoShowsLoc + 1 }, (_, i) => i);

  const maxNoShows = Math.max(
    0, // Ensure at least 0 is included
    ...chartData.flatMap(data =>
      eventTypes.flatMap(event => [data[event]?.attended || 0, data[event]?.notAttended || 0]),
    ),
  );
  const tickInterval = maxNoShows > 10 ? Math.ceil(maxNoShows / 5) : 1;
  const ticks = Array.from(
    { length: Math.ceil(maxNoShows / tickInterval) + 1 },
    (_, i) => i * tickInterval,
  )
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => a - b);

  const maxAttendance = Math.max(...attendanceData.map(data => data.attended));
  const tickIntervalLine = maxAttendance > 10 ? Math.ceil(maxAttendance / 5) : 1; // Adjust the tick interval based on the max attendance
  const ticksLine = Array.from(
    { length: Math.ceil(maxAttendance / tickIntervalLine) + 1 },
    (_, i) => i * tickIntervalLine,
  )
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => a - b);

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

  const tickFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0, // This rounds to the nearest integer
  }).format;

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
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            {/* <YAxis ticks={ticks} tickFormatter={d3Format('.0f')} /> */}
            <YAxis ticks={ticks} tickFormatter={tickFormatter} />
            <Tooltip />
            <Legend />
            {/* {Object.keys(chartData[0] || {}).filter(key => key !== 'date').map(event => (
            <>
              <Bar key={`${event}-attended`} dataKey={`${event}.attended`}  fill={colorMapping[event].attended}  name={`${event} - Attended`} />
              <Bar key={`${event}-notAttended`} dataKey={`${event}.notAttended`} fill={colorMapping[event].notAttended} name={`${event} - Not Attended`} />
            </>
          ))} */}
            {[...new Set(chartData.flatMap(d => Object.keys(d).filter(key => key !== 'date')))].map(
              event => (
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
              ),
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="event-title">Event No Shows by Location</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={locationData}>
            <XAxis dataKey="location" />
            {/* <YAxis ticks={ticksLoc} tickFormatter={d3Format('.0f')} /> */}
            <YAxis ticks={ticksLoc} tickFormatter={tickFormatter} />
            <Tooltip />
            <Legend />
            {eventTypes.map(event => (
              <Bar key={event} dataKey={event} fill={colorMapping[event].notAttended} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="event-title">No Shows by Age Group and Gender</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ageGroupData}>
            <XAxis dataKey="ageGroup" />
            {/* <YAxis tickFormatter={d3Format('.0f')} /> */}
            <YAxis tickFormatter={tickFormatter} />
            <Tooltip />
            <Legend />
            {genderTypes.map(gender => (
              <Bar key={gender} dataKey={gender} fill={genderColorMapping[gender]} />
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
      <label>Select Event: </label>
      <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
        {eventTypesDay.map(event => (
          <option key={event} value={event}>
            {event}
          </option>
        ))}
      </select>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceData}>
            <XAxis dataKey="day" />
            {/* <YAxis ticks={ticksLine} tickFormatter={d3Format('.0f')} /> */}
            <YAxis ticks={ticksLine} tickFormatter={tickFormatter} />
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
