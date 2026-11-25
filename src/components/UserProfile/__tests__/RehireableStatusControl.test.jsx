import { fireEvent, render, screen } from '@testing-library/react';
import RehireableStatusControl from '../RehireableStatusControl';

describe('RehireableStatusControl', () => {
  it('requires a nonblank reason before confirming a not-rehireable status', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Rehireable' }));
    expect(screen.getByText(/enter the required reason/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox', { name: /reason for not rehireable status/i }), {
      target: { value: '  Not a good fit  ' },
    });
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(false, 'Not a good fit');
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

  it('opens the saved reason and audit history from the orange status control', () => {
    const onConfirm = vi.fn();
    render(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason="Saved reason"
        notRehireableReasonHistory={[
          {
            action: 'submitted',
            reason: 'Saved reason',
            changedAt: '2026-01-02T03:04:00.000Z',
            changedBy: {
              username: 'admin@example.org',
              firstName: 'Alex',
              lastName: 'Admin',
            },
          },
        ]}
        onConfirm={onConfirm}
      />,
    );

    const control = screen.getByRole('button', { name: 'Not rehireable' });
    expect(control.style.border).toBe('2px solid rgb(240, 140, 0)');
    fireEvent.click(control);

    expect(screen.getByRole('heading', { name: 'Not Rehireable Details' })).toBeInTheDocument();
    expect(screen.getAllByText('Saved reason')).toHaveLength(2);
    expect(
      screen.getByText((_, element) => element?.textContent === 'Reason submitted by Alex Admin'),
    ).toBeInTheDocument();
    expect(screen.getByText('Username: admin@example.org')).toBeInTheDocument();
    expect(screen.getByText(new Date('2026-01-02T03:04:00.000Z').toLocaleString())).toBeInTheDocument();
  });

  it('opens edit mode and submits the updated reason', () => {
    const onConfirm = vi.fn();
    render(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason="Old reason"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Not rehireable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit reason' }));
    const reasonInput = screen.getByRole('textbox', { name: /reason for not rehireable status/i });
    expect(reasonInput).toHaveValue('Old reason');
    fireEvent.change(reasonInput, { target: { value: '  Corrected reason  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(false, 'Corrected reason');
  });

  it('allows a user to mark the profile rehireable from the reason details', () => {
    const onConfirm = vi.fn();
    render(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason="Saved reason"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Not rehireable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark Rehireable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith(true, '');
  });

  it('opens an edit prompt for legacy not-rehireable records without a saved reason', () => {
    const onConfirm = vi.fn();
    render(<RehireableStatusControl isRehireable={false} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Not rehireable' }));

    expect(screen.getByRole('heading', { name: 'Edit Not Rehireable Reason' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /reason for not rehireable status/i })).toBeInTheDocument();
  });

  it('applies dark-mode classes to the details modal', () => {
    render(
      <RehireableStatusControl
        isRehireable={false}
        notRehireableReason="Saved reason"
        darkMode
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Not rehireable' }));

    expect(screen.getByRole('document')).toHaveClass('text-light', 'dark-mode');
    expect(screen.getByText('Reason history')).toBeInTheDocument();
  });
});
