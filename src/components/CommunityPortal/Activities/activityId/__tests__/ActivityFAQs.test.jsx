import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { getAllFAQs } from '~/components/Faq/api';
import ActivityFAQs from '../ActivityFAQs';
import styles from '../ActivityFAQs.module.css';

vi.mock('~/components/Faq/api', () => ({
  getAllFAQs: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockWriteText = vi.fn();

const renderActivityFAQs = () =>
  render(
    <MemoryRouter initialEntries={['/communityportal/activity/activity-1/faq']}>
      <Route path="/communityportal/activity/:activityid/faq">
        <ActivityFAQs />
      </Route>
    </MemoryRouter>,
  );

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: mockWriteText },
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  mockWriteText.mockReset();
  mockWriteText.mockResolvedValue(undefined);
  getAllFAQs.mockResolvedValue({
    data: [
      {
        _id: 'faq-1',
        question: 'How do I join?',
        answer: 'Choose an activity and register.',
        category: 'Participation',
      },
    ],
  });
});

describe('ActivityFAQs', () => {
  it('copies the code-provided contact email and shows a success toast', async () => {
    renderActivityFAQs();

    const contactButton = await screen.findByRole('button', { name: 'contact' });
    expect(contactButton.tagName).toBe('BUTTON');
    expect(contactButton).toHaveClass(styles.footerLink);

    fireEvent.click(contactButton);

    expect(mockWriteText).toHaveBeenCalledWith('onecommunityglobal@gmail.com');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Email copied!'));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast when copying fails', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard unavailable'));
    renderActivityFAQs();

    fireEvent.click(await screen.findByRole('button', { name: 'contact' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to copy email.'));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
