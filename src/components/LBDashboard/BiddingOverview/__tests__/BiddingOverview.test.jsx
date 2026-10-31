/* Version 1.0.0 */
/* eslint-disable testing-library/no-node-access -- The theme class is on the rendered page wrapper. */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import { themeReducer } from '../../../../reducers/themeReducer';
import BiddingOverview from '../BiddingOverview';
import styles from '../BiddingOverview.module.css';

it('follows the app theme without clearing entered bidding details', async () => {
  const store = createStore(combineReducers({ theme: themeReducer }));
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <BiddingOverview />
      </MemoryRouter>
    </Provider>,
  );
  expect(container.firstChild).not.toHaveClass(styles.darkMode);
  await userEvent.type(screen.getByLabelText('Name'), 'Test Bidder');
  act(() => store.dispatch({ type: 'TOGGLE_THEME' }));
  expect(container.firstChild).toHaveClass(styles.darkMode);
  expect(screen.getByLabelText('Name')).toHaveValue('Test Bidder');
  act(() => store.dispatch({ type: 'TOGGLE_THEME' }));
  expect(container.firstChild).not.toHaveClass(styles.darkMode);
});
