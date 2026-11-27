import { cloneElement, isValidElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProjectStatusDonutChart from '../ProjectStatusDonutChart';
import { fetchProjectStatusSummary } from '~/services/projectStatusService';

vi.mock('~/services/projectStatusService', () => ({
  fetchProjectStatusSummary: vi.fn(),
}));

// recharts renders to SVG via layout measurements that jsdom can't provide,
// so it's mocked to expose the data it receives instead of pixel output.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data, children }) => (
    <>
      {data.map(d => (
        <div key={d.name} data-testid="pie-slice">{`${d.name}:${d.value}`}</div>
      ))}
      {children}
    </>
  ),
  Cell: () => null,
  Label: ({ content }) =>
    typeof content === 'function' ? <svg>{content({ viewBox: { cx: 50, cy: 50 } })}</svg> : null,
  // The Tooltip's `content` prop is the real <CustomTooltip /> element defined in
  // the component file; cloning it with sample props exercises its formatting logic.
  Tooltip: ({ content }) =>
    isValidElement(content)
      ? cloneElement(content, {
          active: true,
          payload: [{ name: 'Active Projects', value: 3, payload: { total: 6 } }],
        })
      : null,
  Legend: () => <div data-testid="legend" />,
}));

const mockStore = configureStore([]);

const renderComponent = (darkMode = false) => {
  const store = mockStore({ theme: { darkMode } });
  return render(
    <Provider store={store}>
      <ProjectStatusDonutChart />
    </Provider>,
  );
};

const mockSummary = {
  totalProjects: 6,
  activeProjects: 3,
  completedProjects: 2,
  delayedProjects: 1,
  percentages: { active: 50, completed: 33.3, delayed: 16.7 },
  window: { startDate: null, endDate: null },
};

describe('ProjectStatusDonutChart', () => {
  beforeEach(() => {
    fetchProjectStatusSummary.mockReset();
  });

  it('shows a loading message on initial render', () => {
    fetchProjectStatusSummary.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading project status...')).toBeInTheDocument();
  });

  it('fetches the summary on mount with no date filters', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(1));
    expect(fetchProjectStatusSummary).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('renders the summary counts and chart once data loads', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();

    expect(await screen.findByText('PROJECT STATUS')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE PROJECTS')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED PROJECTS')).toBeInTheDocument();
    expect(screen.getByText('DELAYED PROJECTS')).toBeInTheDocument();

    const matchValue = text => (_, el) =>
      el.tagName.toLowerCase() === 'span' && el.textContent === text;
    expect(screen.getByText(matchValue('3'))).toBeInTheDocument();
    expect(screen.getByText(matchValue('2'))).toBeInTheDocument();
    expect(screen.getByText(matchValue('1'))).toBeInTheDocument();

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Active Projects:3')).toBeInTheDocument();
    expect(screen.getByText('Completed Projects:2')).toBeInTheDocument();
    expect(screen.getByText('Delayed Projects:1')).toBeInTheDocument();
  });

  it('renders the total projects count as the donut center label', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    expect(await screen.findByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    fetchProjectStatusSummary.mockRejectedValue(new Error('network error'));
    renderComponent();
    expect(await screen.findByText('Unable to load project status.')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('shows a no-data message when every status count is zero', async () => {
    fetchProjectStatusSummary.mockResolvedValue({
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      delayedProjects: 0,
      percentages: { active: 0, completed: 0, delayed: 0 },
      window: { startDate: null, endDate: null },
    });
    renderComponent();
    expect(await screen.findByText('No project status data available.')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('re-fetches with the selected date range when Apply is clicked', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await screen.findByText('PROJECT STATUS');

    const [startInput, endInput] = screen.getAllByDisplayValue('');
    await userEvent.type(startInput, '2026-01-01');
    await userEvent.type(endInput, '2026-01-31');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2));
    expect(fetchProjectStatusSummary).toHaveBeenLastCalledWith({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
  });

  it('constrains the date inputs so start cannot be after end and end cannot be before start', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await screen.findByText('PROJECT STATUS');

    const [startInput, endInput] = screen.getAllByDisplayValue('');
    await userEvent.type(endInput, '2026-01-31');
    expect(startInput).toHaveAttribute('max', '2026-01-31');

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '2026-01-01');
    expect(endInput).toHaveAttribute('min', '2026-01-01');
  });

  it('applies the dark theme class when darkMode is enabled in the store', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    const { container } = renderComponent(true);
    await screen.findByText('PROJECT STATUS');
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('[class*="dark"]')).toBeInTheDocument();
  });

  it('renders the current date as a heading in the summary box', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await screen.findByText('PROJECT STATUS');

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    expect(screen.getByRole('heading', { name: today })).toBeInTheDocument();
  });

  it('formats the tooltip with the slice name, raw count, and computed share', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await screen.findByText('PROJECT STATUS');

    const matchParagraph = text => (_, el) =>
      el.tagName.toLowerCase() === 'p' && el.textContent === text;

    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText(matchParagraph('Count: 3'))).toBeInTheDocument();
    expect(screen.getByText(matchParagraph('Share: 50%'))).toBeInTheDocument();
  });

  it('fetches with only the start date when the end date is left blank', async () => {
    fetchProjectStatusSummary.mockResolvedValue(mockSummary);
    renderComponent();
    await screen.findByText('PROJECT STATUS');

    const [startInput] = screen.getAllByDisplayValue('');
    await userEvent.type(startInput, '2026-02-01');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2));
    expect(fetchProjectStatusSummary).toHaveBeenLastCalledWith({
      startDate: '2026-02-01',
      endDate: undefined,
    });
  });
});
