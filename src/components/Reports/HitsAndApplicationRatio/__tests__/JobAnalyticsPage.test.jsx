import { render, screen, waitFor } from '@testing-library/react';
import JobAnalyticsPage from '../JobAnalyticsPage';
import httpService from '~/services/httpService';

const mockTop = [{ title: 'A', applications: 10, conversionRate: 20, hits: 50 }];
const mockLeast = [{ title: 'B', applications: 5, conversionRate: 5, hits: 20 }];

describe('JobAnalyticsPage', () => {
  beforeEach(() => {
    vi.spyOn(httpService, 'get').mockImplementation((url) => {
      if (url.includes('top')) return Promise.resolve({ data: mockTop });
      if (url.includes('least')) return Promise.resolve({ data: mockLeast });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and fetches data', async () => {
    render(<JobAnalyticsPage />);

    // The graphs should render titles
    await waitFor(() => {
      expect(
        screen.getByText(/Top 10 Job Postings by Conversion Rate/)
      ).toBeInTheDocument();
    });
  });
});
