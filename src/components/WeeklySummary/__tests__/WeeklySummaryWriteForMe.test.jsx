import React, { useEffect, useRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import httpService from '~/services/httpService';
import { WeeklySummary } from '../WeeklySummary';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('~/services/httpService', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../CurrentPromptModal', () => ({
  __esModule: true,
  default: () => <button type="button">View and Copy Current AI Prompt</button>,
}));

vi.mock('@tinymce/tinymce-react', async () => {
  const ReactModule = await import('react');
  const getText = html =>
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
  return {
    Editor: ({ id, value, onEditorChange, onInit }) => {
      const editorRef = useRef();
      if (!editorRef.current) {
        editorRef.current = {
          id,
          content: value,
          getContent: options =>
            options?.format === 'text'
              ? getText(editorRef.current.content)
              : editorRef.current.content,
          setContent: content => {
            editorRef.current.content = content;
          },
          plugins: {
            wordcount: {
              getCount: () =>
                getText(editorRef.current.content)
                  .split(/\s+/)
                  .filter(Boolean).length,
            },
          },
        };
      }
      editorRef.current.content = value;
      useEffect(() => {
        onInit?.({}, editorRef.current);
      }, [id]);

      return ReactModule.createElement('textarea', {
        'aria-label': `Editor ${id}`,
        value,
        onChange: event => {
          editorRef.current.content = event.target.value;
          onEditorChange(event.target.value, editorRef.current);
        },
      });
    },
  };
});

const mockStore = configureMockStore([]);
const store = mockStore({ theme: { darkMode: false } });
const emptySummaries = {
  weeklySummariesCount: 0,
  mediaUrl: '',
  weeklySummaries: [],
};
const baseProps = {
  currentUser: { userid: 'user-1', firstName: 'Ada' },
  displayUserId: 'user-1',
  getWeeklySummaries: vi.fn().mockResolvedValue(),
  updateWeeklySummaries: vi.fn(),
  loading: false,
  summaries: emptySummaries,
  isNotAllowedToEdit: false,
};

const renderWeeklySummary = (props, summaryRef) =>
  render(
    <Provider store={store}>
      <WeeklySummary ref={summaryRef} {...baseProps} {...props} />
    </Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  httpService.get.mockImplementation(url =>
    Promise.resolve(
      url === ENDPOINTS.AI_PROMPT()
        ? { data: { aIPromptText: 'Current prompt.' } }
        : { data: [{ notes: 'Completed work.' }] },
    ),
  );
  httpService.post.mockResolvedValue({ status: 200, data: { text: 'Generated draft.' } });
});

describe('WeeklySummary Write it for me integration', () => {
  it('shows the optional write button beside the existing prompt viewer for editors', async () => {
    renderWeeklySummary();

    expect(
      (await screen.findAllByRole('button', { name: 'View and Copy Current AI Prompt' })).length,
    ).toBe(4);
    expect(screen.getAllByRole('button', { name: 'Write it for me' })).toHaveLength(4);
  });

  it('does not show the write button when the user cannot edit summaries', async () => {
    renderWeeklySummary({ isNotAllowedToEdit: true });

    expect(
      (await screen.findAllByRole('button', { name: 'View and Copy Current AI Prompt' })).length,
    ).toBe(4);
    expect(screen.queryByRole('button', { name: 'Write it for me' })).not.toBeInTheDocument();
  });

  it('inserts the generated draft into the current TinyMCE field and preserves validation updates', async () => {
    const summaryRef = React.createRef();
    renderWeeklySummary({}, summaryRef);
    const editor = await screen.findByLabelText('Editor summary');
    fireEvent.click(screen.getAllByRole('button', { name: 'Write it for me' })[0]);
    await screen.findByDisplayValue('Generated draft.');

    fireEvent.click(screen.getByRole('button', { name: 'Use draft in summary' }));

    await waitFor(() => expect(editor.value).toContain('<p>Generated draft.</p>'));
    expect(summaryRef.current.state.errors.summary).toBeDefined();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('requires confirmation before replacing existing editor text and honors cancellation', async () => {
    const existing = 'Existing summary text that must not be lost.';
    renderWeeklySummary({
      summaries: {
        ...emptySummaries,
        weeklySummaries: [{ summary: existing }],
      },
    });
    const editor = await screen.findByLabelText('Editor summary');
    fireEvent.click(screen.getAllByRole('button', { name: 'Write it for me' })[0]);
    await screen.findByDisplayValue('Generated draft.');
    fireEvent.click(screen.getByRole('button', { name: 'Use draft in summary' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/replacing it will remove that text/i);
    expect(screen.getByRole('button', { name: 'Replace summary' })).toBeInTheDocument();
    expect(editor.value).toBe(existing);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep existing text' }));
    expect(editor.value).toBe(existing);
    fireEvent.click(screen.getByRole('button', { name: 'Use draft in summary' }));
    fireEvent.click(screen.getByRole('button', { name: 'Replace summary' }));
    await waitFor(() => expect(editor.value).toContain('<p>Generated draft.</p>'));
  });
});
