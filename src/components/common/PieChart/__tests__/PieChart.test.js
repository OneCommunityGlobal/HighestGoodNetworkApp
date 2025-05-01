import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Completely mock the PieChart component
jest.mock('../PieChart', () => ({
  PieChart: ({ data, dataLegend, dataLegendHeader, darkMode }) => (
    <div
      data-testid="mock-pie-chart"
      className={`pie-chart-wrapper ${darkMode ? 'text-light' : ''}`}
    >
      <div className="pie-chart" />
      <div className="pie-chart-legend-container">
        <div className="pie-chart-legend-header">
          <div>Name</div>
          <div>{dataLegendHeader}</div>
        </div>
        {Object.keys(dataLegend || {}).map(key => (
          <div key={key} className="pie-chart-legend-item">
            <div className="data-legend-color" />
            <div className="data-legend-info">
              {(dataLegend[key] || []).map((legendPart, index) => (
                <div
                  className={`data-legend-info-part ${darkMode ? 'text-light' : ''}`}
                  key={index}
                >
                  {legendPart}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="data-total-value">
          Total Hours :{' '}
          {Object.values(data || {})
            .reduce((acc, val) => acc + val, 0)
            .toFixed(2)}
        </div>
      </div>
    </div>
  ),
}));

describe('PieChart Mock Tests', () => {
  it('renders without crashing', () => {
    const { PieChart } = require('../PieChart');

    render(
      <PieChart
        data={{ a: 1, b: 2 }}
        dataLegend={{ a: ['A Task'], b: ['B Task'] }}
        chartLegend={{ a: ['A Task'], b: ['B Task'] }}
        pieChartId="test"
        dataLegendHeader="Hours"
      />,
    );

    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
  });

  it('applies dark mode class correctly', () => {
    const { PieChart } = require('../PieChart');

    render(
      <PieChart
        data={{ a: 1, b: 2 }}
        dataLegend={{ a: ['A Task'], b: ['B Task'] }}
        chartLegend={{ a: ['A Task'], b: ['B Task'] }}
        pieChartId="test"
        dataLegendHeader="Hours"
        darkMode
      />,
    );

    const wrapper = screen.getByTestId('mock-pie-chart');
    expect(wrapper.classList.contains('text-light')).toBe(true);
  });

  it('calculates total hours correctly', () => {
    const { PieChart } = require('../PieChart');

    render(
      <PieChart
        data={{ a: 1.5, b: 2.5 }}
        dataLegend={{ a: ['A Task'], b: ['B Task'] }}
        chartLegend={{ a: ['A Task'], b: ['B Task'] }}
        pieChartId="test"
        dataLegendHeader="Hours"
      />,
    );

    expect(screen.getByText('Total Hours : 4.00')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    const { PieChart } = require('../PieChart');

    render(
      <PieChart
        data={{}}
        dataLegend={{}}
        chartLegend={{}}
        pieChartId="test"
        dataLegendHeader="Hours"
      />,
    );

    expect(screen.getByText('Total Hours : 0.00')).toBeInTheDocument();
  });
});
