import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import HelpModal from '../HelpModal';
import styles from '../HelpModal.module.css';

vi.mock('axios');

test('supports an HGN software team volunteer in dark mode', async () => {
  const userId = 'test-user';
  axios.get.mockImplementation(url => {
    if (url === ENDPOINTS.HELP_CATEGORIES) {
      return Promise.resolve({ data: [{ name: 'Software Support' }] });
    }
    return Promise.resolve({
      data: { teams: [{ teamName: 'HGN Software Development Team' }] },
    });
  });

  const store = configureStore({
    reducer: {
      auth: () => ({ user: { userid: userId, role: 'Volunteer' } }),
      theme: () => ({ darkMode: true }),
    },
  });

  render(
    <Provider store={store}>
      <HelpModal show onHide={vi.fn()} />
    </Provider>,
  );

  const suggestionsLink = await screen.findByRole('button', { name: 'here' });
  expect(suggestionsLink).toHaveClass(styles.suggestionsLink, styles.suggestionsLinkDark);

  await userEvent.click(screen.getByRole('button', { name: 'Select an option' }));
  await userEvent.click(screen.getByRole('option', { name: 'Software Support' }));

  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(userId));
});
