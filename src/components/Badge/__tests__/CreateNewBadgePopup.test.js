import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import CreateNewBadgePopup from '../CreateNewBadgePopup';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('CreateNewBadgePopup component', () => {
  let store;
  let createNewBadgeMock;
  let toggleMock;

  beforeEach(() => {
    createNewBadgeMock = jest.fn().mockResolvedValue();
    toggleMock = jest.fn();

    store = mockStore({
      allProjects: { projects: [] },
      badge: { message: '', alertVisible: false, color: '' },
      theme: { darkMode: false },
    });
  });

  it('renders all key elements correctly', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('displays conditional fields based on selected badge type', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const badgeTypeSelect = screen.getByLabelText('Type');

    fireEvent.change(badgeTypeSelect, { target: { value: 'No Infringement Streak' } });
    expect(screen.getByLabelText('Months')).toBeInTheDocument();

    fireEvent.change(badgeTypeSelect, { target: { value: 'Minimum Hours Multiple' } });
    expect(screen.getByLabelText('Multiple')).toBeInTheDocument();

    fireEvent.change(badgeTypeSelect, { target: { value: 'X Hours for X Week Streak' } });
    expect(screen.getByLabelText('Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Weeks')).toBeInTheDocument();

    fireEvent.change(badgeTypeSelect, { target: { value: 'Lead a team of X+' } });
    expect(screen.getByLabelText('People')).toBeInTheDocument();

    fireEvent.change(badgeTypeSelect, { target: { value: 'Total Hrs in Category' } });
    expect(screen.getByLabelText('Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('enables/disables the "Create" button based on input validity', () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup />
      </Provider>
    );
    const createButton = screen.getByText('Create');

    expect(createButton).toBeDisabled();

    const badgeNameInput = screen.getByLabelText('Name');
    const imageUrlInput = screen.getByLabelText('Image URL');
    const descriptionInput = screen.getByLabelText('Description');
    const rankingInput = screen.getByLabelText('Ranking');

    fireEvent.change(badgeNameInput, { target: { value: 'Test Badge' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test badge description' } });
    fireEvent.change(rankingInput, { target: { value: '5' } });

    expect(createButton).toBeEnabled();
  });

  it('calls createNewBadge with the correct data on form submission', async () => {
    render(
      <Provider store={store}>
        <CreateNewBadgePopup createNewBadge={createNewBadgeMock} toggle={toggleMock} />
      </Provider>
    );
    const badgeNameInput = screen.getByLabelText('Name');
    const imageUrlInput = screen.getByLabelText('Image URL');
    const descriptionInput = screen.getByLabelText('Description');
    const rankingInput = screen.getByLabelText('Ranking');
  
    fireEvent.change(badgeNameInput, { target: { value: 'Test Badge' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test badge description' } });
    fireEvent.change(rankingInput, { target: { value: '5' } });
  
    fireEvent.click(screen.getByText('Create'));
  
    await waitFor(() => {
      expect(createNewBadgeMock).toHaveBeenCalledWith({
        badgeName: 'Test Badge',
        imageUrl: 'https://example.com/image.jpg',
        description: 'Test badge description',
        ranking: 5,
        type: 'Custom',
        category: 'Unspecified',
        totalHrs: 0,
        weeks: 0,
        months: 0,
        multiple: 0,
        people: 0,
      });
    });
  
    expect(toggleMock).toHaveBeenCalled();
  });
});