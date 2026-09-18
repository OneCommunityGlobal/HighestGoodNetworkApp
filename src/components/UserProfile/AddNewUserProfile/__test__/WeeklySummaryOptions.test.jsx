import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import WeeklySummaryOptions from '../WeeklySummaryOptions';

// Mock Redux store for darkMode
const mockStore = (initialState) => {
  return createStore((state = initialState, action) => state);
};

describe('WeeklySummaryOptions Component', () => {
  // Test to render the summary options
  test('renders summary options', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    // Check if the select dropdown is rendered
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Ensure all options are present in the dropdown
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(9);
  });

  // Test if handleUserProfile is called on change
  test('handleUserProfile called on change', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    const handleUserProfile = vi.fn();

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={handleUserProfile} />
      </Provider>
    );

    // Simulate a change in the select dropdown
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Team Marigold' } });

    // Ensure the handleUserProfile function is called
    expect(handleUserProfile).toHaveBeenCalled();
  });

  // Test if the default value is set to "Required"
  test('default value set to "Required"', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    // Check if the default value is "Required"
    expect(screen.getByRole('combobox').value).toBe('Required');
  });

  // Test if the correct value attributes are set
  test('correct value attributes', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    // Test if the options have the correct value attributes
    const options = screen.getAllByRole('option');
    expect(options[0].value).toBe('Required');
    expect(options[1].value).toBe('Not Required');
    expect(options[2].value).toBe('Team Fabulous');
    // Add further checks for all options...
  });

  // Test if the value changes when a different option is selected
  test('value changes when a different option is selected', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    const handleUserProfile = vi.fn();

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={handleUserProfile} />
      </Provider>
    );

    // Select a different option
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Team Marigold' } });

    // Assert the updated value of the select input
    expect(screen.getByRole('combobox').value).toBe('Team Marigold');
  });

  // Test if the component renders without default value
  test('render without default value', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    // Test if the select element has a value attribute set to "Required" (default) or not
    expect(screen.getByRole('combobox').value).toBe('Required');
  });

  
  

  // Test if dark mode styling is applied
  test('applies dark mode styling', () => {
    const store = mockStore({
      theme: { darkMode: true },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    const selectElement = screen.getByRole('combobox');

    // Test if dark mode classes are applied
    expect(selectElement).toHaveClass('bg-darkmode-liblack');
    expect(selectElement).toHaveClass('text-light');
    expect(selectElement).toHaveClass('border-0');
  });

  // Test if dark mode styling is not applied when darkMode is false
  test('does not apply dark mode styling when darkMode is false', () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    render(
      <Provider store={store}>
        <WeeklySummaryOptions handleUserProfile={() => {}} />
      </Provider>
    );

    const selectElement = screen.getByRole('combobox');

    // Test if no dark mode classes are applied
    expect(selectElement).not.toHaveClass('bg-darkmode-liblack');
    expect(selectElement).not.toHaveClass('text-light');
    expect(selectElement).not.toHaveClass('border-0');
  });
});
