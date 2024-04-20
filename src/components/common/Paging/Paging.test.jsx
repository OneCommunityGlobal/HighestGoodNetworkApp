import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Paging } from './Paging';


// Dummy child component for tests
const DummyChild = () => <div>Dummy Child</div>;

describe('Paging Component', () => {
  // Test for initial render and default state
  test('renders with default state correctly', () => {
    const { getByText } = render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>
    );
    expect(getByText('1')).toBeInTheDocument(); // Checks if first page button is rendered
    expect(getByText('5')).toBeInTheDocument(); // Checks if fifth page button is rendered
  });

  // Test for clicking on a page number
  test('changes page on page number click', () => {
    const { getByText } = render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>
    );
    fireEvent.click(getByText('2')); // Click on page number 2
    expect(getByText('2')).toHaveClass('active-button'); // Checks if page 2 is now active
  });

  test('navigates to the previous page on prev arrow click', () => {
    const { getByText, container } = render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>
    );
    fireEvent.click(getByText('3')); // Move to page 3 first
    const paginationButtons = container.querySelectorAll('.page-index-button');
    const leftArrow = paginationButtons[0]; // The first button should be the left arrow
    fireEvent.click(leftArrow);
    expect(getByText('2')).toHaveClass('active-button'); // Checks if moved back to page 2
  });
  
  test('navigates to the next page on next arrow click', () => {
    const { getByText, container } = render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>
    );
    fireEvent.click(getByText('1')); // Start from page 1
    const paginationButtons = container.querySelectorAll('.page-index-button');
    const rightArrow = paginationButtons[paginationButtons.length - 1]; // The last button should be the right arrow
    fireEvent.click(rightArrow);
    expect(getByText('2')).toHaveClass('active-button'); // Checks if moved to page 2
  });

  // Test for rendering the correct number of pages
  test('renders correct number of pages based on total elements', () => {
    const { container } = render(
      <Paging totalElementsCount={12} maxElemPerPage={2}>
        <DummyChild />
      </Paging>
    );

    const buttons = container.querySelectorAll('.page-index-button');
    // Expect 6 page buttons plus 2 for the arrows
    expect(buttons.length).toBe(8);
  });

  // Test when currentPage is less than or equal to 5 (Lines 31-35)
  test('renders first five page numbers correctly', () => {
    const totalElementsCount = 50; // Adjust as needed to have more than 6 pages
    const { getByText } = render(
      <Paging totalElementsCount={totalElementsCount}>
        <DummyChild />
      </Paging>
    );
    // Expect first 5 pages to be rendered
    for (let i = 1; i <= 5; i++) {
      expect(getByText(i.toString())).toBeInTheDocument();
    }
  });

  // Test when currentPage is in the middle (Lines 58-62)
  test('renders middle page numbers correctly', async () => {
    const { getByText } = render(
      <Paging totalElementsCount={50}>
        <DummyChild />
      </Paging>
    );
    fireEvent.click(getByText('4')); // Navigate to a middle page
    await waitFor(() => {
      expect(getByText('4')).toHaveClass('active-button');
    });
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('5')).toBeInTheDocument();
  });

  test('renders last five page numbers correctly', async () => {
    const totalElementsCount = 300; // Set this to the correct value based on maxElemPerPage
    const { getByText } = render(
      <Paging totalElementsCount={totalElementsCount}>
        <DummyChild />
      </Paging>
    );
    fireEvent.click(getByText('50'));
    await waitFor(() => {
      // Now we should have the last page selected, and "50" should be rendered.
      expect(getByText('50')).toHaveClass('active-button');
    });
    for (let i = 46; i <= 50; i++) {
      expect(getByText(i.toString())).toBeInTheDocument();
    }
  });
});
