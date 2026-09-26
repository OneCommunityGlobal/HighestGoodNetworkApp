import { fireEvent, render, screen } from '@testing-library/react';
import TeamCodeWarningButton from '../TeamCodeWarningButton';

vi.mock('react-tooltip', () => ({
  default: ({ children }) => <span>{children}</span>,
}));

describe('TeamCodeWarningButton', () => {
  it('stays hidden when the report has no mismatched users', () => {
    render(<TeamCodeWarningButton count={0} active={false} onClick={vi.fn()} />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the count and toggles the mismatch view', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <TeamCodeWarningButton count={2} active={false} onClick={onClick} />,
    );

    const button = screen.getByRole('button', { name: 'Show users with mismatched team codes' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.className).toContain('text-danger');
    expect(
      screen.getByText(
        '2 users have mismatched team codes! Smash this “i” button to see who they are 👊',
      ),
    ).toBeTruthy();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<TeamCodeWarningButton count={2} active onClick={onClick} />);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
