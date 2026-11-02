import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import JobFormBuilder from '../JobFormbuilder';
import { ENDPOINTS } from '../../../utils/URL';

vi.mock('axios', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-redux', () => ({
  useDispatch: () => () => true,
  useSelector: selector => selector({ auth: { user: {} }, theme: { darkMode: true } }),
}));
vi.mock('react-router-dom', () => ({
  Prompt: ({ when }) => <span data-testid="navigation-warning">{String(when)}</span>,
}));
vi.mock('../FormPreviewModal', () => ({ default: () => null }));
vi.mock('reactstrap', () => ({ UncontrolledTooltip: () => null }));

const form = {
  forms: [
    {
      _id: 'form-1',
      title: 'Developer',
      questions: [
        { questionText: 'First question', questionType: 'textbox', visible: true },
        { questionText: 'Second question', questionType: 'textbox', visible: true },
      ],
    },
  ],
};
const templates = { templates: [{ _id: 'template-1', name: 'Example', fields: [] }] };
const dirty = () => expect(screen.getByTestId('navigation-warning')).toHaveTextContent('true');
const clean = () => expect(screen.getByTestId('navigation-warning')).toHaveTextContent('false');
async function openBuilder() {
  render(<JobFormBuilder />);
  await waitFor(() => expect(screen.getByPlaceholderText('Enter Field Label')).not.toBeDisabled());
  clean();
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  axios.get
    .mockReset()
    .mockImplementation(url =>
      Promise.resolve({ data: url === ENDPOINTS.GET_ALL_JOB_FORMS ? form : templates }),
    );
  axios.put.mockResolvedValue({ data: {} });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('builder unsaved work protection', () => {
  it('keeps controls disabled until the initial form has loaded', async () => {
    let resolveForm;
    axios.get.mockImplementation(url =>
      url === ENDPOINTS.GET_ALL_JOB_FORMS
        ? new Promise(resolve => {
            resolveForm = resolve;
          })
        : Promise.resolve({ data: templates }),
    );
    render(<JobFormBuilder />);
    expect(screen.getByPlaceholderText('Enter Field Label')).toBeDisabled();
    await act(async () => resolveForm({ data: form }));
    expect(screen.getByPlaceholderText('Enter Field Label')).not.toBeDisabled();
    clean();
  });

  it('requests a native leave warning after Add Field, including the legacy browser signal', async () => {
    await openBuilder();
    fireEvent.change(screen.getByPlaceholderText('Enter Field Label'), {
      target: { value: 'New question' },
    });
    fireEvent.click(screen.getByText('Add Field'));
    const event = new Event('beforeunload', { cancelable: true });
    // A real BeforeUnloadEvent has a string returnValue, unlike a generic Event.
    Object.defineProperty(event, 'returnValue', { value: '', writable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.returnValue).not.toBe('');
  });

  it('removes the native leave warning only after the added field is saved', async () => {
    await openBuilder();
    fireEvent.change(screen.getByPlaceholderText('Enter Field Label'), {
      target: { value: 'New question' },
    });
    fireEvent.click(screen.getByText('Add Field'));
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes');
    fireEvent.click(screen.getByText('Save Form'));
    await waitFor(clean);
    expect(screen.queryByText(/Unsaved changes —/)).not.toBeInTheDocument();
    const event = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(event, 'returnValue', { value: '', writable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.returnValue).toBe('');
  });

  it('tracks template name drafts and clears them when reverted', async () => {
    await openBuilder();
    fireEvent.change(screen.getByLabelText('Template name'), { target: { value: 'Draft' } });
    dirty();
    fireEvent.change(screen.getByLabelText('Template name'), { target: { value: '' } });
    clean();
  });

  it('tracks modal drafts and clears them on cancel', async () => {
    await openBuilder();
    fireEvent.click(screen.getAllByText('Edit')[0]);
    clean();
    fireEvent.change(screen.getByLabelText('Question Label:'), { target: { value: 'Edited' } });
    dirty();
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByText('Cancel'));
    clean();
  });

  it('does not mark imported templates as saved', async () => {
    await openBuilder();
    axios.get.mockResolvedValue({
      data: { template: { fields: [{ questionText: 'Imported', questionType: 'textbox' }] } },
    });
    fireEvent.change(screen.getByLabelText('Select a template'), { target: { value: 'Example' } });
    fireEvent.click(screen.getByText('Clone with Template'));
    await waitFor(dirty);
    fireEvent.click(screen.getByText('Save Form'));
    await waitFor(clean);
  });

  it('keeps appended templates dirty until the form is saved', async () => {
    await openBuilder();
    axios.get.mockResolvedValue({
      data: { template: { fields: [{ questionText: 'Imported', questionType: 'textbox' }] } },
    });
    fireEvent.change(screen.getByLabelText('Select a template'), { target: { value: 'Example' } });
    fireEvent.click(screen.getByText('Append Template'));
    await waitFor(dirty);
  });

  it('keeps an unsubmitted question draft dirty after saving the form', async () => {
    await openBuilder();
    fireEvent.change(screen.getByPlaceholderText('Enter Field Label'), {
      target: { value: 'Draft' },
    });
    fireEvent.click(screen.getByText('Save Form'));
    await waitFor(() => expect(screen.getByText('Save Form')).not.toBeDisabled());
    dirty();
  });

  it('blocks further edits during Save Form and stays clean after success', async () => {
    await openBuilder();
    let resolveSave;
    axios.put.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveSave = resolve;
        }),
    );
    fireEvent.click(screen.getAllByTitle('Move down')[0]);
    dirty();
    fireEvent.click(screen.getByText('Save Form'));
    expect(screen.getByPlaceholderText('Enter Field Label')).toBeDisabled();
    await act(async () => resolveSave({ data: {} }));
    expect(screen.getByPlaceholderText('Enter Field Label')).not.toBeDisabled();
    clean();
  });

  it('preserves unrelated visibility changes after reordering a question', async () => {
    await openBuilder();
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    dirty();
    fireEvent.click(screen.getAllByTitle('Move down')[0]);
    expect(axios.put).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Save Form')).not.toBeDisabled());
    dirty();
  });

  it('shows failed question saves and retains the navigation warning', async () => {
    await openBuilder();
    axios.put.mockRejectedValueOnce(new Error('Offline'));
    fireEvent.click(screen.getAllByTitle('Delete question')[0]);
    fireEvent.click(screen.getByText('Save Form'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to save form'));
    dirty();
  });
});
