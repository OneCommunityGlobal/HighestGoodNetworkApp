import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import QuickSetupModal from '../QuickSetupModal';
import { getAllTitle, addTitle } from '../../../../actions/title';
import {
  mockTeamsData,
  mockUserProfile,
  mockTitles,
  mockUserPermissions,
} from '../__mock__/mockData';
import hasPermission from '~/utils/permissions';
import { vi } from 'vitest';
vi.mock('react-redux', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    connect: () => Component => Component,
  };
});
vi.mock('../../../../actions/title', () => ({
  getAllTitle: vi.fn(),
  addTitle: vi.fn(),
  editTitle: vi.fn(),
}));
vi.mock('../../../../utils/permissions', () => ({
  __esModule: true,
  default: vi.fn(permission => mockUserPermissions[permission]),
}));
const mockStore = configureMockStore([]);
describe('QuickSetupModal Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });
    getAllTitle.mockResolvedValue({ data: mockTitles });
    addTitle.mockResolvedValue({ status: 200, data: {} });
  });
  test('renders "Add New QST" button when user has addTitle permission', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal userProfile={mockUserProfile} hasPermission={() => true} />
        </Provider>,
      );
    });
    const addButton = screen.getByText('Add New QST');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();
  });
  test('opens AddNewTitleModal when "Add New QST" button is clicked', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal
            userProfile={mockUserProfile}
            hasPermission={() => true}
            teamsData={mockTeamsData}
          />
        </Provider>,
      );
    });
    fireEvent.click(screen.getByText('Add New QST'));
    await waitFor(() => {
      expect(screen.getByText('Add A New Title')).toBeInTheDocument();
    });
  });
  test('renders Edit and Save buttons conditionally', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal userProfile={mockUserProfile} hasPermission={() => true} />
        </Provider>,
      );
    });
    const editButton = screen.getByText('Edit');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
  });

  test('accepts a team code selected from the dropdown even when the source data has trailing whitespace', async () => {
    // Simulate real-world data where a team code stored in Redux state has
    // accidental leading/trailing whitespace (e.g. from spreadsheet import).
    store = mockStore({
      theme: { darkMode: false },
      teamCodes: {
        teamCodes: ['17GADCC '],
      },
    });

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <Provider store={store}>
          <QuickSetupModal
            userProfile={mockUserProfile}
            hasPermission={() => true}
            teamsData={mockTeamsData}
          />
        </Provider>,
      );
    });

    fireEvent.click(screen.getByText('Add New QST'));
    await waitFor(() => {
      expect(screen.getByText('Add A New Title')).toBeInTheDocument();
    });

    // Fill required fields so the Confirm button becomes enabled.
        const inputs = screen.getAllByRole('textbox');
    const titleNameInput = inputs.find(input => input.id === 'titleName');
    const mediaFolderInput = inputs.find(input => input.id === 'mediafolder');

    fireEvent.change(titleNameInput, {
      target: { value: 'Test Title' },
    });
    fireEvent.change(mediaFolderInput, {
      target: { value: 'https://example.com/folder' },
    });

    // Type into the Team Code autocomplete field to trigger suggestions.
    const teamCodeInputs = screen.getAllByRole('textbox');
    const teamCodeInput = teamCodeInputs.find(
      input => input.id !== 'titleName' && input.id !== 'titleCode' && input.id !== 'mediafolder',
    );
    fireEvent.change(teamCodeInput, { target: { value: '17' } });
    fireEvent.focus(teamCodeInput);

    // Select the suggested code from the dropdown — it should be trimmed,
    // not padded with the trailing whitespace present in the source data.
    await waitFor(() => {
      expect(screen.getByText('17GADCC')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('17GADCC'));

    fireEvent.click(screen.getByText('Confirm'));

    // The bug: this used to show "Invalid team code" even though the exact
    // code was just selected from the suggestion list. After the fix, no
    // such warning should appear, and the save action should be called
    // with the trimmed value.
    await waitFor(() => {
      expect(screen.queryByText(/invalid team code/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/team code not exists/i)).not.toBeInTheDocument();
    });

    expect(addTitle).toHaveBeenCalledWith(
      expect.objectContaining({ teamCode: '17GADCC' }),
    );
  });
});