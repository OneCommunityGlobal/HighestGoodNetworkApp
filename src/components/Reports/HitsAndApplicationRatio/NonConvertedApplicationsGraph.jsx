import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Label,
} from 'recharts';

const toNum = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fmtPct = (v) => `${toNum(v)}%`;
const fmtInt = (v) => toNum(v).toLocaleString();

const truncate = (str, max = 22) =>
  typeof str === 'string' && str.length > max ? str.slice(0, max) + '…' : str;

const CustomTooltip = ({ active, payload, usePercentage, isDark }) => {
  if (active && payload && payload.length) {
    const job = payload[0]?.payload || {};
    return (
      <div
        className={`p-2 rounded shadow ${
          isDark
            ? 'bg-space-cadet border border-yinmn-blue text-gray-100'
            : 'bg-white border border-gray-300 text-gray-900'
        }`}
        style={{ fontSize: '0.875rem' }}
      >
        <p><strong>Role:</strong> {job.title}</p>
        <p><strong>Conversion Rate (Applications ÷ Hits):</strong> {fmtPct(job.conversionRate)}</p>
        <p><strong>Hits:</strong> {fmtInt(job.hits)}</p>
        <p><strong>Applications:</strong> {fmtInt(job.applications)}</p>
      </div>
    );
  }
  return null;
};

function NonConvertedApplicationsGraph({ data = [], usePercentage, isDark, dateRange }) {
  const normalized = useMemo(() => {
    const map = new Map();

    data.forEach((item) => {
      const title = item.title;

      const hits = toNum(item.hits);
      const applications = toNum(item.applications);

      if (!map.has(title)) {
        map.set(title, {
          ...item,
          hits,
          applications,
          conversionRate: hits ? Number((applications / hits) * 100).toFixed(2) : 0,
        });
      } else {
        const existing = map.get(title);

        const totalHits = existing.hits + hits;
        const totalApplications = existing.applications + applications;

        map.set(title, {
          ...existing,
          hits: totalHits,
          applications: totalApplications,
          conversionRate: totalHits
            ? (totalApplications / totalHits) * 100
            : 0,
        });
      }
    });

    return Array.from(map.values());
  }, [data]);

  const metricKey = usePercentage ? 'conversionRate' : 'applications';

  const rows = useMemo(() => {
    const sorted = [...normalized].sort((a, b) => {
      const diff = toNum(a[metricKey]) - toNum(b[metricKey]);
      return diff !== 0
        ? diff
        : toNum(a.conversionRate) - toNum(b.conversionRate);
    });
    return sorted.slice(0, 10);
  }, [normalized, metricKey]);

  const maxValue = useMemo(() => {
    if (rows.length === 0) return 1;
    const max = Math.max(...rows.map((r) => toNum(r[metricKey])));
    return Math.max(1, Math.ceil(max * 1.05));
  }, [rows, metricKey]);

  const xDomain = usePercentage ? [0, 100] : [0, maxValue];
  const xTickFormatter = usePercentage ? fmtPct : fmtInt;

  return (
    <div
      className={`rounded-xl p-4 mt-6 ${
        isDark ? 'bg-space-cadet text-light boxStyleDark' : 'bg-white text-gray-900 boxStyle'
      }`}
    >

      <div className="mb-4">
        <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-azure' : ''}`}>
          Top 10 Job Postings with Lowest {usePercentage
            ? 'Conversion Rate'
            : 'Applications'} ({dateRange})
        </h2>
      </div>

      {rows.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 20, right: 90, bottom: 40, left: 20 }}
          >
            <XAxis
              type="number"
              domain={xDomain}
              tickFormatter={xTickFormatter}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value={
                  usePercentage
                    ? 'Percentage of hits converted to applications'
                    : 'Applications'
                }
                position="bottom"
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </XAxis>

            <YAxis
              type="category"
              dataKey="title"
              width={180}
              tickFormatter={(v) => v}
              tick={{ fill: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value="Job Role"
                angle={-90}
                position="left"
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </YAxis>

            <Tooltip
              wrapperStyle={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                border: 'none'
              }}
              content={<CustomTooltip usePercentage={usePercentage} isDark={isDark} />} />

            <Bar dataKey={metricKey} fill="#F44336" minPointSize={3}>
              <LabelList
                dataKey={metricKey}
                position="right"
                formatter={xTickFormatter}
                style={{
                  fill: isDark ? '#FFFFFF' : '#374151',
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

NonConvertedApplicationsGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      hits: PropTypes.number,
      applications: PropTypes.number,
      conversionRate: PropTypes.number,
    })
  ),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default NonConvertedApplicationsGraph;
