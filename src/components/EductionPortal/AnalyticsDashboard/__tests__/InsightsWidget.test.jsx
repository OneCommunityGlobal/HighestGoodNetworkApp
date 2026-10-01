import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import InsightsWidget, { SummaryCard, getTrend } from '../InsightsWidget';
import styles from '../InsightsWidget.module.css';

const mockStore = configureMockStore([]);

const renderWidget = (darkMode = false) =>
  render(
    <Provider store={mockStore({ theme: { darkMode } })}>
      <InsightsWidget />
    </Provider>,
  );

// Mock fetch resolves after 800ms
const waitForData = () => screen.findByText('Key Insights', {}, { timeout: 3000 });

describe('InsightsWidget', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the loading spinner, then the insights', async () => {
    renderWidget();
    expect(screen.getByText('Loading insights...')).toBeInTheDocument();

    await waitForData();
    expect(screen.queryByText('Loading insights...')).not.toBeInTheDocument();
    expect(screen.getByText('Impact of Life Strategies')).toBeInTheDocument();
    expect(screen.getByText('Top Performing Students')).toBeInTheDocument();
  });

  describe('Impact of Life Strategies', () => {
    it('sorts strategies in descending order of impact', async () => {
      renderWidget();
      await waitForData();

      const values = screen
        .getAllByRole('progressbar')
        .map(bar => Number(bar.getAttribute('aria-valuenow')));

      expect(values).toEqual([92, 88, 79, 76]);
    });

    it('colors each bar using the legend thresholds', async () => {
      renderWidget();
      await waitForData();

      const fillFor = name =>
        within(screen.getByRole('progressbar', { name })).getByTestId('strategy-fill');

      expect(fillFor('Everything you do should increase choices')).toHaveStyle({
        backgroundColor: '#10b981',
      });
      expect(fillFor('Ask "what would Love do?"')).toHaveStyle({ backgroundColor: '#84cc16' });
      expect(fillFor('Practice improving your emotional intelligence')).toHaveStyle({
        backgroundColor: '#fbbf24',
      });
      expect(fillFor('Choose to lead with observation')).toHaveStyle({
        backgroundColor: '#fbbf24',
      });
    });

    it('only uses bar colors that appear in the legend', async () => {
      renderWidget();
      await waitForData();

      const legendColors = screen
        .getAllByTestId('legend-dot')
        .map(dot => dot.style.backgroundColor);
      const barColors = screen
        .getAllByTestId('strategy-fill')
        .map(fill => fill.style.backgroundColor);

      barColors.forEach(color => expect(legendColors).toContain(color));
    });

    it('renders a legend entry for every impact level', async () => {
      renderWidget();
      await waitForData();

      [
        'High Impact (90+)',
        'Good Result (80-89)',
        'Moderate Impact (70-79)',
        'Low Impact (<70)',
      ].forEach(label => expect(screen.getByText(label)).toBeInTheDocument());
    });

    it('exposes accessible progressbar attributes', async () => {
      renderWidget();
      await waitForData();

      const bar = screen.getByRole('progressbar', {
        name: 'Everything you do should increase choices',
      });
      expect(bar).toHaveAttribute('aria-valuenow', '92');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-valuetext', '92% impact');
    });
  });

  describe('Top Performing Students', () => {
    it('shows positive and negative trends with matching styles', async () => {
      renderWidget();
      await waitForData();

      expect(screen.getByText('↑ 2.5%')).toHaveClass(styles.trendPositive);
      expect(screen.getByText('↓ 0.5%')).toHaveClass(styles.trendNegative);
    });
  });

  describe('summary cards', () => {
    it('shows count changes as whole numbers', async () => {
      renderWidget();
      await waitForData();

      expect(screen.getByText(/\+12 this month/)).toBeInTheDocument();
      expect(screen.getByText(/\+8 this month/)).toBeInTheDocument();
      expect(screen.queryByText(/\+12\.0/)).not.toBeInTheDocument();
    });

    it('shows percentage changes with one decimal place', async () => {
      renderWidget();
      await waitForData();

      expect(screen.getByText(/\+5\.2% this month/)).toBeInTheDocument();
      expect(screen.getByText(/\+3\.1% this month/)).toBeInTheDocument();
    });
  });

  it('clears pending timers on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = renderWidget();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('applies dark mode styles when enabled', async () => {
    renderWidget(true);
    await waitForData();

    expect(screen.getByTestId('insights-widget')).toHaveClass(styles.dark);
  });
});

describe('SummaryCard', () => {
  const changeLine = () => screen.getByTestId('card-change');

  it('renders a positive change as green with an up arrow', () => {
    render(<SummaryCard title="Score" value={78.5} change={5.2} unit="%" />);
    const line = changeLine();

    expect(line).toHaveClass(styles.changePositive);
    expect(within(line).getByText('↑')).toBeInTheDocument();
    expect(line).toHaveTextContent('+5.2% this month');
  });

  it('renders a negative change as red with a down arrow', () => {
    render(<SummaryCard title="Score" value={78.5} change={-2.4} unit="%" />);
    const line = changeLine();

    expect(line).toHaveClass(styles.changeNegative);
    expect(within(line).getByText('↓')).toBeInTheDocument();
    expect(line).toHaveTextContent('-2.4% this month');
  });

  it('renders a zero change as neutral instead of a loss', () => {
    render(<SummaryCard title="Score" value={78.5} change={0} unit="%" />);
    const line = changeLine();

    expect(line).toHaveClass(styles.changeNeutral);
    expect(line).not.toHaveClass(styles.changeNegative);
    expect(within(line).getByText('–')).toBeInTheDocument();
    expect(line).toHaveTextContent('0.0% this month');
  });

  it('formats counts without decimals or units', () => {
    render(<SummaryCard title="Students" value={1245} change={-3} isCount />);

    expect(screen.getByText('1,245')).toBeInTheDocument();
    expect(changeLine()).toHaveTextContent('-3 this month');
  });

  it('renders nothing without a title or value', () => {
    const { container: noTitle } = render(<SummaryCard value={10} change={1} />);
    const { container: noValue } = render(<SummaryCard title="Score" value={null} change={1} />);

    expect(noTitle).toBeEmptyDOMElement();
    expect(noValue).toBeEmptyDOMElement();
  });
});

describe('getTrend', () => {
  it('classifies values as up, down or flat', () => {
    expect(getTrend(2.5)).toBe('up');
    expect(getTrend(-0.5)).toBe('down');
    expect(getTrend(0)).toBe('flat');
  });
});
