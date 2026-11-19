// Test stand-in for recharts, shared by the Kitchen and Inventory dashboard chart tests.
// Recharts needs real sizes to draw, so this lists the data each chart gets and shows
// the tooltip text and axis label for a sample value.
export const ResponsiveContainer = ({ children }) => <div>{children}</div>;
export const PieChart = ({ children }) => <div>{children}</div>;
export const Pie = ({ data }) => (
  <ul data-testid="pie-slices">
    {data.map(d => (
      <li key={d.name}>{`${d.name}: ${d.value}`}</li>
    ))}
  </ul>
);
export const Cell = () => null;
export const Tooltip = ({ formatter }) => {
  const text = formatter(1200, 'Sample', { payload: { percent: 10 } });
  return <span data-testid="tooltip">{Array.isArray(text) ? text[0] : text}</span>;
};

export const LineChart = ({ data, children }) => (
  <div>
    <ul data-testid="line-points">
      {data.map(d => (
        <li key={d.label}>{d.label}</li>
      ))}
    </ul>
    <svg aria-hidden="true">{children}</svg>
  </div>
);
// Draws one marker so the chart's dot renderer runs
export const Line = ({ name, dataKey, dot }) => (
  <g data-testid={`line-${dataKey}`} aria-label={name}>
    {dot({ cx: 10, cy: 10, index: 0 })}
  </g>
);
export const XAxis = () => null;
export const YAxis = ({ label }) => <text data-testid="y-axis">{label.value}</text>;
export const CartesianGrid = () => null;
export const LabelList = () => null;
