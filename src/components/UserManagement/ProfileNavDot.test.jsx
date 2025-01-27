import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ProfileNavDot } from './ProfileNavDot';

describe('ProfileNavDot Component Tests', () => {
  test('renders ProfileNavDot without errors', () => {
    render(<ProfileNavDot userId="123" />);
  });

  test('navigates to user profile on click', () => {
    const history = createMemoryHistory();
    const userId = '123';

    const { getByTitle } = render(
      <Router history={history}>
        <ProfileNavDot userId={userId} />
      </Router>
    );

    fireEvent.click(getByTitle("Click here to go to the user's profile."));
    expect(history.location.pathname).toBe(`/userprofile/${userId}`);
  });
  test('renders with correct title attribute', () => {
    const userId = '123';

    const { getByTitle } = render(<ProfileNavDot userId={userId} />);
    expect(getByTitle("Click here to go to the user's profile.")).toBeInTheDocument();
  });
});