import { fetchProjectStatusSummary } from '~/services/projectStatusService';
import httpService from '~/services/httpService';
import { ApiEndpoint } from '~/utils/URL';

vi.mock('~/services/httpService', () => ({
  default: { get: vi.fn() },
}));

const summaryUrl = `${ApiEndpoint}/project-status/summary`;

describe('projectStatusService', () => {
  beforeEach(() => {
    httpService.get.mockReset();
  });

  describe('fetchProjectStatusSummary', () => {
    it('requests the summary endpoint with no query string when no dates are given', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary({});
      expect(httpService.get).toHaveBeenCalledWith(summaryUrl);
    });

    it('defaults to no arguments and no dates when called with nothing', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary();
      expect(httpService.get).toHaveBeenCalledWith(summaryUrl);
    });

    it('appends only startDate to the query string when only startDate is given', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary({ startDate: '2026-01-01' });
      expect(httpService.get).toHaveBeenCalledWith(`${summaryUrl}?startDate=2026-01-01`);
    });

    it('appends only endDate to the query string when only endDate is given', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary({ endDate: '2026-01-31' });
      expect(httpService.get).toHaveBeenCalledWith(`${summaryUrl}?endDate=2026-01-31`);
    });

    it('appends both dates to the query string when both are given', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary({ startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(httpService.get).toHaveBeenCalledWith(
        `${summaryUrl}?startDate=2026-01-01&endDate=2026-01-31`,
      );
    });

    it('formats dates to YYYY-MM-DD regardless of the input format', async () => {
      httpService.get.mockResolvedValue({ data: {} });
      await fetchProjectStatusSummary({
        startDate: '2026-03-05T10:30:00.000Z',
        endDate: new Date(2026, 2, 20),
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `${summaryUrl}?startDate=2026-03-05&endDate=2026-03-20`,
      );
    });

    it('resolves with the response data on success', async () => {
      const payload = { totalProjects: 6, activeProjects: 3 };
      httpService.get.mockResolvedValue({ data: payload });
      const result = await fetchProjectStatusSummary({});
      expect(result).toBe(payload);
    });

    it('throws the server-provided message when the request fails', async () => {
      httpService.get.mockRejectedValue({
        response: { data: { message: 'Invalid startDate' } },
      });
      await expect(fetchProjectStatusSummary({ startDate: 'bad' })).rejects.toThrow(
        'Invalid startDate',
      );
    });

    it('throws a default message when the request fails without a server message', async () => {
      httpService.get.mockRejectedValue(new Error('Network Error'));
      await expect(fetchProjectStatusSummary({})).rejects.toThrow(
        'Failed to fetch project status data',
      );
    });
  });
});
