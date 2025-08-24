// import React from 'react';
import { render, screen } from '@testing-library/react';
// import { unmountComponentAtNode } from 'react-dom';
import userEvent from '@testing-library/user-event';
import ActiveCell from './ActiveCell';


describe('active cell status check', () => {
  let isActive = true;
  const index = 6;
  const onClick = vi.fn();
  const canChange = true;
  it('displays the activeUser correctly', () => {
    render(
      <ActiveCell isActive={isActive} index={index} onClick={onClick} canChange={canChange} />,
      // container,
    );
    const cell = screen.getByTitle('Click here to change the user status');
    expect(cell).toHaveClass('activeUser');
  });
  it('displays the not activeUser correctly', () => {
    isActive = false;
    render(
      <ActiveCell isActive={isActive} index={index} onClick={onClick} canChange={canChange} />,
      // container,
    );
    // const span = rendered.container.querySelector('span');
    // expect(span.className).toBe('notActiveUser');
    const cell = screen.getByTitle('Click here to change the user status');
    expect(cell).toHaveClass('notActiveUser');
  });
});

describe('activate cell hover Test', () => {
  let isActive = true;
  const index = 6;
  const onClick = vi.fn();
  let canChange = true;
  it('displays the hover info correctly when active and can change', async() => {
    render(
      <ActiveCell isActive={isActive} index={index} onClick={onClick} canChange={canChange} />,
      // container,
    );
    // const span = rendered.container.querySelector('span');
    const cell = screen.getByTitle('Click here to change the user status');
    await userEvent.hover(cell);
    expect(cell).toHaveAttribute('title', 'Click here to change the user status');
  });
  it('displays the not activeUser correctly when active and cant change', async() => {
    isActive = true;
    canChange = false;
    render(
      <ActiveCell isActive={isActive} index={index} onClick={onClick} canChange={canChange} />,
      // container,
    );
    const cell = screen.getByTitle('Active');
    await userEvent.hover(cell);
    expect(cell).toHaveAttribute('title', 'Active');
  });
  it('displays the not activeUser correctly when inactive and cant change', async() => {
    isActive = false;
    canChange = false;
    render(
      <ActiveCell isActive={isActive} index={index} onClick={onClick} canChange={canChange} />,
      // container,
    );
    const cell = screen.getByTitle('Inactive');
    await userEvent.hover(cell);
    expect(cell).toHaveAttribute('title', 'Inactive');
  });
});
