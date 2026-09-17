import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectColorCell, ProjectNameCell, ProjectPieTooltip } from '../ProjectPieChart';

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
