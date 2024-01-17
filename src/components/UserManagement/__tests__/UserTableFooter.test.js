import React from 'react';
import { screen, render, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../../../__tests__/mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../../../__tests__/utils';
import UserTableFooter from '../UserTableFooter';
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
describe('user table footer', () => {
  let onSelectPageSize;
  let onPageSelect;
  beforeEach(() => {
    onSelectPageSize = jest.fn();
    onPageSelect = jest.fn();
    const pageSize = 10;
    const selectedPage = 1;
    const datacount = 60;
    const isSelected = true;
    const pageNo = 1;
    render(
      <UserTableFooter
        onSelectPageSize={onSelectPageSize}
        onPageSelect={onPageSelect}
        pageSize={pageSize}
        selectedPage={selectedPage}
        datacount={datacount}
        isSelected={isSelected}
        pageNo={pageNo}
      />,
    );
  });
  describe('structure', () => {
    it('should render a dropdown', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    it('should render 5 page links', () => {
      expect(screen.getAllByRole('button', { name: /\d/i })).toHaveLength(5);
    });
    it('should render one `previous` button and one `next` button', () => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should fire onSelectPageSize() once the user select the combobox', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), '25');
      expect(onSelectPageSize).toHaveBeenCalled();
      expect(onSelectPageSize).toHaveBeenCalledWith(25);
    });
    it('should fire onPageSelect() with next page once the user clicks `next`', () => {
      userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(2);
    });
    it('should fire onPageSelect() with the clicked page button', async () => {
      userEvent.click(screen.getByRole('button', { name: /3/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(3);
    });
    it('should not fire onPageSelect() when the user clicks the previous on the first page', () => {
      userEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageSelect).not.toHaveBeenCalled();
    });
    it('should not fire onPageSelect() when the user click next on the last page', () => {
      cleanup();
      render(
        <UserTableFooter
          onSelectPageSize={onSelectPageSize}
          onPageSelect={onPageSelect}
          pageSize={10}
          selectedPage={11}
          datacount={100}
          isSelected={true}
          pageNo={10}
        />,
      );
      userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageSelect).not.toHaveBeenCalled();
    });

    it('should fire onPageSelect() with previous page once the user clicks `previous`', () => {
      cleanup();
      render(
        <UserTableFooter
          onSelectPageSize={onSelectPageSize}
          onPageSelect={onPageSelect}
          pageSize={10}
          selectedPage={2}
          datacount={100}
          isSelected={true}
          pageNo={2}
        />,
      );
      userEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(1);
    });
  });
});
