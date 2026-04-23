import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import axios from 'axios';

vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
import { toast } from 'react-toastify';
vi.mock('axios');

import CurrentPromptModal from '~/components/WeeklySummary/CurrentPromptModal';

const mockStore = configureStore([thunk]);
const theme = { darkMode: false };

describe('CurrentPromptModal component', () => {
  let store;
  const mockWriteText = vi.fn();
  const mockToastSuccess = toast.success;

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });
  });

  beforeEach(() => {
    store = mockStore({ theme });
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );
  });

  it('opens the modal when "View and Copy Current AI Prompt" is clicked', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );

    const btn = screen.getByRole('button', { name: /view and copy current ai prompt/i });
    fireEvent.click(btn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('shows tooltip on hover of info icon', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );

    // Add a test ID to the icon in your real component for better querying
    const icon = screen.getByTestId('ai-info-icon');

    fireEvent.mouseEnter(icon);
    await waitFor(() => {
      expect(icon).toHaveAttribute('aria-describedby');
    });

    fireEvent.mouseLeave(icon);
    await waitFor(() => {
      expect(icon).not.toHaveAttribute('aria-describedby');
    });
  });

  it('renders prompt text inside the modal', async () => {
    const promptText = `Please edit the following summary…`;
    axios.get.mockResolvedValue({ data: { aIPromptText: promptText } });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /view and copy current ai prompt/i }));

    expect(await screen.findByText(promptText)).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /view and copy current ai prompt/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('copies the prompt and shows a toast when "Copy Prompt" is clicked', async () => {
    const promptText = `Prompt to copy…`;
    axios.get.mockResolvedValue({ data: { aIPromptText: promptText } });
    axios.put.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /view and copy current ai prompt/i }));
    const copyBtn = await screen.findByRole('button', { name: /copy prompt/i });

    fireEvent.click(copyBtn);

    await waitFor(() => expect(mockWriteText).toHaveBeenCalledWith(promptText));
    expect(mockToastSuccess).toHaveBeenCalledWith('Prompt Copied!');
  });
});
