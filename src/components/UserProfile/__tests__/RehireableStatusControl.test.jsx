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

  it('renders each rehireable visual state from persisted props', () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <div className="right-column">
        <RehireableStatusControl
          isRehireable
          notRehireableReason="Saved reason"
          onConfirm={onConfirm}
        />
      </div>,
    );
    const checkedControl = screen.getByRole('button', { name: 'Rehireable' });
    expect(checkedControl).toHaveClass('fa-check-square-o');
    expect(checkedControl.style.border).toBe('');

    rerender(
      <div className="right-column">
        <RehireableStatusControl isRehireable={false} onConfirm={onConfirm} />
      </div>,
    );
    const uncheckedControl = screen.getByRole('button', { name: 'Not rehireable' });
    expect(uncheckedControl).toHaveClass('fa-square-o');
    expect(uncheckedControl.title).toBe('Click to change rehirable status');
    expect(uncheckedControl.style.border).toBe('');

    rerender(
      <div className="right-column">
        <RehireableStatusControl
          isRehireable={false}
          notRehireableReason="   "
          onConfirm={onConfirm}
        />
      </div>,
    );
    const whitespaceReasonControl = screen.getByRole('button', { name: 'Not rehireable' });
    expect(whitespaceReasonControl).toHaveClass('fa-square-o');
    expect(whitespaceReasonControl.title).toBe('Click to change rehirable status');
    expect(whitespaceReasonControl.style.border).toBe('');

    rerender(
      <div className="right-column">
        <RehireableStatusControl
          isRehireable={false}
          notRehireableReason="Saved reason"
          onConfirm={onConfirm}
        />
      </div>,
    );
    const control = screen.getByRole('button', { name: 'Not rehireable' });
    expect(control.className).not.toContain('fa-square-o');
    expect(control.title).toBe('Saved reason');
    expect(control.style.border).toBe('2px solid rgb(240, 140, 0)');
    expect(window.getComputedStyle(control).borderColor).toBe('rgb(240, 140, 0)');
    expect(window.getComputedStyle(control).borderStyle).toBe('solid');
    expect(window.getComputedStyle(control).borderWidth).toBe('2px');

    fireEvent.click(control);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith(true, '');
  });
});