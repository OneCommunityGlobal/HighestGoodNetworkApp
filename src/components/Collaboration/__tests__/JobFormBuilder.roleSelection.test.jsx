import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import JobFormBuilder from '../JobFormbuilder';
import { ENDPOINTS } from '../../../utils/URL';

const templateCallbacks = vi.hoisted(() => []);
vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../QuestionSetManager', () => ({
  default: ({ onImportQuestions }) => {
    templateCallbacks.push(onImportQuestions);
    return (
      <button
        type="button"
        onClick={() =>
          onImportQuestions([{ questionText: 'Imported question', questionType: 'textbox' }])
        }
      >
        Import test template
      </button>
    );
  },
}));
vi.mock('../QuestionEditModal', () => ({
  default: ({ onSave }) => (
    <button type="button" onClick={() => onSave({ label: 'Edited question', type: 'textbox' })}>
      Confirm question edit
    </button>
  ),
}));

const electrical = {
  _id: 'electrical-id',
  title: '4-DOME CLUSTER ELECTRICAL DESIGN',
  questions: [{ questionText: 'Electrical question', questionType: 'textbox' }],
};
const software = {
  _id: 'software-id',
  title: 'SEEKING SOFTWARE POSITION',
  questions: Array.from({ length: 12 }, (_, i) => ({
    questionText: `Software question ${i + 1}`,
    questionType: 'textbox',
  })),
};
const general = {
  _id: 'general-id',
  title: 'GENERAL',
  questions: [
    { questionText: 'General question', questionType: 'textbox' },
    { questionText: 'General second question', questionType: 'textbox' },
  ],
};
let catalog;
let details;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function mount({ darkMode = false, allowed = true } = {}) {
  const store = {
    getState: () => ({
      theme: { darkMode },
      auth: { user: { userid: 'owner-id', role: 'Owner' } },
      role: { roles: [] },
    }),
    subscribe: () => () => {},
    dispatch: vi.fn(() => allowed),
  };
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JobFormBuilder />
      </MemoryRouter>
    </Provider>,
  );
}
async function ready(title = electrical.title) {
  await screen.findByText(`Editing questionnaire for: ${title}`);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Form' })).toBeEnabled());
}
function select(title) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Job role' }), {
    target: { value: title },
  });
}
function search(text) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Search job roles' }), {
    target: { value: text },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Find a job role' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  templateCallbacks.length = 0;
  catalog = [electrical, software, general];
  details = new Map(catalog.map(form => [ENDPOINTS.GET_JOB_FORM(form._id), form]));
  axios.get.mockImplementation(async url => {
    if (url === ENDPOINTS.GET_ALL_JOB_FORMS) return { data: { forms: catalog } };
    if (details.has(url)) return { data: { form: details.get(url) } };
    throw new Error('Unexpected read');
  });
  for (const method of ['post', 'put', 'patch', 'delete'])
    axios[method].mockResolvedValue({ data: {} });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('job role and questionnaire binding', () => {
  it('regression: dropdown selection replaces the previous questionnaire', async () => {
    mount();
    await screen.findByText('1.) Electrical question');
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: software.title } });
    await screen.findByText('1.) Software question 1');
    expect(screen.queryByText('1.) Electrical question')).not.toBeInTheDocument();
  });

  it('regression: Go searches for and loads the role questionnaire', async () => {
    mount();
    await screen.findByText('1.) Electrical question');
    fireEvent.change(screen.getByPlaceholderText('Enter Job Title'), {
      target: { value: 'SOFTWARE' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    await screen.findByText('1.) Software question 1');
    expect(screen.queryByText('1.) Electrical question')).not.toBeInTheDocument();
  });
  it.each([false, true])(
    'loads fresh questions for the initial role and every dropdown change, darkMode=%s',
    async darkMode => {
      catalog = [
        { ...electrical, questions: [{ questionText: 'Stale catalog question' }] },
        software,
        general,
      ];
      mount({ darkMode });
      await ready();
      expect(screen.getByText(/1\.\) Electrical question/)).toBeInTheDocument();
      expect(screen.queryByText(/Stale catalog question/)).not.toBeInTheDocument();
      select(software.title);
      await ready(software.title);
      expect(screen.getAllByText(/\d+\.\) Software question/)).toHaveLength(12);
      expect(screen.queryByText(/Electrical question/)).not.toBeInTheDocument();
      select(general.title);
      await ready(general.title);
      select(software.title);
      await ready(software.title);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM(software._id));
      expect(axios.put).not.toHaveBeenCalled();
    },
  );

  it('loads the unique role matching a case-insensitive search or Go submission', async () => {
    mount();
    await ready();
    search('  software  ');
    await ready(software.title);
    expect(screen.getByRole('combobox', { name: 'Job role' })).toHaveValue(software.title);
    expect(screen.getAllByText(/\d+\.\) Software question/)).toHaveLength(12);
  });

  it.each(['ENGINEER', '[.*]'])(
    'does not guess a role for ambiguous or unmatched search %s',
    async query => {
      mount();
      await ready();
      const calls = axios.get.mock.calls.length;
      search(query);
      expect(screen.getByRole('alert')).toHaveTextContent(
        query === 'ENGINEER' ? 'Several roles match' : 'No matching job role',
      );
      expect(axios.get).toHaveBeenCalledTimes(calls);
      expect(screen.getByRole('combobox', { name: 'Job role' })).toHaveValue(electrical.title);
    },
  );

  it('includes newly configured roles that are absent from the static role list', async () => {
    const newRole = { ...general, _id: 'new-id', title: 'NEW SPECIALIST ROLE' };
    catalog.push(newRole);
    details.set(ENDPOINTS.GET_JOB_FORM(newRole._id), newRole);
    mount();
    await ready();
    search('new specialist');
    await ready(newRole.title);
    expect(screen.getByRole('combobox', { name: 'Job role' })).toHaveValue(newRole.title);
  });

  it('clears the previous questionnaire and disables all edits while another role loads', async () => {
    mount();
    await ready();
    const request = deferred();
    axios.get.mockImplementation(url =>
      url === ENDPOINTS.GET_JOB_FORM(software._id)
        ? request.promise
        : Promise.resolve({ data: { form: general } }),
    );
    select(software.title);
    expect(screen.queryByText(/Electrical question/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add Field' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import test template' })).toBeDisabled();
    await act(async () => request.resolve({ data: { form: software } }));
    await ready(software.title);
  });

  it.each(['success', 'failure'])(
    'ignores an obsolete role response or error: %s',
    async result => {
      mount();
      await ready();
      const old = deferred();
      axios.get.mockImplementation(url =>
        url === ENDPOINTS.GET_JOB_FORM(software._id)
          ? old.promise
          : Promise.resolve({ data: { form: general } }),
      );
      select(software.title);
      select(general.title);
      await ready(general.title);
      await act(async () =>
        result === 'success'
          ? old.resolve({ data: { form: software } })
          : old.reject(new Error('old request failed')),
      );
      expect(screen.getByText(`Editing questionnaire for: ${general.title}`)).toBeInTheDocument();
      expect(screen.queryByText(/Software question/)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('keeps saving disabled on a failed role load and supports retry', async () => {
    mount();
    await ready();
    axios.get.mockRejectedValueOnce(new Error('offline'));
    select(software.title);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
    expect(screen.queryByText(/Electrical question/)).not.toBeInTheDocument();
    select(software.title);
    await ready(software.title);
  });

  it.each([
    { ...software, _id: general._id },
    { ...software, title: general.title },
    { ...software, questions: null },
    { ...software, isActive: false },
  ])('rejects mismatched or malformed form details %#', async detail => {
    details.set(ENDPOINTS.GET_JOB_FORM(software._id), detail);
    mount();
    await ready();
    select(software.title);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('does not reuse generic questions when a role has no saved form', async () => {
    mount();
    await ready();
    select('MASTER CARPENTER');
    await screen.findByText(/No saved questionnaire is available for MASTER CARPENTER/);
    expect(screen.queryByText(/Electrical question/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM('MASTER CARPENTER'));
  });

  it('does not choose silently between duplicate saved role names', async () => {
    catalog.push({ ...software, _id: 'duplicate-id' });
    mount();
    await ready();
    select(software.title);
    await screen.findByText(/Several saved forms/);
    expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM(software._id));
  });

  it('supports an explicitly empty saved question set', async () => {
    details.set(ENDPOINTS.GET_JOB_FORM(software._id), { ...software, questions: [] });
    mount();
    await ready();
    select(software.title);
    await ready(software.title);
    expect(screen.queryByText(/Electrical question/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        ENDPOINTS.UPDATE_JOB_FORM,
        expect.objectContaining({ formId: software._id, questions: [] }),
      ),
    );
  });

  it('allows retrying a failed catalog load', async () => {
    axios.get.mockRejectedValueOnce(new Error('offline'));
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry loading roles' }));
    await ready();
  });

  it('excludes inactive and retired forms from initial loading', async () => {
    catalog.unshift(
      { ...general, _id: 'inactive-id', isActive: false },
      { ...general, _id: 'retired-id', title: '[RETIRED] OLD FORM' },
    );
    mount();
    await ready();
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM('inactive-id'));
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM('retired-id'));
  });

  it('does not fetch or expose editor controls without management permission', async () => {
    mount({ allowed: false });
    await screen.findByText('Access restricted');
    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Save Form' })).not.toBeInTheDocument();
  });

  it.each([[], { forms: 'invalid catalog' }])(
    'keeps the editor disabled for empty or malformed catalogs %#',
    async data => {
      axios.get.mockResolvedValueOnce({ data });
      mount();
      await screen.findByRole('alert');
      expect(screen.getByRole('button', { name: 'Save Form' })).toBeDisabled();
      expect(axios.put).not.toHaveBeenCalled();
    },
  );
});

describe('saving only to the loaded role', () => {
  it('asks before replacing the selected questionnaire and sends its exact ID, title and questions', async () => {
    mount();
    await ready();
    select(software.title);
    await ready(software.title);
    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    expect(axios.put).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    expect(window.confirm).toHaveBeenLastCalledWith(expect.stringContaining(software.title));
    expect(axios.put.mock.calls[0][1]).toMatchObject({
      formId: software._id,
      title: software.title,
      requestor: { requestorId: 'owner-id', role: 'Owner' },
    });
    expect(axios.put.mock.calls[0][1].questions).toHaveLength(12);
    expect(axios.put.mock.calls[0][1]).not.toHaveProperty('description');
  });

  it('keeps draft changes when a role switch is cancelled and clears them on a confirmed switch', async () => {
    mount();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Import test template' }));
    await screen.findByText(/Imported question/);
    window.confirm.mockReturnValueOnce(false);
    select(software.title);
    expect(screen.getByRole('combobox', { name: 'Job role' })).toHaveValue(electrical.title);
    expect(screen.getByText(/Imported question/)).toBeInTheDocument();
    select(software.title);
    await ready(software.title);
    expect(screen.queryByText(/Imported question/)).not.toBeInTheDocument();
  });

  it('ignores a delayed template import from the previous role', async () => {
    mount();
    await ready();
    const previousImport = templateCallbacks.at(-1);
    select(software.title);
    await ready(software.title);
    act(() => previousImport([{ questionText: 'Old role template', questionType: 'textbox' }]));
    expect(screen.queryByText(/Old role template/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/\d+\.\) Software question/)).toHaveLength(12);
  });

  it('blocks role switching and duplicate saves until the current save finishes', async () => {
    mount();
    await ready();
    const save = deferred();
    axios.put.mockReturnValueOnce(save.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    expect(screen.getByRole('combobox', { name: 'Job role' })).toBeDisabled();
    select(software.title);
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.GET_JOB_FORM(software._id));
    await act(async () => save.resolve({ data: {} }));
    await ready();
  });

  it('preserves the selected role and questions after a failed save', async () => {
    mount();
    await ready();
    select(software.title);
    await ready(software.title);
    axios.put.mockRejectedValueOnce(new Error('offline'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Form' }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to save form. Please try again.'),
    );
    await ready(software.title);
    expect(screen.getAllByText(/\d+\.\) Software question/)).toHaveLength(12);
  });

  it('sends question edits with PATCH to the currently loaded form', async () => {
    mount();
    await ready();
    select(software.title);
    await ready(software.title);
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm question edit' }));
    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        ENDPOINTS.UPDATE_QUESTION(software._id, 0),
        expect.objectContaining({ questionText: 'Edited question' }),
      ),
    );
  });

  it.each(['delete', 'reorder', 'add'])(
    'binds the %s question action to the loaded role',
    async action => {
      mount();
      await ready();
      select(general.title);
      await ready(general.title);
      if (action === 'delete') {
        fireEvent.click(screen.getAllByTitle('Delete question')[0]);
        await waitFor(() =>
          expect(axios.delete).toHaveBeenCalledWith(
            ENDPOINTS.DELETE_QUESTION(general._id, 0),
            expect.objectContaining({
              data: { requestor: { requestorId: 'owner-id', role: 'Owner' } },
            }),
          ),
        );
      } else if (action === 'reorder') {
        fireEvent.click(screen.getAllByTitle('Move down')[0]);
        await waitFor(() =>
          expect(axios.put).toHaveBeenCalledWith(
            ENDPOINTS.REORDER_QUESTIONS(general._id),
            expect.objectContaining({ fromIndex: 0, toIndex: 1 }),
          ),
        );
      } else {
        fireEvent.change(screen.getByLabelText('Field Label:'), {
          target: { value: 'Added question' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Add Field' }));
        await waitFor(() =>
          expect(axios.post).toHaveBeenCalledWith(
            ENDPOINTS.ADD_QUESTION(general._id),
            expect.objectContaining({
              question: expect.objectContaining({ questionText: 'Added question' }),
            }),
          ),
        );
      }
      await ready(general.title);
    },
  );

  it('retains the unsaved-change warning after editing an imported draft question', async () => {
    mount();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Import test template' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm question edit' }));
    await waitFor(() => expect(axios.patch).toHaveBeenCalled());
    await ready();
    window.confirm.mockReturnValueOnce(false);
    select(software.title);
    expect(window.confirm).toHaveBeenLastCalledWith(
      'Discard unsaved changes and switch job roles?',
    );
    expect(screen.getByRole('combobox', { name: 'Job role' })).toHaveValue(electrical.title);
  });
});
