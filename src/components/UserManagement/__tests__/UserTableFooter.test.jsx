// import React from 'react';
import { screen, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserTableFooter from '../UserTableFooter';


// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

const renderFooter = (props = {}) => {
  const defaults = {
    onSelectPageSize: vi.fn(),
    onPageSelect: vi.fn(),
    pageSize: 10,
    selectedPage: 1,
    datacount: 60,
    isSelected: true,
    pageNo: 1,
  };
  const all = { ...defaults, ...props };
  render(<UserTableFooter {...all} />);
  const user = userEvent;
  return { ...all, user };
};
describe('user table footer', () => {
  let onSelectPageSize;
  let onPageSelect;
  describe('structure', () => {
    const pageSize = 10;
    const selectedPage = 1;
    const datacount = 60;
    it('should render a page summary info', () => {
      renderFooter({ pageSize, selectedPage, datacount });
      const rightNum = pageSize * selectedPage;
      const leftNum = 1 + (selectedPage - 1) * pageSize;
      const pageSumm = `Showing ${leftNum} - ${rightNum} of ${datacount}`;
      expect(screen.getByText(pageSumm)).toBeInTheDocument();
    });
    it('should render a dropdown', () => {
      renderFooter();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    it('should render 5 page links', () => {
      renderFooter();
      expect(screen.getAllByRole('button', { name: /\d/i })).toHaveLength(5);
    });
    it('should render one `previous` button and one `next` button', () => {
      renderFooter();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should fire onSelectPageSize() once the user select the combobox', async() => {
      const { user, onSelectPageSize } = renderFooter();
      await user.selectOptions(screen.getByRole('combobox'), '50');
      expect(onSelectPageSize).toHaveBeenCalled();
      expect(onSelectPageSize).toHaveBeenCalledWith(50);
    });
    it('should fire onPageSelect() with next page once the user clicks `next`', async() => {
      const { user, onPageSelect } = renderFooter({ selectedPage: 1 });
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(2);
    });
    it('should fire onPageSelect() with the clicked page button', async() => {
      const { user, onPageSelect } = renderFooter();
      await userEvent.click(screen.getByRole('button', { name: /3/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(3);
    });
    it('should not fire onPageSelect() when the user clicks the previous on the first page', async() => {
      const { user, onPageSelect } = renderFooter({ selectedPage: 1 });
      await userEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageSelect).not.toHaveBeenCalled();
    });
    it('should not fire onPageSelect() when the user click next on the last page', async() => {
      const { user, onPageSelect } = renderFooter({
        pageSize: 10,
        selectedPage: 11,
        datacount: 100,
        pageNo: 11,
      });
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageSelect).not.toHaveBeenCalled();
    });

    it('should fire onPageSelect() with previous page once the user clicks `previous`', async() => {
      const { user, onPageSelect } = renderFooter({
        pageSize: 10,
        selectedPage: 2,
        datacount: 100,
        pageNo: 2,
      });
      await userEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageSelect).toHaveBeenCalled();
      expect(onPageSelect).toHaveBeenCalledWith(1);
    });
  });
});

describe('user table footer tests', () => {
  let onSelectPageSize;
  let onPageSelect;
  describe('more tests for the summary', () => {
    const pageSize = 10;
    const selectedPage = 4;
    const datacount = 60;
    it('should render a page summary info', () => {
      renderFooter({ pageSize, selectedPage, datacount });
      const rightNum = pageSize * selectedPage;
      const leftNum = 1 + (selectedPage - 1) * pageSize;
      const pageSumm = `Showing ${leftNum} - ${rightNum} of ${datacount}`;
      expect(screen.getByText(pageSumm)).toBeInTheDocument();
    });
    it('should display correct summary info', async () => {
      const { user, onPageSelect } = renderFooter({
        pageSize,
        selectedPage,
        datacount,
        pageNo: 1,
      });
      await userEvent.click(screen.getByRole('button', { name: /4/i }));
      expect(onPageSelect).toHaveBeenCalledWith(4);
      const rightNum = pageSize * selectedPage;
      const leftNum = 1 + (selectedPage - 1) * pageSize;
      const pageSumm = `Showing ${leftNum} - ${rightNum} of ${datacount}`;
      expect(screen.getByText(pageSumm)).toBeInTheDocument();
    });
  });
});
