import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AnalyticsDashboard from './AnalyticsDashboard';
import httpService from '~/services/httpService';
import logService from '~/services/logService';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('~/services/httpService', () => ({
  default: {
    get: vi.fn(),
    setjwt: vi.fn(),
  },
}));

vi.mock('~/services/logService', () => ({
  default: {
    log: vi.fn(),
    logError: vi.fn(),
  },
}));

vi.mock('./MetricCard', () => ({
  default: ({ title, value }) => (
    <div>
      {title}: {value}
    </div>
  ),
}));

vi.mock('./ReportChart', () => ({
  default: ({ title, data, dataKey }) => (
    <div data-testid={`chart-${dataKey}`}>
      {title}: {data.length ? JSON.stringify(data) : 'No data available'}
    </div>
  ),
}));

describe('AnalyticsDashboard API integration', () => {
  const overviewData = {
    averageScore: 90,
    averageTimeSpentMinutes: 120,
    averageEngagementRate: 0.75,
    totalStudents: 4,
    students: [{ id: 'student-1', name: 'Student One' }],
    classes: [{ id: 'class-1', name: 'Math' }],
    timeSeriesData: [{ date: '2026-09-01', averageScore: 80, timeSpent: 30, engagementRate: 0.2 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads overview data from the backend contract without requesting student data', async () => {
    httpService.get.mockResolvedValue({ data: overviewData });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText('Average Score: 90.0%')).toBeInTheDocument();

    expect(httpService.get).toHaveBeenCalledWith(
      ENDPOINTS.ANALYTICS_OVERVIEW,
      expect.objectContaining({ params: expect.any(Object) }),
    );
    expect(httpService.get).not.toHaveBeenCalledWith(
      expect.stringContaining('/analytics/student/'),
      expect.anything(),
    );
  });

  it('formats percentage-point engagement and preserves valid zero metrics', async () => {
    httpService.get.mockResolvedValue({
      data: {
        averageScore: 0,
        averageTimeSpentMinutes: 0,
        averageEngagementRate: 11.333,
        totalStudents: 0,
      },
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText('Average Score: 0.0%')).toBeInTheDocument();
    expect(screen.getByText('Time Spent: 0h 0m')).toBeInTheDocument();
    expect(screen.getByText('Engagement Rate: 11.3%')).toBeInTheDocument();
    expect(screen.getByText('Total Students: 0')).toBeInTheDocument();
    expect(screen.queryByText('Engagement Rate: 1133.3%')).not.toBeInTheDocument();
  });

  it('uses N/A for missing or invalid overview metrics', async () => {
    httpService.get.mockResolvedValue({
      data: {
        averageScore: null,
        averageTimeSpentMinutes: 'invalid',
        averageEngagementRate: Infinity,
        totalStudents: undefined,
      },
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText('Average Score: N/A')).toBeInTheDocument();
    expect(screen.getByText('Time Spent: N/A')).toBeInTheDocument();
    expect(screen.getByText('Engagement Rate: N/A')).toBeInTheDocument();
    expect(screen.getByText('Total Students: N/A')).toBeInTheDocument();
  });

  it('renders an API failure without throwing and uses the valid logger method', async () => {
    httpService.get.mockRejectedValue({ response: { status: 500 } });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Failed to fetch analytics data/)).toBeInTheDocument();

    expect(logService.logError).toHaveBeenCalled();
    expect(logService.log).not.toHaveBeenCalled();
  });

  it('uses overview data for selected student filters without a redundant student request', async () => {
    httpService.get
      .mockResolvedValueOnce({ data: overviewData })
      .mockResolvedValueOnce({ data: { ...overviewData, averageScore: 75 } });

    render(<AnalyticsDashboard />);
    expect(await screen.findByRole('option', { name: 'Student One' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: 'student-1' } });

    await waitFor(() => {
      expect(httpService.get).toHaveBeenCalledWith(
        ENDPOINTS.ANALYTICS_OVERVIEW,
        expect.objectContaining({ params: expect.objectContaining({ studentId: 'student-1' }) }),
      );
    });
    expect(await screen.findByText('Average Score: 75.0%')).toBeInTheDocument();

    expect(httpService.get).not.toHaveBeenCalledWith(
      expect.stringContaining('/analytics/student/'),
      expect.anything(),
    );
  });

  it('removes studentId when returning to All Students', async () => {
    httpService.get.mockResolvedValue({ data: overviewData });
    render(<AnalyticsDashboard />);
    await screen.findByRole('option', { name: 'Student One' });

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: 'student-1' } });
    await waitFor(() =>
      expect(httpService.get).toHaveBeenLastCalledWith(
        ENDPOINTS.ANALYTICS_OVERVIEW,
        expect.objectContaining({ params: expect.objectContaining({ studentId: 'student-1' }) }),
      ),
    );

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: '' } });
    await waitFor(() => {
      const [, config] = httpService.get.mock.calls.at(-1);
      expect(config.params.studentId).toBeUndefined();
    });
  });

  it('sends class, student, and date filters together and removes cleared dates', async () => {
    httpService.get.mockResolvedValue({ data: overviewData });
    render(<AnalyticsDashboard />);
    await screen.findByRole('option', { name: 'Student One' });

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: 'student-1' } });
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'class-1' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-01' } });

    await waitFor(() => {
      const [, config] = httpService.get.mock.calls.at(-1);
      expect(config.params).toMatchObject({
        studentId: 'student-1',
        classId: 'class-1',
        startDate: '2026-09-01',
        endDate: '2026-09-01',
      });
    });

    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '' } });
    await waitFor(() => {
      const [, config] = httpService.get.mock.calls.at(-1);
      expect(config.params.startDate).toBeUndefined();
    });
  });

  it('blocks reversed date ranges without an API request', async () => {
    httpService.get.mockResolvedValue({ data: overviewData });
    render(<AnalyticsDashboard />);
    await screen.findByRole('option', { name: 'Student One' });

    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-03' } });
    await waitFor(() => expect(httpService.get).toHaveBeenCalledTimes(2));
    const requestCount = httpService.get.mock.calls.length;

    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-02' } });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Start Date must be on or before End Date.',
    );
    expect(httpService.get).toHaveBeenCalledTimes(requestCount);
  });

  it('renders backend time-series data through all existing charts and preserves empty data', async () => {
    httpService.get
      .mockResolvedValueOnce({ data: overviewData })
      .mockResolvedValueOnce({ data: { ...overviewData, timeSeriesData: [] } });
    render(<AnalyticsDashboard />);

    expect(await screen.findByTestId('chart-averageScore')).toHaveTextContent('2026-09-01');
    expect(screen.getByTestId('chart-timeSpent')).toHaveTextContent('"timeSpent":30');
    expect(screen.getByTestId('chart-engagementRate')).toHaveTextContent('"engagementRate":0.2');

    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'class-1' } });

    await waitFor(() => {
      expect(screen.getAllByText(/No data available/)).toHaveLength(3);
    });
  });
});
