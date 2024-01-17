import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveInactiveConfirmationPopup from '../ActiveInactiveConfirmationPopup';

describe('Active Inactive confirmation popup', () => {
  const onClose = jest.fn();
  const setActiveInactive = jest.fn();
  const isActive = true;
  beforeEach(() => {
    render(
      <ActiveInactiveConfirmationPopup
        open
        fullName="Test Admin"
        onClose={onClose}
        setActiveInactive={setActiveInactive}
        isActive={isActive}
      />,
    );
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
      render(
        <ActiveInactiveConfirmationPopup
          open
          fullName="Test Admin"
          onClose={onClose}
          setActiveInactive={setActiveInactive}
          isActive={false}
        />,
      );
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
