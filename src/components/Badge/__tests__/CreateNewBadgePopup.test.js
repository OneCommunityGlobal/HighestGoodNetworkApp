import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import CreateNewBadgePopup from '../CreateNewBadgePopup';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('CreateNewBadgePopup component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      allProjects: { projects: [] },
      badge: { message: '', alertVisible: false, color: '' },
      theme: { darkMode: false },
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('updates state when badge name input changes', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const badgeNameInput = screen.getByLabelText('Name');
    fireEvent.change(badgeNameInput, { target: { value: 'Test Badge' } });
    expect(badgeNameInput.value).toBe('Test Badge');
  });

  it('updates state when image URL input changes', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const imageUrlInput = screen.getByLabelText('Image URL');
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });
    expect(imageUrlInput.value).toBe('https://example.com/image.jpg');
  });

  it('updates state when description input changes', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'Test badge description' } });
    expect(descriptionInput.value).toBe('Test badge description');
  });

  it('updates state when ranking input changes', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const rankingInput = screen.getByLabelText('Ranking');
    fireEvent.change(rankingInput, { target: { value: '5' } });
    expect(rankingInput.value).toBe('5');
  });

  it('updates state when badge type select changes', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const badgeTypeSelect = screen.getByLabelText('Type');
    fireEvent.change(badgeTypeSelect, { target: { value: 'No Infringement Streak' } });
    expect(badgeTypeSelect.value).toBe('No Infringement Streak');
  });
});