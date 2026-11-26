// Test stand-in for recharts, shared by the Kitchen and Inventory pie chart tests.
// Recharts needs real sizes to draw, so this lists the slices it gets and shows
// the tooltip text for a sample slice.
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
export const Tooltip = ({ formatter }) => (
  <span data-testid="tooltip">{formatter(1200, 'Sample', { payload: { percent: 10 } })[0]}</span>
);
