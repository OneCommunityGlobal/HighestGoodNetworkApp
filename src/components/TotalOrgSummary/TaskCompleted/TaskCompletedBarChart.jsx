/* eslint-disable no-alert */
import TinyBarChart from '../TinyBarChart';
import Loading from '../../common/Loading';

export const normalizeTaskCompletedStats = data => {
  const assigned = data?.active || data?.assigned || {};
  const completed = data?.complete || data?.completed || {};

  return [
    {
      name: 'Assigned',
      amount: assigned.current || 0,
      change: assigned.percentage || 0,
    },
    {
      name: 'Completed',
      amount: completed.current || 0,
      change: completed.percentage || 0,
    },
  ];
};

export default function TaskCompletedBarChart({ isLoading, data, darkMode }) {
  const stats = normalizeTaskCompletedStats(data);

  const chartData = stats.map((item, index) => {
    let fontcolor = 'red';

    if (item.change >= 0) {
      fontcolor = darkMode ? 'lightgreen' : 'green';
    }

    return {
      name: item.name,
      amount: item.amount,
      change: `${item.change >= 0 ? '+' : ''}${item.change}%`,
      fontcolor,
      color: index === 0 ? '#8e44ad' : '#3498db',
    };
  });

  const maxValue = Math.max(...stats.map(item => item.amount), 0);

  const maxY = maxValue + Math.floor(maxValue / 10) + 1;

  const tickInterval = Math.max(Math.floor(maxY / 10), 1);

  const renderCustomizedLabel = props => {
    const { x, y, width, value, index } = props;

    const { change, fontcolor } = chartData[index];

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 25}
          fill={darkMode ? 'white' : 'black'}
          fontWeight="bold"
          textAnchor="middle"
        >
          {value}
        </text>

        <text x={x + width / 2} y={y - 10} fill={fontcolor} fontSize="0.8em" textAnchor="middle">
          {change}
        </text>
      </g>
    );
  };

  const exportCSV = () => {
    const raw = data?.raw || {};
    const hasRawEntries = value =>
      Array.isArray(value)
        ? value.length > 0
        : value !== null && typeof value === 'object' && Object.keys(value).length > 0;

    if (!hasRawEntries(raw.current) && !hasRawEntries(raw.comparison)) {
      alert('No raw data available to export.');
      return;
    }

    let csv = 'Range,Status,Count\n';

    const appendRows = (range, entries) => {
      if (Array.isArray(entries)) {
        entries.forEach(item => {
          csv += `${range},${item._id},${item.count}\n`;
        });
        return;
      }

      Object.entries(entries || {}).forEach(([status, count]) => {
        csv += `${range},${status},${count}\n`;
      });
    };

    appendRows('Current', raw.current);
    appendRows('Comparison', raw.comparison);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'task-stats.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        height: '380px',
        minHeight: '300px',
        maxHeight: '548px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          textAlign: 'right',
          marginBottom: '8px',
        }}
      >
        <button
          onClick={exportCSV}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: darkMode ? '#555' : '#ccc',
            background: darkMode ? '#333' : '#f9f9f9',
            color: darkMode ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <div className="w-100vh" />
            <Loading />
          </div>
        ) : (
          <TinyBarChart
            chartData={chartData}
            maxY={maxY}
            tickInterval={tickInterval}
            renderCustomizedLabel={renderCustomizedLabel}
            darkMode={darkMode}
            yAxisLabel="Total Tasks"
          />
        )}
      </div>
    </div>
  );
}
