import { fireEvent, render, screen } from '@testing-library/react';
import RehireableStatusControl from '../RehireableStatusControl';

describe('RehireableStatusControl', () => {
  it('confirms a valid trimmed reason', () => {
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

  it.each([
    ['empty', ''],
    ['whitespace-only', '   '],
  ])('rejects an %s reason without calling onConfirm', (_label, value) => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    fireEvent.change(screen.getByRole('textbox', { name: /reason for not rehireable status/i }), {
      target: { value },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/a reason is required/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /reason for not rehireable status/i })).toHaveClass(
      'is-invalid',
    );
  });

  it('accepts a single non-whitespace character and clears the error on typing', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByText(/a reason is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: /reason for not rehireable status/i }), {
      target: { value: ' x ' },
    });
    expect(screen.queryByText(/a reason is required/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(false, 'x');
  });

  it('clears a previous validation error when the modal is reopened', () => {
    render(<RehireableStatusControl onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));

    expect(screen.queryByText(/a reason is required/i)).not.toBeInTheDocument();
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