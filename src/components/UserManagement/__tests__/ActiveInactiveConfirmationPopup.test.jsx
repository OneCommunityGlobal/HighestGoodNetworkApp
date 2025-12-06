// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ActiveInactiveConfirmationPopup from '../ActiveInactiveConfirmationPopup';
import { renderWithProvider } from '../../../__tests__/utils';
import { themeMock } from '../../../__tests__/mockStates';
import { vi } from 'vitest';

const mockStore = configureMockStore([thunk]);

describe('Active Inactive confirmation popup', () => {
  const onClose = vi.fn();
  const setActiveInactive = vi.fn();
  const isActive = true;

  let store;
  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore({
      theme: themeMock,
    });
  });
  describe('Structure', () => {
    it('should render the modal', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should render the correct user name', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(screen.getByText(/test admin/i)).toBeInTheDocument();
    });

    it('should render `INACTIVE` text when isActive is set to true', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(screen.getByText(/inactive/i)).toBeInTheDocument();
    });

    it('should render the `ACTIVE` text when isActive is set to false', () => {
      // cleanup();
      // let store;
      store = mockStore({
        theme: themeMock,
      });
      renderWithProvider(
        <ActiveInactiveConfirmationPopup
          open
          fullName="Test Admin"
          onClose={onClose}
          setActiveInactive={setActiveInactive}
          isActive={false}
        />,
        { store },
      );
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
    it('should render one confirm button and two close buttons', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(screen.getAllByRole('button')).toHaveLength(3);
      expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
  });
  describe('Behavior', () => {
    it('should fire onClose() when clicking close buttons', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      screen.getAllByRole('button', { name: /close/i }).forEach(async close => {
        await userEvent.click(close);
      });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should fire setActiveInactive() when clicking ok button', async () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      await userEvent.click(screen.getByRole('button', { name: /ok/i }));
      expect(setActiveInactive).toHaveBeenCalledTimes(1);
      expect(setActiveInactive).toHaveBeenCalledWith(false);
    });
  });
});

describe('Active Inactive confirmation popup More unit tests', () => {
  const onClose = vi.fn();
  const setActiveInactive = vi.fn();
  const isActive = true;
  const fullname = 'Test User';
  let store;
  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore({
      theme: themeMock,
    });
  });
  describe('Structure', () => {
    it('should render user name', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName={fullname}
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(screen.getByText(new RegExp(fullname, 'i'))).toBeInTheDocument();
    });
  });
  describe('More Behaviors', () => {
    it('should not fire onClose() when no clicking close buttons', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName={fullname}
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(onClose).toHaveBeenCalledTimes(0);
    });
    it('should not fire setActiveInactive() when no clicking ok button', () => {
      renderWithProvider(
      <ActiveInactiveConfirmationPopup
        open
        fullName={fullname}
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
      { store },
    );
      expect(setActiveInactive).toHaveBeenCalledTimes(0);
    });
  });
});
