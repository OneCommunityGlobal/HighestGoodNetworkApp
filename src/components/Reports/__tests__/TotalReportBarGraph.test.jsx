/* eslint-disable testing-library/no-node-access */
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import TotalReportBarGraph from '../TotalReport/TotalReportBarGraph';

let chartWidth = 360;
let boundsSpy;

const makeData = count =>
  Array.from({ length: count }, (_, index) => ({
    label: String(2018 + index),
    value: index + 1,
  }));

const renderChart = (barData, darkMode = false) => {
  const store = createStore(() => ({ theme: { darkMode } }));
  return render(
    <Provider store={store}>
      <TotalReportBarGraph barData={barData} range="year" />
    </Provider>,
  );
};

beforeEach(() => {
  chartWidth = 360;
  boundsSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    width: chartWidth,
    height: chartWidth,
    top: 0,
    right: chartWidth,
    bottom: chartWidth,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }));
});

afterEach(() => {
  boundsSpy.mockRestore();
});

describe('TotalReportBarGraph responsive labels', () => {
  it('rotates and sizes year labels on narrow charts and thins ticks when needed', () => {
    renderChart(makeData(20));

    const svg = document.getElementById('svg-container-year');
    const yearLabels = svg.querySelectorAll('.tick text');

    expect(yearLabels.length).toBeLessThanOrEqual(10);
    yearLabels.forEach(label => {
      expect(label.getAttribute('transform')).toBe('rotate(-35)');
      expect(label.getAttribute('text-anchor')).toBe('end');
      expect(label.style.fontSize).toBe('8px');
    });
    expect(svg.querySelectorAll('.bar-value')).toHaveLength(0);
  });

  it('redraws readable labels after resizing to desktop width', () => {
    renderChart(makeData(6));

    let svg = document.getElementById('svg-container-year');
    expect(svg.querySelector('.tick text').style.fontSize).toBe('8px');
    expect(svg.querySelectorAll('.bar-value')).toHaveLength(6);
    svg.querySelectorAll('.bar-value').forEach(label => {
      expect(Number.parseFloat(label.style.fontSize)).toBeLessThanOrEqual(9);
    });

    chartWidth = 1400;
    fireEvent(window, new Event('resize'));

    svg = document.getElementById('svg-container-year');
    expect(svg.querySelectorAll('.tick text')).toHaveLength(6);
    expect(svg.querySelector('.tick text').style.fontSize).toBe('11px');
    expect(svg.querySelectorAll('.bar-value')).toHaveLength(6);
    svg.querySelectorAll('.bar-value').forEach(label => {
      expect(Number.parseFloat(label.style.fontSize)).toBeLessThanOrEqual(12);
    });
  });

  it('uses light labels in dark mode', () => {
    chartWidth = 1400;
    renderChart(makeData(3), true);

    const svg = document.getElementById('svg-container-year');
    expect(svg.querySelector('.tick text').style.fill).toBe('white');
    expect(svg.querySelector('.bar-value').style.fill).toBe('white');
  });
});
