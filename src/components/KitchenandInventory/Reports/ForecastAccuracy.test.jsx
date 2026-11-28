import { render as renderUI, screen, fireEvent, act, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KitchenReports from './KitchenReports';
import PreservationEfficiency from './PreservationEfficiency';
import KitchenHeader from '../../KitchenInterfaces/KitchenHeader';
import { calculateAccuracy, prepareForecastReport, forecastReportCSV } from './forecastAccuracy';
import mockReport from './forecastAccuracy.mock.json';
import { jsPDF } from 'jspdf';
import { themeReducer } from '../../../reducers/themeReducer';
import styles from './KitchenReports.module.css';

const render = (ui, darkMode = false) => {
  const store = createStore((state, action) => ({ theme: themeReducer(state?.theme, action) }), {
    theme: { darkMode },
  });
  return { ...renderUI(<Provider store={store}>{ui}</Provider>), store };
};

const { pdfSave, pdfTable, pdfText } = vi.hoisted(() => ({
  pdfSave: vi.fn(),
  pdfTable: vi.fn(),
  pdfText: vi.fn(),
}));
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({ setFontSize: vi.fn(), text: vi.fn(), save: pdfSave })),
}));
vi.mock('jspdf-autotable', () => ({ default: pdfTable }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(jsPDF).mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: pdfText,
    save: pdfSave,
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const renderReport = data =>
  render(
    <MemoryRouter initialEntries={['/kitchenandinventory/reports/forecast-accuracy']}>
      <KitchenReports data={data} />
    </MemoryRouter>,
  );

describe('Forecast Accuracy report', () => {
  it('shows the demo quantities, accuracy bars, status labels, and overall summary', () => {
    renderReport(mockReport);
    expect(screen.getByText('Forecast Accuracy Tracker')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
    expect(screen.getByRole('progressbar', { name: 'Carrots forecast accuracy' })).toHaveAttribute(
      'value',
      '88',
    );
    expect(
      screen.getByRole('progressbar', { name: 'Olive Oil forecast accuracy' }),
    ).toHaveAttribute('value', '100');
    expect(screen.getAllByText('High accuracy')).toHaveLength(2);
    expect(screen.getAllByText('Moderate accuracy')).toHaveLength(3);
    expect(screen.getByText('92.4%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forecast Accuracy' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders each ingredient quantity and a native progress element with the matching value', () => {
    renderReport(mockReport);
    mockReport.ingredients.forEach(ingredient => {
      const row = screen
        .getAllByRole('listitem')
        .find(item => within(item).queryByRole('heading', { name: ingredient.name }));
      expect(row).toHaveTextContent(`Planned: ${ingredient.plannedLbs} lbs`);
      expect(row).toHaveTextContent(`Actual: ${ingredient.actualLbs} lbs`);
      const bar = within(row).getByRole('progressbar', {
        name: `${ingredient.name} forecast accuracy`,
      });
      expect(bar.tagName).toBe('PROGRESS');
      expect(bar).toHaveAttribute('max', '100');
      expect(bar).toHaveAttribute('value', String(ingredient.demoAccuracyPercent));
      expect(bar).toHaveProperty('position', ingredient.demoAccuracyPercent / 100);
    });
  });

  it.each([94, 95, 0, 100])('uses the correct accuracy badge and bar color at %s%%', accuracy => {
    renderReport({
      isDemo: true,
      ingredients: [
        {
          id: 'rice',
          name: 'Rice',
          plannedLbs: 100,
          actualLbs: accuracy,
          demoAccuracyPercent: accuracy,
        },
      ],
    });
    const high = accuracy >= 95;
    const badge = screen.getByText(`${accuracy}%`, { exact: false, selector: 'span' });
    expect(screen.getByText(`${high ? 'High' : 'Moderate'} accuracy`)).toBeInTheDocument();
    expect(badge).toHaveClass(high ? styles.high : styles.moderate);
    expect(screen.getByRole('progressbar')).toHaveClass(
      high ? styles.highFill : styles.moderateFill,
    );
  });

  it('renders supplied real records instead of mock ingredients and hides the sample disclaimer', () => {
    renderReport({
      ingredients: [{ id: 'rice', name: 'Brown Rice', plannedLbs: 20, actualLbs: 18 }],
    });
    expect(screen.getByText('Brown Rice')).toBeInTheDocument();
    expect(screen.queryByText('Tomatoes')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '90');
    expect(screen.getByText('90%', { selector: 'strong' })).toBeInTheDocument();
  });

  it('downloads a CSV blob, removes the temporary link, and releases its object URL', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn().mockReturnValue('blob:forecast-report');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }));
    let downloadLink;
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function captureDownload() {
        downloadLink = this;
        expect(document.body.contains(this)).toBe(true);
      });
    renderReport(mockReport);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(click).toHaveBeenCalledTimes(1);
    expect(downloadLink).toHaveAttribute('download', 'forecast-accuracy.csv');
    expect(downloadLink).toHaveAttribute('href', 'blob:forecast-report');
    expect(document.body.contains(downloadLink)).toBe(false);
    act(() => vi.runAllTimers());
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:forecast-report');
  });

  it('includes the selected period and actual values in the PDF export', () => {
    renderReport({ ingredients: [{ id: 'rice', name: 'Rice', plannedLbs: 20, actualLbs: 18 }] });
    fireEvent.change(screen.getByRole('combobox', { name: 'Report period' }), {
      target: { value: 'quarter' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(pdfText).toHaveBeenCalledWith('quarter', 14, 29);
    expect(pdfTable.mock.calls[0][1].body).toEqual([['Rice', 20, 18, '90%']]);
    expect(pdfTable.mock.calls[0][1].foot[0]).toContain('90%');
    expect(pdfSave).toHaveBeenCalledTimes(1);
  });

  it('switches report content through routes while keeping Reports active in the header', () => {
    render(
      <MemoryRouter initialEntries={['/kitchenandinventory/reports/forecast-accuracy']}>
        <KitchenHeader />
        <Switch>
          <Route path="/kitchenandinventory/reports/forecast-accuracy" component={KitchenReports} />
          <Route
            path="/kitchenandinventory/reports/preservation-efficiency"
            component={PreservationEfficiency}
          />
        </Switch>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Preservation Efficiency' }));
    expect(screen.getByRole('heading', { name: 'Preservation Impact' })).toBeInTheDocument();
    expect(screen.queryByText('Forecast Accuracy Tracker')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('link', { name: 'Forecast Accuracy' }));
    expect(screen.getByText('Forecast Accuracy Tracker')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Preservation Impact' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page');
  });

  it('opens preservation by default from the Reports entry route', () => {
    render(
      <MemoryRouter initialEntries={['/kitchenandinventory/reports']}>
        <Switch>
          <Route exact path="/kitchenandinventory/reports" component={KitchenReports} />
          <Route
            path="/kitchenandinventory/reports/preservation-efficiency"
            component={PreservationEfficiency}
          />
        </Switch>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Preservation Impact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Preservation Efficiency' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('follows live Redux theme changes for the report and kitchen header', () => {
    const { store } = render(
      <MemoryRouter initialEntries={['/kitchenandinventory/reports/forecast-accuracy']}>
        <KitchenHeader />
        <KitchenReports />
      </MemoryRouter>,
      true,
    );
    expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('banner')).toHaveAttribute('data-theme', 'dark');
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
    act(() => store.dispatch({ type: 'TOGGLE_THEME' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('banner')).toHaveAttribute('data-theme', 'light');
    expect(screen.getByText('92.4%')).toBeInTheDocument();
  });

  it('closes the collapsible kitchen menu after choosing Reports', () => {
    render(
      <MemoryRouter initialEntries={['/kitchenandinventory/reports/forecast-accuracy']}>
        <KitchenHeader />
        <KitchenReports />
      </MemoryRouter>,
    );
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('link', { name: 'Reports' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument();
  });

  it.each(['Enter', ' '])('allows the menu overlay to be dismissed with the %s key', key => {
    render(
      <MemoryRouter>
        <KitchenHeader />
      </MemoryRouter>,
    );
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    fireEvent.click(toggle);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close menu' }), { key });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps period changes explicit about using sample data', () => {
    renderReport(mockReport);
    fireEvent.change(screen.getByRole('combobox', { name: 'Report period' }), {
      target: { value: 'week' },
    });
    expect(screen.getByRole('status').tagName).toBe('OUTPUT');
    expect(screen.getByRole('status')).toHaveTextContent('This Week preview');
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
  });

  it('does not show a misleading average for an empty report', () => {
    renderReport({ ingredients: [] });
    expect(
      screen.getByText('No ingredient forecasts available for this period.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Overall Forecast Accuracy')).not.toBeInTheDocument();
  });

  it('ignores demo overrides for real records and calculates a consistent average', () => {
    const report = prepareForecastReport({ ...mockReport, isDemo: false });
    expect(report.ingredients[1].accuracyPercent).toBe(86);
    expect(report.averageAccuracyPercent).toBe(92);
    expect(calculateAccuracy(0, 0)).toBe(100);
    expect(calculateAccuracy(0, 4)).toBe(0);
    expect(calculateAccuracy(10, 25)).toBe(0);
  });

  it('exports the displayed report as a PDF', () => {
    renderReport(mockReport);
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(pdfSave).toHaveBeenCalledWith('forecast-accuracy.pdf');
    expect(pdfTable.mock.calls[0][1].body).toContainEqual(['Carrots', 35, 40, '88%']);
    expect(pdfTable.mock.calls[0][1].foot[0]).toContain('92.4%');
  });

  it('exports displayed demo percentages and escapes ingredient names in CSV', () => {
    const report = prepareForecastReport(mockReport);
    expect(forecastReportCSV(report.ingredients)).toContain('"Carrots","35","40","88"');
    expect(
      forecastReportCSV([
        { name: 'Rice, "brown"', plannedLbs: 1, actualLbs: 1, accuracyPercent: 100 },
      ]),
    ).toContain('"Rice, ""brown"""');
  });
});
