// eslint-disable-next-line no-unused-vars
import React, { useMemo } from 'react';
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

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const fmtPct = (v) => `${toNum(v)}%`;
const fmtInt = (v) => toNum(v).toLocaleString();

const CustomTooltip = ({ active, payload, usePercentage, isDark }) => {
  if (active && payload && payload.length) {
    const job = payload[0].payload;
    return (
      <div
        className={`p-2 rounded shadow ${
          isDark
            ? 'bg-space-cadet border border-yinmn-blue text-light'
            : 'bg-white border border-gray-300 text-gray-900'
        }`}
        style={{ fontSize: '0.875rem' }}
      >
        <p><span className="font-semibold">Role:</span> {job.title}</p>
        <p><span className="font-semibold">Conversion Rate:</span> {fmtPct(job.conversionRate)}</p>
        <p><span className="font-semibold">Hits:</span> {fmtInt(job.hits)}</p>
        <p><span className="font-semibold">Applications:</span> {fmtInt(job.applications)}</p>
      </div>
    );
  }
  return null;
};

function NonConvertedApplicationsGraph({ data = [], usePercentage = true, isDark }) {
  const normalized = useMemo(
    () =>
      (data || []).map((d) => ({
        ...d,
        hits: toNum(d.hits),
        applications: toNum(d.applications),
        conversionRate: toNum(d.conversionRate),
      })),
    [data]
  );

  const metricKey = usePercentage ? 'conversionRate' : 'applications';
  const rows = useMemo(() => {
    const sorted = [...normalized].sort((a, b) => {
      const diff = toNum(a[metricKey]) - toNum(b[metricKey]);
      return diff !== 0 ? diff : toNum(a.conversionRate) - toNum(b.conversionRate);
    });
    return sorted.slice(0, 10);
  }, [normalized, metricKey]);

  const maxValue = useMemo(() => {
    if (rows.length === 0) return 1;
    const m = Math.max(...rows.map((r) => toNum(r[metricKey], 0)));
    return Math.max(1, Math.ceil(m * 1.05));
  }, [rows, metricKey]);

  const xDomain = usePercentage ? [0, 100] : [0, maxValue];
  const xTickFormatter = (v) => (usePercentage ? `${v}%` : fmtInt(v));
  const labelFormatter = (v) => (usePercentage ? fmtPct(v) : fmtInt(v));

  return (
    <div
      className={`rounded-xl p-4 mt-6 ${
        isDark ? 'bg-space-cadet text-light boxStyleDark' : 'bg-white text-gray-900 boxStyle'
      }`}
    >
      <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-azure' : ''}`}>
        {usePercentage
          ? 'Top 10 Job Postings with Lowest Conversion Rate'
          : 'Top 10 Job Postings with Lowest Applications'}
      </h2>

      {rows.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 20, right: 20, bottom: 40, left: 150 }}
          >
            <XAxis
              type="number"
              domain={xDomain}
              tickFormatter={xTickFormatter}
              stroke={isDark ? '#4682B4' : '#374151'}
            >
              <Label
                value={
                  usePercentage
                    ? 'Percentage of hits converted to applications'
                    : 'Applications'
                }
                position="bottom"
                offset={0}
                fill={isDark ? '#4682B4' : '#374151'}
              />
            </XAxis>
            <YAxis
              type="category"
              dataKey="title"
              width={140}
              stroke={isDark ? '#4682B4' : '#374151'}
            >
              <Label
                value="Job Role"
                angle={-90}
                position="left"
                offset={-5}
                style={{ textAnchor: 'middle' }}
                fill={isDark ? '#4682B4' : '#374151'}
              />
            </YAxis>
            <Tooltip
              content={<CustomTooltip usePercentage={usePercentage} isDark={isDark} />}
            />
            <Bar dataKey={metricKey} fill="#F44336" minPointSize={3}>
              <LabelList
                dataKey={metricKey}
                position="right"
                formatter={labelFormatter}
                fill={isDark ? '#4682B4' : '#374151'}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default NonConvertedApplicationsGraph;
