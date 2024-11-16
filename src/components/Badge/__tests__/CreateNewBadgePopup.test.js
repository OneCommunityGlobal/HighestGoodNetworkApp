import React from 'react';
import CreateNewBadgePopup from '../CreateNewBadgePopup';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureStore([]);

describe('CreateNewBadgePopup Component', () => {
  test('renders the entire component properly', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    // Test for rendering all the core components
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('shows months field in No Infringement Streak Badge Popup', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    const typeField = screen.getByLabelText('Type');
    typeField.value = 'No Infringement Streak';
    typeField.dispatchEvent(new Event('change', { bubbles: true }));

    // Test for dynamic months field
    expect(screen.getByLabelText('Months')).toBeInTheDocument();
  });

  test('shows multiple field in Minimum Hours Multiple Badge Popup', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    const typeField = screen.getByLabelText('Type');
    typeField.value = 'Minimum Hours Multiple';
    typeField.dispatchEvent(new Event('change', { bubbles: true }));

    // Test for dynamic multiple field
    expect(screen.getByLabelText('Multiple')).toBeInTheDocument();
  });

  test('shows hours and weeks field in X Hours for X Week Streak Badge Popup', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    const typeField = screen.getByLabelText('Type');
    typeField.value = 'X Hours for X Week Streak';
    typeField.dispatchEvent(new Event('change', { bubbles: true }));

    // Test for dynamic hours and weeks fields
    expect(screen.getByLabelText('Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Weeks')).toBeInTheDocument();
  });

  test('shows people field in Lead a team of X+ Badge Popup', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    const typeField = screen.getByLabelText('Type');
    typeField.value = 'Lead a team of X+';
    typeField.dispatchEvent(new Event('change', { bubbles: true }));

    // Test for dynamic people field
    expect(screen.getByLabelText('People')).toBeInTheDocument();
  });

  test('shows correct category dropdown options and hours field in Total Hrs in Category Badge Popup', () => {
    const store = mockStore({
      theme: themeMock,
    });
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>,
    );

    const typeField = screen.getByLabelText('Type');
    typeField.value = 'Total Hrs in Category';
    typeField.dispatchEvent(new Event('change', { bubbles: true }));

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    const select = screen.getByLabelText('Category');
    const options = Array.from(select.options).map(option => option.text);
    const expectedCategories = [
      '',
      'Food',
      'Energy',
      'Housing',
      'Education',
      'Society',
      'Economics',
      'Stewardship',
      'Unassigned',
    ];

    // Test for options dropdown and dynamic hours field
    expect(options).toEqual(expectedCategories);
    expect(screen.getByLabelText('Hours')).toBeInTheDocument();
  });
});