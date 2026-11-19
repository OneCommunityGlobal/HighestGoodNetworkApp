// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import WinningVsAverageBidChart, {
  formatBidTooltipLabel,
  getBidTooltipFooter,
} from '../WinningVsAverageBidChart';

vi.mock('axios');

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => <div data-testid="bid-chart">{data.labels.join(',')}</div>,
}));

vi.mock('@mui/x-date-pickers/DatePicker', async () => {
  const dayjs = (await vi.importActual('dayjs')).default;
  return {
    DatePicker: ({ onChange }) => (
      <input data-testid="date-picker" onChange={e => onChange(dayjs(e.target.value))} />
    ),
  };
});

const response = {
  data: {
    data: [
      { id: 'l1', name: 'Cabin A', averageBid: 150, winningBid: 200, totalBids: 2 },
      { id: 'l2', name: 'Cabin B', averageBid: 300, winningBid: null, totalBids: 1 },
    ],
    filters: { listings: [], villages: [] },
  },
};

describe('WinningVsAverageBidChart', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it('renders backend data and returns the same chart for repeated identical filters', async () => {
    axios.get.mockResolvedValue(response);
    render(<WinningVsAverageBidChart />);

    expect(await screen.findByTestId('bid-chart')).toHaveTextContent('Cabin A,Cabin B');

    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get.mock.calls[1][1]).toEqual(axios.get.mock.calls[0][1]);
    expect(await screen.findByTestId('bid-chart')).toHaveTextContent('Cabin A,Cabin B');
  });

  it('clears the chart and skips the request when the date range is invalid', async () => {
    axios.get.mockResolvedValue(response);
    render(<WinningVsAverageBidChart />);
    expect(await screen.findByTestId('bid-chart')).toBeInTheDocument();

    const [fromDate, toDate] = screen.getAllByTestId('date-picker');
    fireEvent.change(fromDate, { target: { value: '2026-03-10' } });
    fireEvent.change(toDate, { target: { value: '2026-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

    expect(await screen.findByText('From Date must be on or before To Date.')).toBeInTheDocument();
    expect(screen.queryByTestId('bid-chart')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the API request fails', async () => {
    axios.get.mockRejectedValue({ response: { data: { error: 'boom' } } });
    render(<WinningVsAverageBidChart />);

    expect(await screen.findByText('Failed to load chart data: boom')).toBeInTheDocument();
    expect(screen.queryByTestId('bid-chart')).not.toBeInTheDocument();
  });

  it('shows the empty state when no bids match', async () => {
    axios.get.mockResolvedValue({ data: { data: [], filters: { listings: [], villages: [] } } });
    render(<WinningVsAverageBidChart />);

    expect(await screen.findByText(/No bids found for the selected filters/)).toBeInTheDocument();
  });
});

describe('bid tooltip helpers', () => {
  const data = response.data.data;

  it('formats bid values and missing winners in the label', () => {
    expect(formatBidTooltipLabel({ dataset: { label: 'Winning Bid' }, parsed: { y: 199.6 } })).toBe(
      'Winning Bid: $200',
    );
    expect(formatBidTooltipLabel({ dataset: { label: 'Winning Bid' }, parsed: { y: null } })).toBe(
      'Winning Bid: No confirmed winner yet',
    );
  });

  it('adds a footer only for listings without a confirmed winner', () => {
    expect(getBidTooltipFooter([{ dataIndex: 0 }], data)).toBe('');
    expect(getBidTooltipFooter([{ dataIndex: 1 }], data)).toBe(
      'Winning Bid: No confirmed winner yet',
    );
  });
});
