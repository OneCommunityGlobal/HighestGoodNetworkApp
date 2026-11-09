import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import NotFoundPage from '../NotFoundPage';

const mockStore = configureStore([]);

const renderPage = ({ isAuthenticated, darkMode = false, path = '/doesnotexist' }) =>
  render(
    <Provider store={mockStore({ theme: { darkMode }, auth: { isAuthenticated } })}>
      <MemoryRouter initialEntries={[path]}>
        <NotFoundPage />
      </MemoryRouter>
    </Provider>,
  );

describe('NotFoundPage', () => {
  beforeEach(() => localStorage.clear());

  it('shows only a login link when logged out', () => {
    renderPage({ isAuthenticated: false });
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /login page/i })).toHaveAttribute('href', '/login');
  });

  it('shows dashboard and report links when logged in', () => {
    renderPage({ isAuthenticated: true });
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/dashboard');
  });

  it('flags the suggestions modal when the report link is clicked', () => {
    renderPage({ isAuthenticated: true });
    fireEvent.click(screen.getByRole('link', { name: 'here' }));
    expect(localStorage.getItem('openSuggestionsModal')).toBe('true');
  });

  it('shows the PR analytics message on pr-dashboard paths', () => {
    renderPage({ isAuthenticated: true, path: '/pr-dashboard/x' });
    expect(screen.getByText('PR ANALYTICS UNAVAILABLE')).toBeInTheDocument();
  });
});
