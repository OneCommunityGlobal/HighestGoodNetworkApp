import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import PRReviewTeamAnalytics from '../PRReviewTeamAnalytics';

vi.mock('axios');

test('requests and renders new PR data when the duration changes', async () => {
  const responses = {
    [ENDPOINTS.POPULAR_PRS('lastWeek')]: [
      { prNumber: 'FE-101', prTitle: 'Weekly PR', reviewCount: 1 },
    ],
    [ENDPOINTS.POPULAR_PRS('lastMonth')]: [
      { prNumber: 'FE-202', prTitle: 'Monthly PR', reviewCount: 3 },
    ],
  };
  axios.get.mockImplementation(url => Promise.resolve({ data: responses[url] ?? [] }));
  window.localStorage.setItem('token', 'test-token');
  const store = configureStore({ reducer: { theme: () => ({ darkMode: false }) } });

  render(
    <Provider store={store}>
      <PRReviewTeamAnalytics />
    </Provider>,
  );

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.POPULAR_PRS('lastWeek'), {
      headers: { Authorization: 'test-token' },
    }),
  );
  expect(await screen.findByText('1 reviews')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Select duration filter'), {
    target: { value: 'lastMonth' },
  });

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.POPULAR_PRS('lastMonth'), {
      headers: { Authorization: 'test-token' },
    }),
  );
  expect(await screen.findByText('3 reviews')).toBeInTheDocument();
  expect(screen.queryByText('1 reviews')).not.toBeInTheDocument();
});
