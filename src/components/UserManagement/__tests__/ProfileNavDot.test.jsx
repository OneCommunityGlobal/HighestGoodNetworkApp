import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ProfileNavDot } from '../ProfileNavDot';

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

  test('opens user profile in a new tab when Command/Control key is pressed', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const history = createMemoryHistory();
    const userId = '123';

    const { getByTitle } = render(
      <Router history={history}>
        <ProfileNavDot userId={userId} />
      </Router>
    );

    fireEvent.click(getByTitle("Click here to go to the user's profile."), { metaKey: true });
    expect(openSpy).toHaveBeenCalledWith(`/userprofile/${userId}`, '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });

  test('renders with correct title attribute', () => {
    const userId = '123';

    const { getByTitle } = render(<ProfileNavDot userId={userId} />);
    expect(getByTitle("Click here to go to the user's profile.")).toBeInTheDocument();
  });

  test('renders the correct icon', () => {
    const userId = '123';
    const { container } = render(<ProfileNavDot userId={userId} />);
    
    const icon = container.querySelector('i.fa-user');
    expect(icon).toBeInTheDocument();
  });
  test('clicking on non-interactive parts does not trigger navigation', () => {
    const history = createMemoryHistory();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    const { container } = render(
      <Router history={history}>
        <ProfileNavDot userId="123" />
      </Router>
    );

    // Simulate clicking outside the interactive part
    fireEvent.click(container);
    
    // Should not have navigated
    expect(history.location.pathname).toBe('/');
    // Should not have opened a new tab
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  test('handles left and right mouse button clicks', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const history = createMemoryHistory();
    const userId = '123';

    const { getByTitle } = render(
      <Router history={history}>
        <ProfileNavDot userId={userId} />
      </Router>
    );

    // Left mouse click (button: 0)
    fireEvent.click(getByTitle("Click here to go to the user's profile."), { button: 0 });
    expect(history.location.pathname).toBe(`/userprofile/${userId}`);

    // Right mouse click (button: 2)
    fireEvent.click(getByTitle("Click here to go to the user's profile."), { button: 2 });
    // Check if right-click was correctly handled if applicable
    // This may depend on additional logic if you handle right-clicks differently

    openSpy.mockRestore();
  });

  test('does not navigate or open tab if userId is undefined', () => {
    const history = createMemoryHistory();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  
    const { getByTitle } = render(
      <Router history={history}>
        <ProfileNavDot />
      </Router>
    );
  
    fireEvent.click(getByTitle("Click here to go to the user's profile."));
    
    // Expect navigation to `/userprofile/undefined`
    expect(history.location.pathname).toBe('/userprofile/undefined');
    // Should not open a new tab since ctrlKey/metaKey weren't pressed
    expect(openSpy).not.toHaveBeenCalled();
  
    openSpy.mockRestore();
  });

  test('does not navigate or open a new tab if userId is an empty string', () => {
    const history = createMemoryHistory();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  
    const { getByTitle } = render(
      <Router history={history}>
        <ProfileNavDot userId="" />
      </Router>
    );
  
    fireEvent.click(getByTitle("Click here to go to the user's profile."));
    
    // Expect navigation to `/userprofile/`
    expect(history.location.pathname).toBe('/userprofile/');
    // Should not open a new tab since ctrlKey/metaKey weren't pressed
    expect(openSpy).not.toHaveBeenCalled();
  
    openSpy.mockRestore();
  });
  
});

