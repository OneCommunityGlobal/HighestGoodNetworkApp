import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserProjectD3PieChart, {
  MAX_VISIBLE_PROJECTS,
  ProjectColorCell,
  ProjectNameCell,
  ProjectPieTooltip,
} from '../ProjectPieChart';

const makeProjects = count =>
  Array.from({ length: count }, (unused, i) => ({
    projectId: `proj-${i}`,
    projectName: `Project ${i}`,
    totalTime: 1,
  }));

const renderChart = count =>
  render(<UserProjectD3PieChart projectsData={makeProjects(count)} darkMode={false} />);

const legendRowCount = () => screen.getAllByTestId('project-color-cell').length;

describe('UserProjectD3PieChart legend cap', () => {
  // Pinned to the literal: the other assertions reference MAX_VISIBLE_PROJECTS
  // symbolically and would stay green if the cap were lowered for debugging.
  it('caps the collapsed legend at 10, the agreed product limit', () => {
    expect(MAX_VISIBLE_PROJECTS).toBe(10);
  });

  it('caps the collapsed legend at the limit', () => {
    renderChart(MAX_VISIBLE_PROJECTS + 7);

    expect(legendRowCount()).toBe(MAX_VISIBLE_PROJECTS);
  });

  it('renders every project without a toggle when at or under the cap', () => {
    renderChart(MAX_VISIBLE_PROJECTS);

    expect(legendRowCount()).toBe(MAX_VISIBLE_PROJECTS);
    expect(screen.queryByTestId('toggle-more-projects')).not.toBeInTheDocument();
  });

  it('labels the toggle with the number of hidden projects', () => {
    renderChart(MAX_VISIBLE_PROJECTS + 7);

    expect(screen.getByTestId('toggle-more-projects')).toHaveTextContent('+ 7 more projects');
  });

  it('singularizes the label when exactly one project is hidden', () => {
    renderChart(MAX_VISIBLE_PROJECTS + 1);

    expect(screen.getByTestId('toggle-more-projects')).toHaveTextContent('+ 1 more project');
  });

  it('expands to every project and collapses back to the cap', () => {
    renderChart(MAX_VISIBLE_PROJECTS + 7);
    const toggle = screen.getByTestId('toggle-more-projects');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(legendRowCount()).toBe(MAX_VISIBLE_PROJECTS + 7);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Show less');

    fireEvent.click(toggle);
    expect(legendRowCount()).toBe(MAX_VISIBLE_PROJECTS);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('totals every project, not just the visible ones', () => {
    renderChart(MAX_VISIBLE_PROJECTS + 7);

    // 17 projects x 1 hour each — the cap must not change the reported total.
    expect(screen.getByText('17.00')).toBeInTheDocument();
  });
});

describe('ProjectColorCell', () => {
  it('paints the swatch with the supplied color', () => {
    render(<ProjectColorCell value="#abcdef" />);
    const swatch = screen.getByTestId('project-color-cell');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(171, 205, 239)' });
  });
});

describe('ProjectNameCell', () => {
  it('renders the value inside a span', () => {
    render(<ProjectNameCell value="Project Alpha" />);

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });
});

describe('ProjectPieTooltip', () => {
  const baseProps = {
    active: true,
    payload: [
      {
        name: 'Project A',
        value: 3.5,
        payload: { fill: '#abcdef', index: 0 },
      },
    ],
    colors: ['#abcdef'],
    darkMode: false,
    total: 10,
  };

  it('renders the project name and the padded hours + percentage detail', () => {
    render(<ProjectPieTooltip {...baseProps} />);

    expect(screen.getByTestId('tooltip-name')).toHaveTextContent('Project A');
    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('3.50 hrs (35.0%)');
  });

  it('renders the swatch when one is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: { fill: '#112233', index: 0 } }];
    render(<ProjectPieTooltip {...baseProps} payload={payload} />);
    const swatch = screen.getByTestId('tooltip-swatch');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(17, 34, 51)' });
  });

  it('omits the swatch when none is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: {} }];
    render(<ProjectPieTooltip {...baseProps} payload={payload} colors={[]} />);

    expect(screen.queryByTestId('tooltip-swatch')).not.toBeInTheDocument();
  });

  it('reports 0.0% when total is zero', () => {
    const payload = [{ ...baseProps.payload[0], value: 5 }];
    render(<ProjectPieTooltip {...baseProps} payload={payload} total={0} />);

    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('5.00 hrs (0.0%)');
  });
});
