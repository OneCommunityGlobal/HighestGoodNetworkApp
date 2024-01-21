import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteUserPopup from '../DeleteUserPopup';
import { UserDeleteType } from '../../../utils/enums';

describe('delete user popup', () => {
  const onClose = jest.fn();
  const onDelete = jest.fn();
  beforeEach(() => {
    render(<DeleteUserPopup open onClose={onClose} onDelete={onDelete} />);
  });
  describe('Structure', () => {
    it('should render the modal', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should rendertwo close buttons', () => {
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
    it('should render one delete button', () => {
      expect(screen.getByRole('button', { name: /.*delete.*/i })).toBeInTheDocument();
    });
    it('should render one inactive button', () => {
      expect(screen.getByRole('button', { name: /.*inactive.*/i })).toBeInTheDocument();
    });
    it('should render one archive button', () => {
      expect(screen.getByRole('button', { name: /.*archiving.*/i })).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should fire onClose() once the user clicks close buttons', () => {
      screen.getAllByRole('button', { name: /close/i }).forEach((button) => {
        userEvent.click(button);
      });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should fire onDelete(HardDelete) once the user clicks the `delete` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*delete.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.HardDelete);
    });
    it('should fire onDelete(SoftDelete) once the user clicks the `archive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*archiving.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.SoftDelete);
    });
    it('should fire onDelete(Inactive) once the user clicks the `inactive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*inactive.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.Inactive);
    });
  });
});
