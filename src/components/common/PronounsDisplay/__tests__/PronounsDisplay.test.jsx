import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import httpService from '~/services/httpService';
import { toast } from 'react-toastify';
import PronounsDisplay from '../PronounsDisplay';

vi.mock('~/services/httpService', () => ({
  default: { patch: vi.fn() },
}));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('PronounsDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows pronouns without an edit button when canEdit is false', () => {
    render(<PronounsDisplay userId="u1" pronouns="She/Her" />);
    expect(screen.getByText('(She/Her)')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit pronouns/i })).not.toBeInTheDocument();
  });

  it('renders nothing when there are no pronouns and the viewer cannot edit', () => {
    const { container } = render(<PronounsDisplay userId="u1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prompts the user to choose pronouns when none are set', () => {
    render(<PronounsDisplay userId="u1" canEdit isSelf />);
    expect(screen.getByRole('button', { name: 'Choose your pronouns' })).toBeInTheDocument();
  });

  it('saves the selected pronouns and calls onSaved', async () => {
    httpService.patch.mockResolvedValue({ data: { _id: 'u1', pronouns: 'They/Them' } });
    const onSaved = vi.fn();
    render(<PronounsDisplay userId="u1" pronouns="He/Him" canEdit onSaved={onSaved} />);

    fireEvent.click(screen.getByRole('button', { name: /edit pronouns/i }));
    fireEvent.change(screen.getByLabelText('Pronouns'), { target: { value: 'They/Them' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('They/Them'));
    expect(httpService.patch).toHaveBeenCalledWith(
      expect.stringContaining('/userprofile/u1/pronouns'),
      { pronouns: 'They/Them' },
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error and keeps the editor open when saving fails', async () => {
    httpService.patch.mockRejectedValue({ response: { data: { error: 'Nope' } } });
    const onSaved = vi.fn();
    render(<PronounsDisplay userId="u1" canEdit isSelf onSaved={onSaved} />);

    fireEvent.click(screen.getByRole('button', { name: 'Choose your pronouns' }));
    fireEvent.change(screen.getByLabelText('Pronouns'), { target: { value: 'He/Him' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Nope'));
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Pronouns')).toBeInTheDocument();
  });
});
