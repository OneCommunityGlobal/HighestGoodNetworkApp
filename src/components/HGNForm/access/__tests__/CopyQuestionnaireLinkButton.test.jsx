import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import CopyQuestionnaireLinkButton from '../CopyQuestionnaireLinkButton';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('CopyQuestionnaireLinkButton', () => {
  const link = `${window.location.origin}/questionnaire`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('copies the permanent questionnaire link', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyQuestionnaireLinkButton />);
    fireEvent.click(screen.getByRole('button', { name: /copy questionnaire link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows the link when copying fails', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error()) } });

    render(<CopyQuestionnaireLinkButton />);
    fireEvent.click(screen.getByRole('button', { name: /copy questionnaire link/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(link)));
  });
});
