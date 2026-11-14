import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { vi } from 'vitest';
import ActiveInactiveConfirmationPopup from '../ActiveInactiveConfirmationPopup';
import ActiveCell from '../ActiveCell';
import noteStyles from '../ActiveCell.module.css';
import { renderWithProvider } from '../../../__tests__/utils';
import { themeMock } from '../../../__tests__/mockStates';

const mockStore = configureMockStore([thunk]);

const history = [
  {
    action: 'added',
    note: 'First note',
    changedAt: '2026-11-01T10:00:00.000Z',
    changedBy: { firstName: 'Alex', lastName: 'Admin' },
  },
  {
    action: 'edited',
    note: 'Left for a new job',
    changedAt: '2026-11-02T10:00:00.000Z',
    changedBy: { firstName: 'Jae', lastName: 'Owner' },
  },
];

const renderPopup = (props = {}, darkMode = false) => {
  const handlers = {
    onClose: vi.fn(),
    onDeactivateImmediate: vi.fn(),
    onScheduleFinalDay: vi.fn(),
    onReactivateUser: vi.fn(),
    onSaveStatusNote: vi.fn().mockResolvedValue(true),
  };
  renderWithProvider(
    <ActiveInactiveConfirmationPopup open fullName="Test User" isActive {...handlers} {...props} />,
    { store: mockStore({ theme: { ...themeMock, darkMode } }) },
  );
  return handlers;
};

describe('Status note in the status popup', () => {
  it('lets an admin add an optional note', async () => {
    const { onSaveStatusNote } = renderPopup();

    await userEvent.click(screen.getByRole('button', { name: 'Add note for this person' }));
    const saveButton = screen.getByRole('button', { name: 'Save note' });
    expect(saveButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/add a note for this person/i), 'Left for a new job');
    await userEvent.click(saveButton);

    expect(onSaveStatusNote).toHaveBeenCalledWith('Left for a new job');
  });

  it('shows the saved note, who added it and the history', async () => {
    renderPopup({ statusNote: 'Left for a new job', statusNoteHistory: history });

    expect(screen.getByText('Left for a new job', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/edited by jae owner on/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText('Note history (2)'));
    expect(screen.getByText('Note edited by')).toBeInTheDocument();
    expect(screen.getByText('Note added by')).toBeInTheDocument();
    expect(screen.getByText('First note')).toBeInTheDocument();
  });

  it('edits the note starting from the saved text', async () => {
    const { onSaveStatusNote } = renderPopup({
      statusNote: 'Left for a new job',
      statusNoteHistory: history,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Edit note' }));
    const input = screen.getByLabelText(/edit the note/i);
    expect(input).toHaveValue('Left for a new job');

    await userEvent.clear(input);
    await userEvent.type(input, 'Back in January');
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(onSaveStatusNote).toHaveBeenCalledWith('Back in January');
  });

  it('deletes the note only after confirming', async () => {
    const { onSaveStatusNote } = renderPopup({
      statusNote: 'Left for a new job',
      statusNoteHistory: history,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));
    expect(onSaveStatusNote).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(onSaveStatusNote).toHaveBeenCalledWith('');
  });

  it('saves a typed note before deactivating so it is not lost', async () => {
    const { onSaveStatusNote, onDeactivateImmediate, onClose } = renderPopup();

    await userEvent.click(screen.getByRole('button', { name: 'Add note for this person' }));
    await userEvent.type(screen.getByLabelText(/add a note for this person/i), 'Moving abroad');
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate Immediately' }));

    expect(onSaveStatusNote).toHaveBeenCalledWith('Moving abroad');
    await waitFor(() => expect(onDeactivateImmediate).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the popup open and skips the status change when the note fails to save', async () => {
    const { onSaveStatusNote, onDeactivateImmediate, onClose } = renderPopup();
    onSaveStatusNote.mockResolvedValue(false);

    await userEvent.click(screen.getByRole('button', { name: 'Add note for this person' }));
    await userEvent.type(screen.getByLabelText(/add a note for this person/i), 'Moving abroad');
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate Immediately' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be saved/i);
    expect(onDeactivateImmediate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows notes for inactive users too', () => {
    renderPopup({ isActive: false, statusNote: 'Left for a new job', statusNoteHistory: history });

    expect(screen.getByRole('button', { name: 'Reactivate User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit note' })).toBeInTheDocument();
  });

  it('uses the dark input style in dark mode', async () => {
    renderPopup({}, true);

    await userEvent.click(screen.getByRole('button', { name: 'Add note for this person' }));
    expect(screen.getByLabelText(/add a note for this person/i).className).toMatch(
      /statusNoteInputDark/,
    );
  });

  it('hides the note section when no save handler is given', () => {
    renderPopup({ onSaveStatusNote: undefined });

    expect(screen.queryByRole('button', { name: 'Add note for this person' })).toBeNull();
  });
});

describe('Status dot outline', () => {
  it('gets a blue outline when the user has a note', () => {
    render(<ActiveCell isActive canChange statusNote="Left for a new job" />);

    const dot = screen.getByRole('button');
    expect(dot).toHaveClass(noteStyles.statusDotWithNote);
    expect(dot).toHaveAttribute('title', 'Click to change user status. This user has a note.');
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['only spaces', '   '],
  ])('has no outline when the note is %s', (_label, statusNote) => {
    render(<ActiveCell isActive canChange statusNote={statusNote} />);

    const dot = screen.getByRole('button');
    expect(dot).not.toHaveClass(noteStyles.statusDotWithNote);
    expect(dot).toHaveAttribute('title', 'Click to change user status');
  });
});
