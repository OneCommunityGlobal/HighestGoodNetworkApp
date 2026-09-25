import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import FAQSection from '../FAQSection';
import { getAllFAQs } from '../../Faq/api';
import styles from '../FAQSection.module.css';

vi.mock('../../Faq/api', () => ({
  getAllFAQs: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
}));

const buildStore = (darkMode = false) =>
  configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

const setUpSection = (darkMode = false) =>
  render(
    <Provider store={buildStore(darkMode)}>
      <FAQSection />
    </Provider>,
  );

describe('FAQSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the questions returned by the API, numbered from one', async () => {
    getAllFAQs.mockResolvedValue({
      data: [
        { _id: '1', question: 'How do I volunteer?', answer: 'Fill in the form.' },
        { _id: '2', question: 'Is there a time commitment?', answer: '10 hours a week.' },
      ],
    });

    setUpSection();

    expect(await screen.findByText(/1\. How do I volunteer\?/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Is there a time commitment\?/)).toBeInTheDocument();
    expect(screen.getByText('Fill in the form.')).toBeInTheDocument();
  });

  it('drops the video question from the list so it is not shown twice', async () => {
    getAllFAQs.mockResolvedValue({
      data: [
        { _id: '1', question: 'What is it like working with us?', answer: 'See the video.' },
        { _id: '2', question: 'How do I volunteer?', answer: 'Fill in the form.' },
      ],
    });

    setUpSection();

    expect(await screen.findByText(/1\. How do I volunteer\?/)).toBeInTheDocument();
    // The video card keeps the question as its own heading, so it appears once.
    expect(screen.getAllByText('What is it like working with us?')).toHaveLength(1);
    expect(screen.queryByText('See the video.')).not.toBeInTheDocument();
  });

  it('strips event handlers out of answers while keeping their formatting', async () => {
    getAllFAQs.mockResolvedValue({
      data: [
        {
          _id: '1',
          question: 'Where is the form?',
          answer:
            '<p>On the <a href="/x">site</a>.</p><img src="x" onerror="window.hacked = true">',
        },
      ],
    });

    setUpSection();

    // The markup still renders, so answers keep their links and formatting.
    expect(await screen.findByRole('link', { name: 'site' })).toBeInTheDocument();
    // But the injected handler is gone, which it would not be without sanitising.
    expect(screen.getByRole('img')).not.toHaveAttribute('onerror');
  });

  it('shows the video card even before any questions load', () => {
    getAllFAQs.mockResolvedValue({ data: [] });

    setUpSection();

    expect(screen.getByTitle('What is it like working with us?')).toBeInTheDocument();
  });

  it('asks the visitor to sign in when the API rejects the request, without a toast', async () => {
    getAllFAQs.mockRejectedValue({ response: { status: 401 } });

    setUpSection();

    expect(
      await screen.findByText(/Sign in to read the frequently asked questions/),
    ).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('reports any other failure as an FAQ error', async () => {
    getAllFAQs.mockRejectedValue({ response: { status: 500 } });

    setUpSection();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error fetching FAQs'));
    expect(screen.queryByText(/Sign in to read/)).not.toBeInTheDocument();
  });

  it('applies the dark mode class when dark mode is on', async () => {
    getAllFAQs.mockResolvedValue({ data: [] });

    setUpSection(true);

    await waitFor(() => expect(getAllFAQs).toHaveBeenCalled());
    expect(screen.getByTestId('faq-section')).toHaveClass(styles.dark);
  });
});
