import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
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

const mockStore = configureMockStore([thunk]);
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

  describe('NEW indicator', () => {
    const older = '2026-10-18T12:00:00.000Z';
    const edited = '2026-10-19T12:00:00.000Z';
    const copied = '2026-10-20T12:00:00.000Z';
    const nextEdit = '2026-10-21T12:00:00.000Z';

    const renderPrompt = async () => {
      render(
        <Provider store={store}>
          <CurrentPromptModal userId="abc123" userRole="Owner" darkMode={false} />
        </Provider>,
      );
      await act(async () => {
        await Promise.resolve();
      });
    };

    it.each([
      ['default prompt', null, older, false],
      ['legacy response', undefined, older, false],
      ['invalid edit', 'not-a-date', older, false],
      ['empty edit', '', older, false],
      ['invalid edit type', false, older, false],
      ['both timestamps null', null, null, false],
      ['both timestamps invalid', 'invalid', 'invalid', false],
      ['edit newer than copy', edited, older, true],
      ['copy equals edit', edited, edited, false],
      ['copy newer than edit', edited, copied, false],
      ['missing copy', edited, undefined, true],
      ['null copy', edited, null, true],
      ['invalid copy', edited, 'invalid', true],
      ['empty copy', edited, '', true],
      ['invalid copy type', edited, false, true],
    ])('%s', async (_, lastEditedDatetime, copiedAiPrompt, expectedNew) => {
      const promptData = { aIPromptText: 'Existing prompt', modifiedDatetime: nextEdit };
      if (lastEditedDatetime !== undefined) promptData.lastEditedDatetime = lastEditedDatetime;
      axios.get.mockImplementation(url =>
        Promise.resolve({
          data: url.includes('/copied/') ? { message: copiedAiPrompt } : promptData,
        }),
      );

      await renderPrompt();

      if (expectedNew) {
        expect(screen.getByAltText('new')).toBeInTheDocument();
      } else {
        expect(screen.queryByAltText('new')).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /view and copy current ai prompt/i }),
        ).toBeInTheDocument();
      }
    });

    it.each(['prompt', 'copy'])('waits for both requests when %s finishes first', async first => {
      let resolvePrompt;
      let resolveCopy;
      const promptRequest = new Promise(resolve => {
        resolvePrompt = resolve;
      });
      const copyRequest = new Promise(resolve => {
        resolveCopy = resolve;
      });
      axios.get.mockImplementation(url => (url.includes('/copied/') ? copyRequest : promptRequest));
      await renderPrompt();
      expect(screen.queryByAltText('new')).not.toBeInTheDocument();

      const finishPrompt = () => resolvePrompt({ data: { lastEditedDatetime: edited } });
      const finishCopy = () => resolveCopy({ data: { message: null } });
      await act(async () => {
        (first === 'prompt' ? finishPrompt : finishCopy)();
      });
      expect(screen.queryByAltText('new')).not.toBeInTheDocument();

      await act(async () => {
        (first === 'prompt' ? finishCopy : finishPrompt)();
      });
      expect(screen.getByAltText('new')).toBeInTheDocument();
    });

    it.each(['prompt', 'copy'])('hides NEW when the %s request fails', async failed => {
      axios.get.mockImplementation(url => {
        const isCopy = url.includes('/copied/');
        if (isCopy === (failed === 'copy')) return Promise.reject(new Error('Network failure'));
        return Promise.resolve({
          data: isCopy ? { message: null } : { lastEditedDatetime: edited },
        });
      });
      await renderPrompt();
      expect(screen.queryByAltText('new')).not.toBeInTheDocument();
    });

    it('hides NEW after copying and shows it again after another persisted edit', async () => {
      let lastEditedDatetime = edited;
      let copiedAiPrompt = older;
      let promptText = 'Existing prompt';
      axios.get.mockImplementation(url =>
        Promise.resolve({
          data: url.includes('/copied/')
            ? { message: copiedAiPrompt }
            : { aIPromptText: promptText, lastEditedDatetime },
        }),
      );
      axios.put.mockImplementation((url, body) => {
        if (url.includes('/copied/')) {
          copiedAiPrompt = copied;
        } else {
          promptText = body.aIPromptText;
          lastEditedDatetime = nextEdit;
        }
        return Promise.resolve({ status: 200 });
      });
      await renderPrompt();
      expect(screen.getByAltText('new')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /view and copy new ai prompt/i }));
      await screen.findByText('Existing prompt');
      fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }));

      await waitFor(() => expect(screen.queryByAltText('new')).not.toBeInTheDocument());
      expect(mockWriteText).toHaveBeenCalledWith('Existing prompt');
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/copied/abc123'));

      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Changed prompt' } });
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

      expect(await screen.findByAltText('new')).toBeInTheDocument();
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/dashboard/aiPrompt'), {
        aIPromptText: 'Changed prompt',
      });
    });
  });
});
