import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { PieChart } from './PieChart';

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
      render(<PieChart data={{}} dataLegend={{}} pieChartId="test" dataLegendHeader="Test" />, container);
    });
  });

  it('renders correct total hours', () => {
    act(() => {
      render(<PieChart data={{ a: 1, b: 2 }} dataLegend={{ a: ['A'], b: ['B'] }} pieChartId="test" dataLegendHeader="Test" />, container);
    });
    expect(container.textContent).toContain('Total Hours : 3.00');
  });

  it('renders correct legend', () => {
    act(() => {
      render(<PieChart data={{ a: 1, b: 2 }} dataLegend={{ a: ['A'], b: ['B'] }} pieChartId="test" dataLegendHeader="Test" />, container);
    });
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });
});
