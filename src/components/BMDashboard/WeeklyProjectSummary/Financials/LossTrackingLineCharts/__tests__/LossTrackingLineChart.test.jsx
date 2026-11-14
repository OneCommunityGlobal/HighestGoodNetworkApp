import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { vi } from 'vitest';
import LossTrackingLineChart, { getSeriesStyle, MATERIAL_DASH } from '../LossTrackingLineChart';
import { renderWithProvider } from '../../../../../../__tests__/utils';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

const mockStore = configureMockStore([thunk]);
const YEARS = ['2022', '2023', '2024'];
const MATERIALS = ['Metal', 'Plastic', 'Glass'];

const renderChart = (darkMode = false) =>
  renderWithProvider(<LossTrackingLineChart />, {
    store: mockStore({ theme: { darkMode } }),
  });

// Each legend entry draws a short sample line; read its label, color and dash pattern
const legendStyles = () =>
  screen.getAllByTestId('legend-line-sample').map(sample => ({
    label: sample.getAttribute('data-label'),
    color: sample.getAttribute('data-color'),
    dash: sample.getAttribute('data-dash') || '',
  }));

describe('Loss Tracking line styles', () => {
  it.each([
    ['light', false],
    ['dark', true],
  ])('gives every year and material its own color in %s mode', (_mode, darkMode) => {
    const colors = YEARS.flatMap(year =>
      MATERIALS.map(material => getSeriesStyle(year, material, darkMode).color),
    );
    expect(new Set(colors).size).toBe(9);
  });

  it('gives each material its own line style that is the same in every year', () => {
    MATERIALS.forEach(material => {
      YEARS.forEach(year => {
        expect(getSeriesStyle(year, material, false).dash).toBe(MATERIAL_DASH[material]);
      });
    });
    expect(new Set(Object.values(MATERIAL_DASH)).size).toBe(3);
  });

  it('uses lighter shades in dark mode', () => {
    expect(getSeriesStyle(2024, 'Glass', true).color).not.toBe(
      getSeriesStyle(2024, 'Glass', false).color,
    );
  });

  it('falls back to a gray solid line for an unknown year or material', () => {
    expect(getSeriesStyle(2030, 'Wood', false)).toEqual({ color: '#6c757d', dash: '' });
  });
});

describe('Loss Tracking legend', () => {
  it('shows all 9 lines with a different color and style pair for each', () => {
    renderChart();

    const items = legendStyles();
    expect(items).toHaveLength(9);
    expect(new Set(items.map(item => `${item.color}|${item.dash}`)).size).toBe(9);
  });

  it('can tell 2024 Plastic and 2024 Glass apart, the pair from the bug report', () => {
    renderChart();

    const items = legendStyles();
    const plastic = items.find(item => item.label === '2024 - Plastic');
    const glass = items.find(item => item.label === '2024 - Glass');
    expect(plastic.color).not.toBe(glass.color);
    expect(plastic.dash).not.toBe(glass.dash);
  });

  it('matches the legend to the line styles in dark mode', () => {
    renderChart(true);

    const metal2022 = legendStyles().find(item => item.label === '2022 - Metal');
    expect(metal2022.color).toBe(getSeriesStyle(2022, 'Metal', true).color);
    expect(metal2022.dash).toBe('');
  });

  it('keeps the material style when filtering to one material', async () => {
    renderChart();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Material' }), 'Glass');

    const items = legendStyles();
    expect(items.map(item => item.label)).toEqual(['2022 - Glass', '2023 - Glass', '2024 - Glass']);
    items.forEach(item => expect(item.dash).toBe(MATERIAL_DASH.Glass));
  });
});
