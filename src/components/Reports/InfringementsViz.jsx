import React from 'react';
import { Button, Modal } from 'react-bootstrap';
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
import styles from './PeopleReport/PeopleReport.module.css';

const FULL_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
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

function parseDate(date) {
  if (!date) return new Date(Number.NaN);
  const parsedDate = new Date(date);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
  return new Date(`${date}T00:00:00`);
}

function groupInfringementsByDate(infringements) {
  const grouped = {};
  for (const infringement of infringements) {
    if (!infringement.date) continue;
    const bucket = grouped[infringement.date];
    if (bucket) {
      bucket.ids.push(infringement._id);
      bucket.des.push(infringement.description);
      bucket.count += 1;
    } else {
      grouped[infringement.date] = {
        ids: [infringement._id],
        des: [infringement.description],
        count: 1,
      };
    }
  }
  return grouped;
}

function buildInfringementValues(groupedInfringements) {
  return Object.entries(groupedInfringements).map(([dateKey, infringement]) => {
    const date = parseDate(dateKey);
    return {
      ...infringement,
      date,
      ts: date.getTime(),
      type: 'Infringement',
    };
  });
}

function parseTimestamp(dateString) {
  if (!dateString) return null;
  const timestamp = Date.parse(dateString);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isInRange(timestamp, fromTimestamp, toTimestamp) {
  if (fromTimestamp === null || toTimestamp === null) return true;
  return fromTimestamp <= timestamp && timestamp <= toTimestamp;
}

export function aggregateInfringements(infringements, fromDate, toDate) {
  const grouped = groupInfringementsByDate(infringements);
  const fromTimestamp = parseTimestamp(fromDate);
  const toTimestamp = parseTimestamp(toDate);

  const values = buildInfringementValues(grouped)
    .filter(({ ts }) => !Number.isNaN(ts) && isInRange(ts, fromTimestamp, toTimestamp))
    .sort((first, second) => first.ts - second.ts);

  return {
    values,
    maxSquareCount: Math.max(0, ...values.map(infringement => infringement.count)),
  };
}

function InfringementsViz({ infringements, fromDate, toDate, darkMode }) {
  const [graphVisible, setGraphVisible] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [focusedInf, setFocusedInf] = React.useState(null);
  const [selectedInf, setSelectedInf] = React.useState(null);

  const { values, maxSquareCount } = React.useMemo(
    () => aggregateInfringements(infringements || [], fromDate, toDate),
    [infringements, fromDate, toDate],
  );

  const textColor = darkMode ? '#f9fafb' : '#1f1f1f';
  const gridColor = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const handleModalClose = () => {
    setModalVisible(false);
    setFocusedInf(null);
  };

  const renderDot = ({ cx, cy, payload }) => (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#ffffff"
      stroke="#69b3a2"
      strokeWidth={3}
      onClick={() => setSelectedInf(payload)}
      style={{ cursor: 'pointer' }}
    />
  );

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const infringement = payload[0].payload;
    const descriptions = [...new Set(infringement.des.filter(Boolean))];
    return (
      <div
        data-testid="infringement-tooltip"
        style={{
          backgroundColor: darkMode ? '#1b2a41' : '#ffffff',
          color: textColor,
          border: `1px solid ${textColor}`,
          borderRadius: 5,
          padding: '0.5rem',
          maxHeight: '100%',
          overflowY: 'auto',
          overflowWrap: 'anywhere',
        }}
      >
        <div>{FULL_DATE_FORMAT.format(new Date(label))}</div>
        <div>Count: {infringement.count}</div>
        <div>Descriptions:</div>
        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
          {descriptions.length > 0 ? descriptions.map((description, index) => (
            <li key={`${description}-${index}`}>{description}</li>
          )) : <li>None</li>}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <Button
        onClick={() => setGraphVisible(!graphVisible)}
        aria-expanded={graphVisible}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {graphVisible ? 'Hide Infringements Graph' : 'Show Infringements Graph'}
      </Button>

      {graphVisible && (
        <div className={`${styles.kaitest} ${darkMode ? 'mt-2' : ''}`} data-testid="infplot">
          {values.length === 0 ? (
            <div style={{ color: textColor, padding: '1rem 0' }}>No infringements to display.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={values} margin={{ top: 30, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="ts"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: textColor }}
                    axisLine={{ stroke: textColor }}
                    tickLine={{ stroke: textColor }}
                    tickFormatter={timestamp => DATE_LABEL_FORMAT.format(new Date(timestamp))}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, maxSquareCount + 2]}
                    tick={{ fill: textColor }}
                    axisLine={{ stroke: textColor }}
                    tickLine={{ stroke: textColor }}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={renderTooltip}
                    wrapperStyle={{
                      maxWidth: 'calc(100% - 100px)',
                      maxHeight: 'calc(100% - 24px)',
                      overflow: 'hidden',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={darkMode ? '#f9fafb' : '#000000'}
                    strokeWidth={1.5}
                    dot={renderDot}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {selectedInf && (
                <div data-testid="infringement-details" style={{ color: textColor, maxWidth: 500 }}>
                  <button type="button" aria-label="Close infringement details" onClick={() => setSelectedInf(null)}>
                    &times;
                  </button>
                  <div>
                    Exact date: {FULL_DATE_FORMAT.format(selectedInf.date)}
                    <br />
                    Count: {selectedInf.count}
                    {selectedInf.count > 1 && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedInf(selectedInf);
                            setModalVisible(true);
                          }}
                        >
                          See All
                        </button>
                      </>
                    )}
                    <br />
                    Description: {selectedInf.des[0]}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Modal size="lg" show={modalVisible} onHide={handleModalClose}>
        <Modal.Header closeButton style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb', borderColor: '#374151' } : {}}>
          <Modal.Title>{focusedInf ? focusedInf.date.toString() : 'Infringement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>
          <div id="inf">
            <table style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb', width: '100%' } : { width: '100%' }}>
              <thead>
                <tr style={darkMode ? { backgroundColor: '#1b2a41' } : {}}>
                  <th style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>Descriptions</th>
                </tr>
              </thead>
              <tbody>
                {focusedInf
                  ? focusedInf.des.map(desc => (
                    <tr key={desc} style={darkMode ? { backgroundColor: '#1b2a41' } : {}}>
                      <td style={darkMode ? { backgroundColor: '#1b2a41', color: '#f9fafb' } : {}}>{desc}</td>
                    </tr>
                  ))
                  : null}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer style={darkMode ? { backgroundColor: '#1b2a41', borderColor: '#374151' } : {}}>
          <Button variant="secondary" onClick={handleModalClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

InfringementsViz.defaultProps = {
  infringements: [],
  fromDate: '',
  toDate: '',
  darkMode: false,
};

export default InfringementsViz;
