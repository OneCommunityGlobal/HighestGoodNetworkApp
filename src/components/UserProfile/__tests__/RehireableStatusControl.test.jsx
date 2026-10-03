import { fireEvent, render, screen } from '@testing-library/react';
import RehireableStatusControl from '../RehireableStatusControl';

describe('RehireableStatusControl', () => {
  it('confirms a non-empty optional reason', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    expect(screen.getByText(/please enter the reason below/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: /reason for not rehireable status/i }), {
      target: { value: '  Not a good fit  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(false, 'Not a good fit');
  });

  it('allows confirmation with an empty reason', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(false, '');
  });

  it('does not change status or save reason when cancelled', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    fireEvent.change(screen.getByRole('textbox', { name: /reason for not rehireable status/i }), {
      target: { value: 'Cancelled reason' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows a saved reason in orange on the unchecked control and clears it after restoring rehireability', () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason="Saved reason"
        onConfirm={onConfirm}
      />,
    );
    const control = screen.getByRole('button', { name: 'Not rehireable' });
    expect(control).toHaveAttribute('title', 'Saved reason');
    expect(control.className).toContain('reasonIcon');

    fireEvent.click(control);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith(true, '');

    rerender(<RehireableStatusControl isRehireable onConfirm={onConfirm} />);
    rerender(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason=""
        onConfirm={onConfirm}
      />,
    );
    const uncheckedControl = screen.getByRole('button', { name: 'Not rehireable' });
    expect(uncheckedControl).toHaveAttribute('title', 'Click to change rehirable status');
    expect(uncheckedControl.className).not.toContain('reasonIcon');
  });
});