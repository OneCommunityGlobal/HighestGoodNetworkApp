/* eslint-disable no-unused-vars */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { PieChart } from '../PieChart';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

const mockTasksData = [
  { projectId: 'a', projectName: 'A', totalTime: 1 },
  { projectId: 'b', projectName: 'B', totalTime: 2 },
];

describe('PieChart', () => {
  it('renders without crashing', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" />, container);
    });
  });

  it('renders correct total hours', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" />, container);
    });
    expect(container.textContent).toContain('Total Hours:');
    expect(container.textContent).toContain('3.00');
  });

  it('renders correct legend', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" />, container);
    });
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('applies dark mode class correctly', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" darkMode />, container);
    });

    const pieChartWrapper = container.querySelector('.pie-chart-wrapper');
    expect(pieChartWrapper.classList.contains('text-light')).toBe(true);
  });

  it('renders the SVG pie chart', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" />, container);
    });

    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    const paths = svgElement.querySelectorAll('path');
    expect(paths.length).toBe(2); // 2 entries
  });

  it('generates the correct number of unique colors', () => {
    const data = [
      { projectId: 'a', projectName: 'A', totalTime: 1 },
      { projectId: 'b', projectName: 'B', totalTime: 2 },
      { projectId: 'c', projectName: 'C', totalTime: 3 },
      { projectId: 'd', projectName: 'D', totalTime: 4 },
    ];

    act(() => {
      render(<PieChart tasksData={data} pieChartId="test" />, container);
    });

    const legendItems = container.querySelectorAll('#project-chart-legend');
    expect(legendItems.length).toBe(4);
  });

  it('removes SVG on unmount', () => {
    act(() => {
      render(<PieChart tasksData={mockTasksData} pieChartId="test" />, container);
    });

    expect(container.querySelector('svg')).toBeInTheDocument();

    act(() => {
      unmountComponentAtNode(container);
    });

    expect(container.querySelector('svg')).toBeNull();
  });
});
