import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route } from 'react-router-dom';
import FaqHistory from '../FaqHistory';
import { getFAQHistory } from '../api';

vi.mock('../api', () => ({
  getFAQHistory: vi.fn(),
}));

const faqWithHistory = {
  question: 'How do I volunteer?',
  answer: 'Fill in the form.',
  createdBy: 'Jae',
  createdAt: '2026-10-01T10:00:00.000Z',
  changeHistory: [
    {
      updatedBy: 'Aarya',
      updatedAt: '2026-10-02T10:00:00.000Z',
      previousQuestion: 'How to volunteer?',
      previousAnswer: 'Use the form.',
      updatedQuestion: 'How do I volunteer?',
      updatedAnswer: 'Fill in the form.',
    },
  ],
};

// Finds the element with this tag whose text starts with the given words.
const elementStartingWith = (tag, words) => (_, element) =>
  element?.tagName === tag && element.textContent.startsWith(words);

const buildStore = darkMode =>
  configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

const openPage = (darkMode = false) =>
  render(
    <Provider store={buildStore(darkMode)}>
      <MemoryRouter initialEntries={['/faqs/abc123/history']}>
        <Route path="/faqs/:id/history" component={FaqHistory} />
      </MemoryRouter>
    </Provider>,
  );

describe('FaqHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the history of the FAQ named in the address', async () => {
    getFAQHistory.mockResolvedValue({ data: faqWithHistory });
    openPage();

    expect(screen.getByText('Loading FAQ...')).toBeInTheDocument();
    expect(await screen.findByText('Current Question:')).toBeInTheDocument();
    expect(getFAQHistory).toHaveBeenCalledWith('abc123');
  });

  it('shows the question, who created it and every change', async () => {
    getFAQHistory.mockResolvedValue({ data: faqWithHistory });
    openPage();

    expect(await screen.findByText('Jae')).toBeInTheDocument();
    expect(screen.getByText('Aarya')).toBeInTheDocument();
    expect(screen.getByText('How to volunteer?')).toBeInTheDocument();
    expect(screen.getByText('Use the form.')).toBeInTheDocument();
  });

  it('says so when the FAQ has never been changed', async () => {
    getFAQHistory.mockResolvedValue({ data: { ...faqWithHistory, changeHistory: [] } });
    openPage();

    expect(await screen.findByText('No modification history available.')).toBeInTheDocument();
  });

  it('shows "FAQ not found" when the history cannot be loaded', async () => {
    // The page logs the failure. setupTests.js already wraps console.error in a spy with a
    // filter, so we mute it for this test only and put the filter back afterwards.
    // eslint-disable-next-line no-console
    const setupFilter = console.error.getMockImplementation();
    // eslint-disable-next-line no-console
    console.error.mockImplementation(() => {});
    try {
      getFAQHistory.mockRejectedValue(new Error('Network error'));
      openPage();

      expect(await screen.findByText('FAQ not found')).toBeInTheDocument();
    } finally {
      // eslint-disable-next-line no-console
      console.error.mockImplementation(setupFilter);
    }
  });

  it('uses dark colours in dark mode', async () => {
    getFAQHistory.mockResolvedValue({ data: faqWithHistory });
    openPage(true);

    expect(await screen.findByText('Current Question:')).toHaveStyle({ color: '#93c5fd' });
    expect(screen.getByText(elementStartingWith('DIV', 'Current Question:'))).toHaveStyle({
      backgroundColor: '#1f2937',
      color: '#f3f4f6',
    });
    expect(screen.getByText('Created By:')).toHaveStyle({ color: '#86efac' });
    expect(screen.getByText(elementStartingWith('P', 'Previous Question:'))).toHaveStyle({
      color: '#fca5a5',
    });
  });

  it('keeps the original colours in light mode', async () => {
    getFAQHistory.mockResolvedValue({ data: faqWithHistory });
    openPage(false);

    expect(await screen.findByText('Current Question:')).toHaveStyle({ color: '#007bff' });
    expect(screen.getByText(elementStartingWith('DIV', 'Current Question:'))).toHaveStyle({
      backgroundColor: '#f9f9f9',
    });
    expect(screen.getByText('Created By:')).toHaveStyle({ color: '#28a745' });
    expect(screen.getByText(elementStartingWith('P', 'Previous Question:'))).toHaveStyle({
      color: '#dc3545',
    });
  });
});
