import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { boxStyle, boxStyleDark } from '../../styles';

const TIME_ENTRY_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const DATE_LABEL_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function parseDate(key) {
  if (!key) return new Date(NaN);
  const d = new Date(key);
  if (!Number.isNaN(d.getTime())) return d;
  // Best-effort parse for 'YYYY-MM-DD' style strings.
  return new Date(`${key}T00:00:00`);
}

function aggregateTimeEntries(timeEntries, fromDate, toDate) {
  const dict = {};
  let maxHoursCount = 0;
  let totalHours = 0;

  if (timeEntries && Array.isArray(timeEntries.period)) {
    for (let i = 0; i < timeEntries.period.length; i += 1) {
      const entry = timeEntries.period[i];
      const hours = parseInt(entry.hours, 10) || 0;
      const minutes = entry.minutes === '0' ? 0 : parseInt(entry.minutes, 10) || 0;
      const convertedHours = hours + minutes / 60;
      totalHours += convertedHours;

      if (entry.dateOfWork in dict) {
        dict[entry.dateOfWork].time += convertedHours;
        dict[entry.dateOfWork].des.push(entry.notes || '');
      } else {
        dict[entry.dateOfWork] = {
          time: convertedHours,
          isTangible: [[entry.isTangible, convertedHours]],
          des: [entry.notes || ''],
        };
      }
    }
  }

  const fromDateObj = fromDate ? new Date(fromDate) : null;
  const toDateObj = toDate ? new Date(toDate) : null;
  const hasRange =
    fromDateObj &&
    toDateObj &&
    !Number.isNaN(fromDateObj.getTime()) &&
    !Number.isNaN(toDateObj.getTime());

  const values = [];
  let counter = 0;
  Object.keys(dict).forEach(key => {
    if (hasRange) {
      const keyDate = new Date(key);
      if (Number.isNaN(keyDate.getTime())) return;
      if (keyDate < fromDateObj || keyDate > toDateObj) return;
    }
    const date = parseDate(key);
    if (Number.isNaN(date.getTime())) return;
    values.push({
      id: counter,
      date,
      ts: date.getTime(),
      count: dict[key].time,
      des: dict[key].des,
      isTangible: dict[key].isTangible,
      type: 'Entry',
    });
    if (dict[key].time > maxHoursCount) maxHoursCount = dict[key].time;
    counter += 1;
  });

  values.sort((a, b) => a.date - b.date);
  return { values, maxHoursCount, totalHours };
}

function TimeEntriesViz({ timeEntries, fromDate, toDate, darkMode }) {
  const [show, setShow] = useState(false);

  const { values, maxHoursCount, totalHours } = useMemo(
    () => aggregateTimeEntries(timeEntries, fromDate, toDate),
    [timeEntries, fromDate, toDate],
  );

  const textColor = darkMode ? '#f9fafb' : '#1f1f1f';
  const gridColor = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  return (
    <div>
      <Button
        onClick={() => setShow(!show)}
        aria-expanded={show}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {show ? 'Hide Time Entries Graph' : 'Show Time Entries Graph'}
      </Button>

      {show && (
        <div
          className={darkMode ? 'mt-2' : ''}
          data-testid="time-entries-chart"
          style={{ width: '100%' }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={values}
              margin={{ top: 30, right: 20, bottom: 30, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="ts"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: textColor }}
                axisLine={{ stroke: textColor }}
                tickLine={{ stroke: textColor }}
                tickFormatter={ts => {
                  const d = new Date(ts);
                  return Number.isNaN(d.getTime()) ? '' : DATE_LABEL_FORMAT.format(d);
                }}
              />
              <YAxis
                domain={[0, maxHoursCount + 2]}
                tick={{ fill: textColor }}
                axisLine={{ stroke: textColor }}
                tickLine={{ stroke: textColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1b2a41' : '#ffffff',
                  color: textColor,
                  border: `2px solid ${textColor}`,
                  borderRadius: 5,
                }}
                labelFormatter={ts => {
                  const d = new Date(ts);
                  return Number.isNaN(d.getTime()) ? '' : TIME_ENTRY_FORMAT.format(d);
                }}
                formatter={value => [`${Number(value).toFixed(2)} hrs`, 'Hours logged']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={darkMode ? '#f9fafb' : '#000000'}
                strokeWidth={1.5}
                dot={{ r: 3, stroke: '#69b3a2', strokeWidth: 3, fill: '#ffffff' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div
            className="time-entries-legend"
            style={{
              color: textColor,
              marginTop: 8,
              fontWeight: 700,
            }}
          >
            Total Hours: {totalHours.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

TimeEntriesViz.defaultProps = {
  timeEntries: { period: [] },
  fromDate: '',
  toDate: '',
  darkMode: false,
};

export default TimeEntriesViz;
