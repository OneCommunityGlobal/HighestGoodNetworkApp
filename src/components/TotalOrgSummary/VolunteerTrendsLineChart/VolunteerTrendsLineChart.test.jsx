import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VolunteerTrendsLineChart from './VolunteerTrendsLineChart';

const chart = vi.hoisted(() => ({ data: [], axis: null }));

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('~/components/common/Loading', () => ({ default: () => <div>Loading</div> }));
vi.mock('recharts', () => ({
  LineChart: ({ data, children }) => {
    chart.data = data;
    return <div>{children}</div>;
  },
  XAxis: props => {
    chart.axis = props;
    return <div>{props.label.value}</div>;
  },
  YAxis: () => null,
  Line: () => null,
  CartesianGrid: () => null,
  Tooltip: ({ content }) =>
    content({
      active: true,
      label: chart.data[0]?.xLabel,
      payload: chart.data.length
        ? [{ payload: chart.data[0], value: chart.data[0].totalHours }]
        : [],
    }),
}));

describe('Volunteer Trends labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chart.data = [];
    chart.axis = null;
  });

  it.each([false, true])('shows a week and year once with dark mode %s', async darkMode => {
    axios.get.mockResolvedValue({
      data: [
        { _id: { year: 2026, week: 43 }, totalHours: 7.18 },
        { _id: { year: 2025, week: 43 }, totalHours: 2 },
      ],
    });

    render(<VolunteerTrendsLineChart darkMode={darkMode} />);

    expect(await screen.findByText('Week 43, 2025')).toBeInTheDocument();
    expect(chart.data.map(point => point.xLabel)).toEqual(['W43', 'W43']);
    expect(new Set(chart.data.map(point => point.id)).size).toBe(2);
    expect(chart.axis.label.value).toBe('Week');
    expect(chart.axis.label.fill).toBe(darkMode ? '#ccc' : '#666');
    expect(screen.queryByText(/'25|'26/)).not.toBeInTheDocument();
  });

  it('changes the axis and tooltip to months when monthly grouping is selected', async () => {
    axios.get
      .mockResolvedValueOnce({ data: [{ _id: { year: 2026, week: 43 }, totalHours: 7.18 }] })
      .mockResolvedValueOnce({ data: [{ _id: { year: 2026, month: 10 }, totalHours: 12 }] });

    render(<VolunteerTrendsLineChart darkMode={false} />);
    await screen.findByText('Week 43, 2026');
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'month' } });

    expect(await screen.findByText('Oct, 2026')).toBeInTheDocument();
    expect(chart.data[0].xLabel).toBe('Oct');
    expect(chart.axis.label.value).toBe('Month');
  });

  it('handles an empty response without rendering a tooltip', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<VolunteerTrendsLineChart darkMode={false} />);

    await waitFor(() => expect(screen.queryByText('Loading')).not.toBeInTheDocument());
    expect(chart.data).toEqual([]);
    expect(screen.queryByText(/hours$/)).not.toBeInTheDocument();
  });
});
