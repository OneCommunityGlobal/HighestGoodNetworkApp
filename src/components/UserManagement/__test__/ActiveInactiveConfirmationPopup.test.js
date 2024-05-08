import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import ActiveInactiveConfirmationPopup from '../ActiveInactiveConfirmationPopup';
import { renderWithProvider } from '__tests__/utils';
import thunk from 'redux-thunk';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureStore([thunk]);

describe('Active Inactive confirmation popup', () => {
  const onClose = jest.fn();
  const setActiveInactive = jest.fn();
  const isActive = true;

  let store;
  beforeEach(() => {
    store = mockStore({
      theme: themeMock,
    })

    renderWithProvider(<ActiveInactiveConfirmationPopup
      open
      fullName="Test Admin"
      onClose={onClose}
      setActiveInactive={setActiveInactive}
      isActive={isActive}
    />, {store});
  });
  describe('Structure', () => {
    it('should render the modal', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should render the correct user name', () => {
      expect(screen.getByText(/test admin/i)).toBeInTheDocument();
    });

    it('should render `INACTIVE` text when isActive is set to true', () => {
      expect(screen.getByText(/inactive/i)).toBeInTheDocument();
    });

    it('should render the `ACTIVE` text when isActive is set to false', () => {
      cleanup();
      let store;
      store = mockStore({
        theme: themeMock,
      })
      renderWithProvider(<ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={false}
      />, {store});
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
    it('should render one confirm button and two close buttons', () => {
      expect(screen.getAllByRole('button')).toHaveLength(3);
      expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
  });
  describe('Behavior', () => {
    it('should fire onClose() when clicking close buttons', () => {
      screen.getAllByRole('button', { name: /close/i }).forEach((close) => {
        userEvent.click(close);
      });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should fire setActiveInactive() when clicking ok button', () => {
      userEvent.click(screen.getByRole('button', { name: /ok/i }));
      expect(setActiveInactive).toHaveBeenCalledTimes(1);
      expect(setActiveInactive).toHaveBeenCalledWith(false);
    });
  });
});

describe('Active Inactive confirmation popup More unit tests', () => {
  const onClose = jest.fn();
  const setActiveInactive = jest.fn();
  const isActive = true;
  const fullname = "Test User";
  let store;
  beforeEach(() => {
    store = mockStore({
      theme: themeMock,
    })
    renderWithProvider(<ActiveInactiveConfirmationPopup
      open
      fullName={fullname}
      onClose={onClose}
      setActiveInactive={setActiveInactive}
      isActive={isActive}
    />, {store});
  });
  describe('Structure', () => {
    it('should render user name', () => {
      expect(screen.getByText(new RegExp(fullname, "i"))).toBeInTheDocument();
    });
  });
  describe('More Behaviors', () => {
    it('should not fire onClose() when no clicking close buttons', () => {
      expect(onClose).toHaveBeenCalledTimes(0);
    });
    it('should not fire setActiveInactive() when no clicking ok button', () => {
      expect(setActiveInactive).toHaveBeenCalledTimes(0);
    });
  });
});
