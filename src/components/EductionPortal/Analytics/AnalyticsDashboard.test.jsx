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
  default: ({ title }) => <div>{title}</div>,
}));

describe('AnalyticsDashboard API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads overview data from the backend contract without requesting student data', async () => {
    httpService.get.mockResolvedValue({
      data: {
        averageScore: 90,
        averageTimeSpentMinutes: 120,
        averageEngagementRate: 0.75,
        totalStudents: 4,
      },
    });

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

  it('renders an API failure without throwing and uses the valid logger method', async () => {
    httpService.get.mockRejectedValue({ response: { status: 500 } });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Failed to fetch analytics data/)).toBeInTheDocument();

    expect(logService.logError).toHaveBeenCalled();
    expect(logService.log).not.toHaveBeenCalled();
  });

  it('requests selected student analytics from the read-only endpoint', async () => {
    httpService.get.mockImplementation(url => {
      if (url === ENDPOINTS.ANALYTICS_OVERVIEW) {
        return Promise.resolve({
          data: {
            averageScore: 90,
            totalStudents: 4,
            students: [{ id: 'student-1', name: 'Student One' }],
          },
        });
      }

      return Promise.resolve({ data: { studentId: 'student-1', metrics: { averageScore: 95 } } });
    });

    render(<AnalyticsDashboard />);
    expect(await screen.findByText('All Students')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: 'student-1' } });

    await waitFor(() => {
      expect(httpService.get).toHaveBeenCalledWith(
        ENDPOINTS.ANALYTICS_STUDENT('student-1'),
        expect.objectContaining({ params: expect.any(Object) }),
      );
    });

    expect(httpService.get).not.toHaveBeenCalledWith(
      expect.stringContaining('/refresh'),
      expect.anything(),
    );
  });
});
