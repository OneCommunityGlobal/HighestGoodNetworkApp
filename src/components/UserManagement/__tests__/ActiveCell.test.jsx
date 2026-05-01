import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveCell from '../ActiveCell';
import styles from '../../Timelog/Timelog.module.css';

describe('ActiveCell', () => {
  it('renders active user with active class when active and not scheduled', () => {
    render(<ActiveCell isActive canChange={false} />);
    const cell = screen.getByTitle('Active');
    expect(cell).toHaveClass(styles.activeUser);
  });

  it('sets correct id when index is provided', () => {
    render(<ActiveCell index={3} canChange />);
    const cell = screen.getByRole('button');
    expect(cell).toHaveAttribute('id', 'active_cell_3');
  });

  it('renders inactive user with inactive class when cannot change', () => {
    render(
      <ActiveCell
        isActive={false}
        endDate="2020-01-01"
        canChange={false}
      />
    );
    const cell = screen.getByTitle('Inactive');
    expect(cell).toHaveClass(styles.notActiveUser);
  });

  it('is not clickable when canChange is false', async () => {
    const onClick = vi.fn();
    render(
      <ActiveCell
        isActive={false}
        endDate="2020-01-01"
        canChange={false}
        onClick={onClick}
      />
    );
    const cell = screen.getByTitle('Inactive');
    await userEvent.click(cell);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('uses pointer cursor when canChange is true', () => {
    render(<ActiveCell canChange />);
    const cell = screen.getByRole('button');
    expect(cell).toHaveStyle('cursor: pointer');
  });

  it('uses default cursor when canChange is false', () => {
    render(<ActiveCell isActive canChange={false} />);
    const cell = screen.getByTitle('Active');
    expect(cell).toHaveStyle('cursor: default');
  });
});
