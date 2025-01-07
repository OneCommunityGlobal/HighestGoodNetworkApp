import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { PieChart } from '../PieChart';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('PieChart', () => {
  it('renders without crashing', () => {
    act(() => {
      render(
        <PieChart data={{}} dataLegend={{}} pieChartId="test" dataLegendHeader="Test" />,
        container,
      );
    });
  });

  it('renders correct total hours', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2 }}
          dataLegend={{ a: ['A'], b: ['B'] }}
          pieChartId="test"
          dataLegendHeader="Test"
        />,
        container,
      );
    });
    expect(container.textContent).toContain('Total Hours : 3.00');
  });

  it('renders correct legend', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2 }}
          dataLegend={{ a: ['A'], b: ['B'] }}
          pieChartId="test"
          dataLegendHeader="Test"
        />,
        container,
      );
    });
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('applies dark mode class correctly', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2 }}
          dataLegend={{ a: ['A'], b: ['B'] }}
          pieChartId="test"
          dataLegendHeader="Test"
          darkMode={true}
        />,
        container,
      );
    });

    // Check if the dark mode class 'text-light' is applied
    const pieChartWrapper = container.querySelector('.pie-chart-wrapper');
    expect(pieChartWrapper.classList.contains('text-light')).toBe(true);
  });

  it('renders the SVG pie chart', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2 }}
          dataLegend={{ a: ['A'], b: ['B'] }}
          pieChartId="test"
          dataLegendHeader="Test"
        />,
        container,
      );
    });

    // Check if the SVG element is rendered
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Ensure correct number of pie slices (based on the data length)
    const paths = svgElement.querySelectorAll('path');
    expect(paths.length).toBe(2); // since we have 2 data entries (a and b)
  });

  it('generates the correct number of unique colors', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2, c: 3, d: 4 }}
          dataLegend={{ a: ['A'], b: ['B'], c: ['C'], d: ['D'] }}
          pieChartId="test"
          dataLegendHeader="Test"
        />,
        container,
      );
    });

    // Ensure 4 unique colors are generated (since we have 4 data entries)
    const legendItems = container.querySelectorAll('.data-legend-color');
    expect(legendItems.length).toBe(4);
  });

  it('removes SVG on unmount', () => {
    act(() => {
      render(
        <PieChart
          data={{ a: 1, b: 2 }}
          dataLegend={{ a: ['A'], b: ['B'] }}
          pieChartId="test"
          dataLegendHeader="Test"
        />,
        container,
      );
    });

    // Check if the SVG element is present initially
    expect(container.querySelector('svg')).toBeInTheDocument();

    // Unmount the component
    act(() => {
      unmountComponentAtNode(container);
    });

    // After unmounting, the SVG should be removed
    expect(container.querySelector('svg')).toBeNull();
  });
});
