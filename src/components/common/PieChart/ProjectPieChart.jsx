/* eslint-disable import/prefer-default-export */
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
} from 'recharts';
import { CHART_RADIUS, CHART_SIZE } from './constants'; // use same numbers as the D3 chart
import './UserProjectPieChart.css';

const BASE_COLORS = [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#651067',
  '#329262',
];

function toChartData(projectsData) {
  return (projectsData || [])
    .map(p => ({
      id: p.projectId,
      name: p.projectName || 'Unnamed',
      value: Number(p.totalTime || 0),
    }))
    .filter(d => d.value > 0);
}

/** Single-line label + center toggle (matches bottom donut behavior) */
function CenterLabel({ viewBox, total, darkMode, showPct, onToggle }) {
  if (!viewBox || total <= 0) return null;
  const { cx, cy } = viewBox;
  const text = showPct ? '100% All Projects' : `${total.toFixed(2)} Hrs`;

  return (
    <g>
      <text x={cx} y={cy + 4} textAnchor="middle" fill={darkMode ? '#fff' : '#111'} fontSize="18">
        {text}
      </text>

      {/* same switch you use in the D3 chart */}
      <foreignObject x={cx - 18} y={cy + 12} width="36" height="28">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <label className="switch">
            {/* Accessible text for the label */}
            <span className="sr-only">Show percentage</span>

            {/* The control associated with the label */}
            <input
              type="checkbox"
              checked={showPct}
              onChange={e => onToggle(e.target.checked)}
              aria-label="Show percentage"
            />

            <span className="slider" aria-hidden="true" />
          </label>
        </div>
      </foreignObject>
    </g>
  );
}

export default function UserProjectD3PieChart({ projectsData, darkMode }) {
  const data = useMemo(() => toChartData(projectsData), [projectsData]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const colors = useMemo(() => data.map((_, i) => BASE_COLORS[i % BASE_COLORS.length]), [
    data.length,
  ]);
  const [showPct, setShowPct] = useState(false);

  if (!data.length || total === 0) return null;

  return (
    <div className={`pie-chart-wrapper donut-no-outline ${darkMode ? 'text-light' : ''}`}>
      {/* Square box so the donut isn't clipped; same size as D3 chart */}
      <div style={{ width: CHART_SIZE, height: CHART_SIZE }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70} // <- same as D3
              outerRadius={CHART_RADIUS} // <- same as D3
              label={false} // no labels
              labelLine={false} // no pointers
              isAnimationActive={false}
              stroke="none"
            >
              <Label
                position="center"
                content={props => (
                  <CenterLabel
                    {...props}
                    total={total}
                    darkMode={darkMode}
                    showPct={showPct}
                    onToggle={setShowPct}
                  />
                )}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, _name, entry) =>
                showPct
                  ? [`${((Number(value) * 100) / total).toFixed(2)}%`, entry?.payload?.name]
                  : [`${Number(value).toFixed(2)} hrs`, entry?.payload?.name]
              }
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      <div className="pie-chart-legend-container" style={{ marginTop: 8, marginLeft: 40 }}>
        <table className={darkMode ? 'pie-chart-legend-table-dark' : 'pie-chart-legend-table'}>
          <thead>
            <tr>
              <th>Color</th>
              <th>Project Name</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={p.id || p.name}>
                <td>
                  <div id="project-chart-legend" style={{ backgroundColor: colors[i] }} />
                </td>
                <td>{p.name}</td>
                <td>{p.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="data-total-value" style={{ marginTop: 8 }}>
          <strong className={`strong-text ${darkMode ? 'text-light' : ''}`}>Total Hours:</strong>{' '}
          {total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export { UserProjectD3PieChart };
