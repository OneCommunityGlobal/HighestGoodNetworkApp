import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import StudentDashboard from './StudentDashboard';
import styles from './StudentDashboard.module.css';

const mockStore = configureMockStore([]);

const renderDashboard = (darkMode = false) =>
  render(
    <Provider store={mockStore({ theme: { darkMode }, auth: { user: { firstName: 'Taylor' } } })}>
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    </Provider>,
  );

describe('StudentDashboard', () => {
  it('renders the dashboard shell, greeting, and learning sections', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome, Taylor')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Student dashboard navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Knowledge Evolution' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subject Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
  });

  it('filters progress by subject and restores all subjects', () => {
    renderDashboard();

    const filters = within(screen.getByRole('group', { name: 'Filter progress by subject' }));
    fireEvent.click(filters.getByRole('button', { name: 'English', exact: true }));
    expect(screen.getByText('12/15')).toBeInTheDocument();
    expect(screen.queryByText('5/10')).not.toBeInTheDocument();

    fireEvent.click(filters.getByRole('button', { name: 'All subjects' }));
    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('12/15')).toBeInTheDocument();
  });

  it('supports collapsed navigation and applies dark mode to the whole page', () => {
    renderDashboard(true);
    expect(screen.getByTestId('student-dashboard')).toHaveClass(styles.dark);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse navigation' }));
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Homepage' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows feedback for notifications and Settings availability', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByRole('status')).toHaveTextContent('You are all caught up.');
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('status')).toHaveTextContent('Settings are not available yet.');
  });
});
