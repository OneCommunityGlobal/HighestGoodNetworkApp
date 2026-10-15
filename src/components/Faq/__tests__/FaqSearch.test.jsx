import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FaqSearch from '../FaqSearch';
import { getAllFAQs, searchFAQs, logUnansweredQuestion } from '../api';

vi.mock('../api', () => ({
  getAllFAQs: vi.fn(),
  searchFAQs: vi.fn(),
  logUnansweredQuestion: vi.fn(),
}));

const allFaqs = [
  { _id: '1', question: 'How do I volunteer?', answer: 'Fill in the form.' },
  { _id: '2', question: 'Is there a time commitment?', answer: '10 hours a week.' },
];

const buildStore = darkMode =>
  configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

// Renders the page and waits until the full FAQ list has loaded.
const openPage = async (darkMode = false) => {
  render(
    <Provider store={buildStore(darkMode)}>
      <FaqSearch />
    </Provider>,
  );
  await screen.findByText('How do I volunteer?');
  return screen.getByPlaceholderText('Search FAQs');
};

const type = (input, value) => fireEvent.change(input, { target: { value } });

describe('FaqSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllFAQs.mockResolvedValue({ data: allFaqs });
    searchFAQs.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows every FAQ when the page opens', async () => {
    await openPage();

    expect(screen.getByText('How do I volunteer?')).toBeInTheDocument();
    expect(screen.getByText('Is there a time commitment?')).toBeInTheDocument();
  });

  it('sends one search request after typing stops, not one per letter', async () => {
    const input = await openPage();
    vi.useFakeTimers();

    type(input, 'v');
    type(input, 'vo');
    type(input, 'vol');
    expect(searchFAQs).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchFAQs).toHaveBeenCalledTimes(1);
    expect(searchFAQs).toHaveBeenCalledWith('vol');
  });

  it('trims spaces around the search text before searching', async () => {
    const input = await openPage();
    vi.useFakeTimers();

    type(input, '  volunteer  ');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchFAQs).toHaveBeenCalledWith('volunteer');
  });

  it('treats a space-only search as empty and keeps the full list', async () => {
    const input = await openPage();
    vi.useFakeTimers();

    type(input, '   ');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchFAQs).not.toHaveBeenCalled();
    expect(screen.getByText('How do I volunteer?')).toBeInTheDocument();
    expect(screen.getByText('Is there a time commitment?')).toBeInTheDocument();
  });

  it('cancels a waiting search when the box is cleared', async () => {
    const input = await openPage();
    vi.useFakeTimers();

    type(input, 'vol');
    type(input, '');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchFAQs).not.toHaveBeenCalled();
    expect(screen.getByText('Is there a time commitment?')).toBeInTheDocument();
  });

  it('cancels a waiting search when the page is closed', async () => {
    getAllFAQs.mockResolvedValue({ data: allFaqs });
    const { unmount } = render(
      <Provider store={buildStore(false)}>
        <FaqSearch />
      </Provider>,
    );
    const input = await screen.findByPlaceholderText('Search FAQs');
    await screen.findByText('How do I volunteer?');
    vi.useFakeTimers();

    type(input, 'vol');
    unmount();
    vi.advanceTimersByTime(300);

    expect(searchFAQs).not.toHaveBeenCalled();
  });

  it('shows the search results and opens an answer when a question is clicked', async () => {
    searchFAQs.mockResolvedValue({ data: [allFaqs[0]] });
    const input = await openPage();
    vi.useFakeTimers();

    type(input, 'volunteer');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    vi.useRealTimers();

    expect(screen.queryByText('Is there a time commitment?')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('How do I volunteer?'));
    expect(screen.getByText('Fill in the form.')).toBeInTheDocument();
  });

  it('offers to log a question when nothing is found, and shows the reply', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    logUnansweredQuestion.mockResolvedValue({ data: { message: 'Question logged successfully' } });
    const input = await openPage();
    vi.useFakeTimers();

    type(input, 'Aarya test question');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    vi.useRealTimers();

    expect(screen.getByText('No results found.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Log this question and notify Owner'));

    expect(await screen.findByText('Log this question and notify Owner')).toBeInTheDocument();
    expect(logUnansweredQuestion).toHaveBeenCalledWith('Aarya test question');
    expect(alertSpy).toHaveBeenCalledWith('Question logged successfully');
    alertSpy.mockRestore();
  });

  it('uses dark colours in dark mode', async () => {
    const input = await openPage(true);

    expect(input).toHaveStyle({ backgroundColor: '#1f2937', color: '#f3f4f6' });
    const questionButton = screen.getByRole('button', { name: 'How do I volunteer?' });
    expect(questionButton).toHaveStyle({ backgroundColor: '#1f2937', color: '#f3f4f6' });
  });

  it('keeps the light colours in light mode', async () => {
    const input = await openPage(false);

    expect(input).toHaveStyle({ backgroundColor: '#fff', color: '#111827' });
    const questionButton = screen.getByRole('button', { name: 'How do I volunteer?' });
    expect(questionButton).toHaveStyle({ backgroundColor: '#f9f9f9' });
  });
});
