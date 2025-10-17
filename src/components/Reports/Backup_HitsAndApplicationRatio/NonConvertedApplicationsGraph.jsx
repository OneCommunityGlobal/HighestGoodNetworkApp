// eslint-disable-next-line no-unused-vars
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const fmtPct = (v) => `${toNum(v)}%`;
const fmtInt = (v) => toNum(v).toLocaleString();

const CustomTooltip = ({ active, payload, usePercentage }) => {
  if (active && payload && payload.length) {
    const job = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-2 rounded shadow text-sm">
        <p><strong>Role:</strong> {job.title}</p>
        <p><strong>Conversion Rate:</strong> {fmtPct(job.conversionRate)}</p>
        <p><strong>Hits:</strong> {fmtInt(job.hits)}</p>
        <p><strong>Applications:</strong> {fmtInt(job.applications)}</p>
      </div>
    );
  }
  return null;
};

function NonConvertedApplicationsGraph({ data = [], usePercentage = true }) {
  // normalize first so sorting/axes use numbers
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

  // sort by active metric (ascending = "lowest"), then take top 10
  const metricKey = usePercentage ? 'conversionRate' : 'applications';
  const rows = useMemo(() => {
    const sorted = [...normalized].sort((a, b) => {
      const diff = toNum(a[metricKey]) - toNum(b[metricKey]); // ascending
      // tie-breaker for stable order
      return diff !== 0 ? diff : toNum(a.conversionRate) - toNum(b.conversionRate);
    });
    return sorted.slice(0, 10);
  }, [normalized, metricKey]);

  // axis domain
  const maxValue = useMemo(() => {
    if (rows.length === 0) return 1;
    const m = Math.max(...rows.map((r) => toNum(r[metricKey], 0)));
    return Math.max(1, Math.ceil(m * 1.05)); // a bit of headroom
  }, [rows, metricKey]);

  const xDomain = usePercentage ? [0, 100] : [0, maxValue];
  const xTickFormatter = (v) => (usePercentage ? `${v}%` : fmtInt(v));
  const labelFormatter = (v) => (usePercentage ? fmtPct(v) : fmtInt(v));

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">
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
            margin={{ top: 20, right: 20, bottom: 20, left: 150 }}
          >
            <XAxis type="number" domain={xDomain} tickFormatter={xTickFormatter} />
            <YAxis type="category" dataKey="title" width={140} />
            <Tooltip content={<CustomTooltip usePercentage={usePercentage} />} />
            <Bar
              dataKey={metricKey}
              fill="#F44336"
              minPointSize={3} // keeps tiny values visible
            >
              <LabelList dataKey={metricKey} position="right" formatter={labelFormatter} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default NonConvertedApplicationsGraph;
