import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import QuickSetupModal from '../QuickSetupModal';
import { getAllTitle } from '../../../../actions/title';
import { mockTeamsData, mockUserProfile, mockTitles, mockUserPermissions } from '../__mock__/mockData';

jest.mock('../../../../actions/title', () => ({
  getAllTitle: jest.fn()
}));

jest.mock('../../../../utils/permissions', () => ({
  hasPermission: jest.fn(permission => mockUserPermissions[permission])
}));

const mockStore = configureStore([]);

describe('QuickSetupModal Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });
    getAllTitle.mockResolvedValue({ data: mockTitles });
  });

  test('renders "Add New QST" button when user has addTitle permission', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal userProfile={mockUserProfile} hasPermission={() => true} />
        </Provider>
      );
    });

    const addButton = screen.getByText('Add New QST');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();
  });

  test('opens AddNewTitleModal when "Add New QST" button is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal 
            userProfile={mockUserProfile} 
            hasPermission={() => true} 
            teamsData={mockTeamsData} 
          />
        </Provider>
      );
    });

    fireEvent.click(screen.getByText('Add New QST'));

    await waitFor(() => {
      expect(screen.getByText('Add A New Title')).toBeInTheDocument();
    });
  });

  test('renders Edit and Save buttons conditionally', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal userProfile={mockUserProfile} hasPermission={() => true} />
        </Provider>
      );
    });

    const editButton = screen.getByText('Edit');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
  });
});