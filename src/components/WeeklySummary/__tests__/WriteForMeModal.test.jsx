import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import WriteForMeModal from '../WriteForMeModal';

vi.mock('~/services/httpService', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockStore = configureMockStore([]);
const notesResponse = {
  data: [{ notes: '<p>Built feature X. <a href="https://example.com">details</a></p>' }],
};

const renderModal = ({ darkMode = false, ...props } = {}) =>
  render(
    <Provider
      store={mockStore({
        userProfile: { _id: 'user-1', firstName: 'Ada' },
        theme: { darkMode },
      })}
    >
      <WriteForMeModal userId="user-1" firstName="Ada" pasteResponse={vi.fn()} {...props} />
    </Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WriteForMeModal', () => {
  it('fetches the latest prompt and weekly notes, then sends their combined text', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT()
          ? { data: { aIPromptText: 'Use the current summary instructions.' } }
          : notesResponse,
      ),
    );
    httpService.post.mockResolvedValue({ status: 200, data: { text: 'A generated draft.' } });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByDisplayValue('A generated draft.')).toBeInTheDocument();
    expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.AI_PROMPT());
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringMatching(/TimeEntry\/user\/user-1\//),
    );
    expect(httpService.post).toHaveBeenCalledWith(ENDPOINTS.INTERACT_WITH_GPT, {
      prompt: 'Use the current summary instructions.\n\nBuilt feature X. details',
      userid: 'user-1',
      firstName: 'Ada',
    });
  });

  it('uses the default prompt only when fetching the current prompt fails', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? Promise.reject(new Error('offline')) : notesResponse,
      ),
    );
    httpService.post.mockResolvedValue({ status: 200, data: { text: 'Draft from fallback.' } });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByDisplayValue('Draft from fallback.')).toBeInTheDocument();
    expect(httpService.post.mock.calls[0][1].prompt).toContain('Please edit the following summary');
    expect(httpService.post.mock.calls[0][1].prompt).toContain('Built feature X. details');
  });

  it('shows a clear message and skips generation when there are no time-entry notes', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? { data: { aIPromptText: 'Prompt' } } : { data: [] },
      ),
    );

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByText(/no time entries with notes were found/i)).toBeInTheDocument();
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('shows loading while requests are pending and does not reopen after the user closes the modal', async () => {
    let finishPromptRequest;
    httpService.get.mockImplementation(url =>
      url !== ENDPOINTS.AI_PROMPT()
        ? Promise.resolve(notesResponse)
        : new Promise(resolve => {
            finishPromptRequest = resolve;
          }),
    );

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/generating/i);

    fireEvent.click(screen.getByText('Close'));
    finishPromptRequest({ data: { aIPromptText: 'Prompt' } });

    await waitFor(() => expect(httpService.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the backend error message and keeps generation recoverable', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? { data: { aIPromptText: 'Prompt' } } : notesResponse,
      ),
    );
    httpService.post.mockRejectedValue({
      response: { data: { message: 'AI service unavailable.' } },
    });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('AI service unavailable.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('surfaces error messages returned in a non-success HTTP response', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? { data: { aIPromptText: 'Prompt' } } : notesResponse,
      ),
    );
    httpService.post.mockResolvedValue({
      status: 503,
      data: { message: 'Generation is temporarily unavailable.' },
    });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Generation is temporarily unavailable.',
    );
  });

  it('copies the generated text and applies it only after an explicit click', async () => {
    const pasteResponse = vi.fn(() => true);
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? { data: { aIPromptText: 'Prompt' } } : notesResponse,
      ),
    );
    httpService.post.mockResolvedValue({ status: 200, data: { text: 'Review this draft.' } });

    renderModal({ pasteResponse });
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));
    await screen.findByDisplayValue('Review this draft.');

    expect(pasteResponse).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Copy draft' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Review this draft.'));

    fireEvent.click(screen.getByRole('button', { name: 'Use draft in summary' }));
    expect(pasteResponse).toHaveBeenCalledWith('Review this draft.', false);
  });

  it('applies dark-mode styles to its button, modal, and editable draft', async () => {
    httpService.get.mockImplementation(url =>
      Promise.resolve(
        url === ENDPOINTS.AI_PROMPT() ? { data: { aIPromptText: 'Prompt' } } : notesResponse,
      ),
    );
    httpService.post.mockResolvedValue({ status: 200, data: { text: 'Dark draft.' } });

    renderModal({ darkMode: true });
    fireEvent.click(screen.getByRole('button', { name: /write it for me/i }));

    expect(await screen.findByDisplayValue('Dark draft.')).toHaveClass(
      'bg-space-cadet',
      'text-light',
    );
    expect(screen.getByRole('dialog')).toHaveClass('text-light', 'dark-mode');
  });
});
