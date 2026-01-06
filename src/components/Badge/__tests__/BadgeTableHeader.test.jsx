import React from 'react';
import BadgeTableHeader from '~/components/Badge/BadgeTableHeader';
import { configureStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import { renderWithProvider } from '__tests__/utils';
import { screen } from '@testing-library/react';

describe('BadgeTableHeader', () => {
  const mockStore = configureStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  it('should render correctly', () => {
    renderWithProvider(
      <Provider store={store}>
        <BadgeTableHeader />
      </Provider>,
    );
  });

  it('displays column name correctly', () => {
    renderWithProvider(<BadgeTableHeader />);
    expect(screen.getByText('Badge')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Reports Page Notification')).toBeInTheDocument();
  });

  it('should render tooltip properly', () => {
    renderWithProvider(<BadgeTableHeader />);
    const infoIcon = screen.getByTestId('sort-ranking-info-icon');
    expect(infoIcon).toBeInTheDocument();
  });
});
