import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import FaqSection from '../FaqSection';
import styles from '../FaqSection.module.css';

const mockStore = configureMockStore([]);
const mockWriteText = vi.fn();

const renderFaqSection = (darkMode = false) => {
  const store = mockStore({ theme: { darkMode } });
  return render(
    <Provider store={store}>
      <FaqSection />
    </Provider>,
  );
};

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: mockWriteText },
  });
});

beforeEach(() => {
  mockWriteText.mockReset();
  mockWriteText.mockResolvedValue(undefined);
});

describe('FaqSection', () => {
  it('only applies the dark container class when dark mode is enabled', () => {
    const { unmount } = renderFaqSection();
    expect(screen.getByTestId('faq-section')).not.toHaveClass(styles.faqContainerDark);

    unmount();
    renderFaqSection(true);
    expect(screen.getByTestId('faq-section')).toHaveClass(styles.faqContainerDark);
  });

  it('expands and collapses an answer in dark mode', () => {
    renderFaqSection(true);
    const question = screen.getByRole('button', { name: /what is one community/i });

    expect(question).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(question);

    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/global nonprofit organization/i)).toBeInTheDocument();

    fireEvent.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters FAQs by search text and category', () => {
    renderFaqSection();

    fireEvent.change(screen.getByPlaceholderText(/search faqs/i), {
      target: { value: 'virtual and physical' },
    });
    expect(screen.getByText('Where is One Community located?')).toBeInTheDocument();
    expect(screen.queryByText('What is One Community?')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search faqs/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Events' }));
    expect(
      screen.getByText('What kind of events does One Community organize?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Where is One Community located?')).not.toBeInTheDocument();
  });

  it('copies the contact email and confirms the action', async () => {
    renderFaqSection();

    fireEvent.click(screen.getByRole('button', { name: /contact us/i }));

    expect(mockWriteText).toHaveBeenCalledWith('onecommunityglobal@gmail.com');
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });
});
