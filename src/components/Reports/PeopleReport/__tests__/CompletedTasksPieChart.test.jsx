import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ColorSwatchCell,
  PieTooltip,
  TotalHoursLabel,
} from '../CompletedTasksPieChart';

describe('ColorSwatchCell', () => {
  const colorScale = { proj1: '#ff00aa', proj2: '#00aaff' };

  it('paints the swatch with the color looked up from column.colorScale', () => {
    render(<ColorSwatchCell value="proj1" column={{ colorScale }} />);
    const swatch = screen.getByTestId('color-swatch');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 0, 170)' });
  });

  it('renders no background color when the value is not in the colorScale', () => {
    render(<ColorSwatchCell value="unknown" column={{ colorScale }} />);
    const swatch = screen.getByTestId('color-swatch');

    expect(swatch).not.toHaveAttribute('style');
  });
});

describe('TotalHoursLabel', () => {
  it('renders the total hours formatted to two decimals with the Hrs suffix', () => {
    render(
      <svg>
        <TotalHoursLabel total={12.345} darkMode={false} />
      </svg>,
    );
    const text = screen.getByTestId('total-hours-label');

    expect(text).toHaveTextContent('12.35 Hrs');
  });

  it('uses white text in dark mode and black in light mode', () => {
    render(
      <svg>
        <TotalHoursLabel total={1} darkMode />
      </svg>,
    );
    render(
      <svg>
        <TotalHoursLabel total={1} darkMode={false} />
      </svg>,
    );
    const [dark, light] = screen.getAllByTestId('total-hours-label');

    expect(dark).toHaveAttribute('fill', '#ffffff');
    expect(light).toHaveAttribute('fill', '#000000');
  });

  it('centers the label at 50%/50% with text-anchor middle', () => {
    render(
      <svg>
        <TotalHoursLabel total={0} darkMode={false} />
      </svg>,
    );
    const text = screen.getByTestId('total-hours-label');

    expect(text).toHaveAttribute('x', '50%');
    expect(text).toHaveAttribute('y', '50%');
    expect(text).toHaveAttribute('text-anchor', 'middle');
    expect(text).toHaveAttribute('dominant-baseline', 'central');
  });
});

describe('PieTooltip', () => {
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
    render(<PieTooltip {...baseProps} />);

    expect(screen.getByTestId('tooltip-name')).toHaveTextContent('Project A');
    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('3.50 hrs (35.0%)');
  });

  it('renders the swatch when one is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: { fill: '#112233', index: 0 } }];
    render(<PieTooltip {...baseProps} payload={payload} />);
    const swatch = screen.getByTestId('tooltip-swatch');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(17, 34, 51)' });
  });

  it('omits the swatch when none is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: {} }];
    render(<PieTooltip {...baseProps} payload={payload} colors={[]} />);

    expect(screen.queryByTestId('tooltip-swatch')).not.toBeInTheDocument();
  });

  it('reports 0.0% when total is zero', () => {
    const payload = [{ ...baseProps.payload[0], value: 5 }];
    render(<PieTooltip {...baseProps} payload={payload} total={0} />);

    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('5.00 hrs (0.0%)');
  });
});
