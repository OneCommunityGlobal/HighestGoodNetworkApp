import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Paging from '../Paging';
import styles from '../Paging.module.css';

// Dummy child component for tests
function DummyChild() {
  return <div>Dummy Child</div>;
}

describe('Paging Component', () => {
  test('renders with default state correctly', () => {
    render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('changes page on page number click', () => {
    render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>,
    );
    fireEvent.click(screen.getByText('2'));
    expect(screen.getByText('2')).toHaveClass(styles.activeButton);
  });

  test('navigates to the previous page on prev arrow click', () => {
    render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>,
    );
    fireEvent.click(screen.getByText('3'));
    const paginationButtons = screen.getAllByRole('button');
    const leftArrow = paginationButtons[0];
    fireEvent.click(leftArrow);
    expect(screen.getByText('2')).toHaveClass(styles.activeButton);
  });

  test('navigates to the next page on next arrow click', () => {
    render(
      <Paging totalElementsCount={30}>
        <DummyChild />
      </Paging>,
    );
    fireEvent.click(screen.getByText('1'));
    const paginationButtons = screen.getAllByRole('button');
    const rightArrow = paginationButtons[paginationButtons.length - 1];
    fireEvent.click(rightArrow);
    expect(screen.getByText('2')).toHaveClass(styles.activeButton);
  });

  test('renders correct number of pages based on total elements', () => {
    render(
      <Paging totalElementsCount={12} maxElemPerPage={2}>
        <DummyChild />
      </Paging>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(8); // 6 page buttons + 2 arrows
  });

  test('renders first five page numbers correctly', () => {
    render(
      <Paging totalElementsCount={50}>
        <DummyChild />
      </Paging>,
    );
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('renders middle page numbers correctly', async () => {
    render(
      <Paging totalElementsCount={50}>
        <DummyChild />
      </Paging>,
    );
    fireEvent.click(screen.getByText('4'));
    await waitFor(() => {
      expect(screen.getByText('4')).toHaveClass(styles.activeButton);
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders last five page numbers correctly', async () => {
    render(
      <Paging totalElementsCount={300}>
        <DummyChild />
      </Paging>,
    );
    fireEvent.click(screen.getByText('50'));
    await waitFor(() => {
      expect(screen.getByText('50')).toHaveClass(styles.activeButton);
    });
    for (let i = 46; i <= 50; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });
});
