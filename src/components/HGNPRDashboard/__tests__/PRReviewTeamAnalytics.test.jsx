import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import PRReviewTeamAnalytics from '../PRReviewTeamAnalytics';

vi.mock('axios');

test('requests new PR data when the duration changes', async () => {
  axios.get.mockResolvedValue({ data: [] });
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

  fireEvent.change(screen.getByLabelText('Select duration filter'), {
    target: { value: 'lastMonth' },
  });

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.POPULAR_PRS('lastMonth'), {
      headers: { Authorization: 'test-token' },
    }),
  );
});
