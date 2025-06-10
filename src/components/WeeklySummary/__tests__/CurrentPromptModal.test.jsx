import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import axios from 'axios';

// 1) Mock toast once, at top-level
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
    // stub out the clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });
  });

  beforeEach(() => {
    store = mockStore({ theme });
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    await act(async () => {
      render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );
    });

    // no assertion needed—just verifies no errors
  });

  it('opens the modal when "View and Copy Current AI Prompt" is clicked', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );

      const btn = container.querySelector('button.p-1.mb-1.responsive-font-size.btn.btn-info');
      expect(btn).toHaveTextContent('View and Copy Current AI Prompt');
      fireEvent.click(btn);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows tooltip on hover of info icon', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );

      const icon = container.querySelector('.fa.fa-info-circle');
      fireEvent.mouseEnter(icon);
      await waitFor(() => {
        expect(icon).toHaveAttribute('aria-describedby');
      });
      fireEvent.mouseLeave(icon);
      await waitFor(() => {
        expect(icon).not.toHaveAttribute('aria-describedby');
      });
    });
  });

  it('renders prompt text inside the modal', async () => {
    const promptText = `Please edit the following summary…`;
    axios.get.mockResolvedValue({ data: { aIPromptText: promptText } });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );

      fireEvent.click(container.querySelector('button.p-1.mb-1.responsive-font-size.btn.btn-info'));

      // now wait for the async fetch & render
      await waitFor(() => {
        const dialog = screen.getByRole('document');
        const body = dialog.querySelector('.modal-body');
        expect(body).toHaveTextContent(promptText);
      });
    });
  });

  it('closes the modal when the close button is clicked', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );

      fireEvent.click(container.querySelector('button.p-1.mb-1.responsive-font-size.btn.btn-info'));

      const dialog = await screen.findByRole('document');
      const closeBtn = dialog.querySelector('.close');
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByRole('document')).toBeNull();
      });
    });
  });

  it('copies the prompt and shows a toast when "Copy Prompt" is clicked', async () => {
    const promptText = `Prompt to copy…`;
    axios.get.mockResolvedValue({ data: { aIPromptText: promptText } });
    axios.put.mockResolvedValue({ status: 200 });

    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Manager" darkMode={theme} />
        </Provider>,
      );

      fireEvent.click(container.querySelector('button.p-1.mb-1.responsive-font-size.btn.btn-info'));
      const copyBtn = await screen.findByRole('button', { name: 'Copy Prompt' });

      fireEvent.click(copyBtn);

      // ensure clipboard.writeText was called with exactly that text
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(promptText);
        expect(mockToastSuccess).toHaveBeenCalledWith('Prompt Copied!');
      });
    });
  });
});
