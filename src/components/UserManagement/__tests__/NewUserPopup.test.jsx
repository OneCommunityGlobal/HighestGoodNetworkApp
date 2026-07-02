// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../__tests__/utils';
import NewUserPopup from '../NewUserPopup';
import { themeMock } from '../../../__tests__/mockStates';

// Mock the AddNewUserProfile component as default export
vi.mock('../../UserProfile/AddNewUserProfile', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h4>User Profile</h4>
    </div>
  ),
}));

// Mock axios simply so imports resolve
vi.mock('axios');

const mockStore = configureStore([thunk]);

describe('new user popup', () => {
  const onUserPopupClose = vi.fn();
  let store;

  beforeEach(() => {
    onUserPopupClose.mockClear();
    store = mockStore({
      userProfile: { role: 'userRole' },
      theme: themeMock,
      infoCollections: {
        loading: false,
        error: null,
        infos: [{ infoName: 'example', infoContent: 'example content', visibility: '1' }],
      },
    });
  });

  describe('Structure', () => {
    it('should render the modal', () => {
      renderWithProvider(<NewUserPopup open={true} onUserPopupClose={onUserPopupClose} />, { store });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should render User Profile', () => {
      renderWithProvider(<NewUserPopup open={true} onUserPopupClose={onUserPopupClose} />, { store });
      expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    });
    it('should render two close buttons', () => {
      renderWithProvider(<NewUserPopup open={true} onUserPopupClose={onUserPopupClose} />, { store });
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
    it('should render create new user heading', () => {
      renderWithProvider(<NewUserPopup open={true} onUserPopupClose={onUserPopupClose} />, { store });
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });
  });

  describe('behavior', () => {
    it('should call onUserPopupClose when close buttons clicked', () => {
      renderWithProvider(<NewUserPopup open={true} onUserPopupClose={onUserPopupClose} />, { store });
      screen.getAllByRole('button', { name: /close/i }).forEach(btn => userEvent.click(btn));
      expect(onUserPopupClose).toHaveBeenCalledTimes(2);
    });
  });
});

describe('new user popup closed', () => {
  const onUserPopupClose = vi.fn();
  let store;

  beforeEach(() => {
    onUserPopupClose.mockClear();
    store = mockStore({
      userProfile: { role: 'userRole' },
      theme: themeMock,
      infoCollections: {
        loading: false,
        error: null,
        infos: [{ infoName: 'example', infoContent: 'example content', visibility: '1' }],
      },
    });
  });

  it('should not render the popup when open=false', () => {
    const { queryByRole } = renderWithProvider(
      <NewUserPopup open={false} onUserPopupClose={onUserPopupClose} />,
      { store },
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
