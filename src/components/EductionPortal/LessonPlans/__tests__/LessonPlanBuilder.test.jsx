import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { vi } from 'vitest';
import LessonPlanBuilder from '../LessonPlanBuilder';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(selector =>
    selector({
      auth: { user: { role: 'Educator' } },
    }),
  ),
}));

vi.mock('react-toastify', () => ({
  toast: { info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));

const field = (name, row = 1) => screen.getByLabelText(`Subtask ${row} ${name}`);
const change = (name, value, row = 1) => fireEvent.change(field(name, row), { target: { value } });
const click = name => fireEvent.click(screen.getByRole('button', { name }));
const assignments = () => fetch.mock.calls.filter(([url]) => url.endsWith('/assign-tasks'));

const subtaskId = index => String(index + 1).padStart(24, '0');
const savedResponse = (options, id = 'saved-plan') => ({
  _id: id,
  subTasks: JSON.parse(options.body).subTasks.map((row, index) => ({
    ...row,
    _id: row._id || subtaskId(index),
  })),
});

beforeEach(() => {
  // All requests are mocked: tests must never assign tasks against a running backend.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => ({
      ok: true,
      json: async () =>
        url.includes('/lesson-plans')
          ? savedResponse(options)
          : options?.method === 'POST'
          ? { assignedCount: 3, skippedCount: 0 }
          : [],
    })),
  );
  localStorage.setItem('token', 'test-token');
});

const renderBuilder = async () => {
  render(<LessonPlanBuilder />);
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Research' } });
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2030-01-01' } });
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2030-02-01' } });
  screen.getAllByLabelText(/due date$/).forEach(input => {
    fireEvent.change(input, { target: { value: input.min } });
  });
};

const savePlan = async () => {
  click('Save Lesson Plan');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeEnabled(),
  );
  vi.mocked(fetch).mockClear();
};

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('required subtask validation', () => {
  it('hides manual assignment actions from non-educator roles', async () => {
    vi.mocked(useSelector).mockImplementation(selector =>
      selector({ auth: { user: { role: 'Student' } } }),
    );
    await renderBuilder();
    expect(
      screen.queryByRole('button', { name: 'Assign Tasks to Students' }),
    ).not.toBeInTheDocument();
    vi.mocked(useSelector).mockImplementation(selector =>
      selector({ auth: { user: { role: 'Educator' } } }),
    );
  });

  it('rejects whitespace names immediately and enables actions after correction', async () => {
    await renderBuilder();
    change('name', '   ');
    expect(field('name')).toHaveValue('   ');
    expect(field('name')).toHaveDescription('Subtask name is required.');
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    change('name', 'Research');
    expect(field('name')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
  });

  it.each(['Write-only', 'Read-only', 'Offline entry'])('accepts supported type %s', async type => {
    await renderBuilder();
    change('type', type);
    expect(field('type')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled();
  });

  it('validates new and duplicated rows after interaction and clears errors on deletion', async () => {
    await renderBuilder();
    click('Add subtask +');
    ['name', 'due date', 'pass mark', 'weight'].forEach(name => {
      expect(field(name, 4)).toHaveAttribute('aria-invalid', 'false');
      fireEvent.blur(field(name, 4));
      expect(field(name, 4)).toHaveAttribute('aria-invalid', 'true');
      expect(field(name, 4)).toHaveDescription(/required/);
    });
    change('type', '', 4);
    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[3]);
    ['name', 'type', 'due date', 'pass mark', 'weight'].forEach(name => {
      fireEvent.blur(field(name, 5));
      expect(field(name, 5)).toHaveAttribute('aria-invalid', 'true');
    });
    // The existing icon-only delete controls have no accessible name.
    fireEvent.click(screen.getAllByRole('button', { name: '' })[4]);
    fireEvent.click(screen.getAllByRole('button', { name: '' })[3]);
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it.each(['name', 'type', 'due date', 'weight', 'pass mark'])(
    'immediately flags cleared %s and disables Save and Assign',
    async name => {
      await renderBuilder();
      change(name, '');
      expect(field(name)).toHaveValue('');
      expect(field(name)).toHaveAttribute('aria-invalid', 'true');
      expect(field(name)).toHaveDescription(/required/);
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
      click('Save Lesson Plan');
      expect(field(name)).toHaveAttribute('aria-invalid', 'true');
      click('Assign Tasks to Students');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(assignments()).toHaveLength(0);
    },
  );

  it('shows the compact invalid input message for all validated fields', async () => {
    await renderBuilder();
    change('name', '');
    change('type', '');
    change('due date', '');
    change('weight', '');
    change('pass mark', '');

    expect(screen.getAllByText('Invalid input')).toHaveLength(5);
    ['name', 'type', 'due date', 'weight', 'pass mark'].forEach(name => {
      expect(field(name)).toHaveAttribute('aria-invalid', 'true');
      expect(field(name)).toHaveDescription(/required/);
    });
  });

  it('places Total immediately after the subtasks without placeholder rows', async () => {
    await renderBuilder();
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(rows[4]).toHaveTextContent('Total');
  });

  it('renders Add subtask and assignment actions in the same action row', async () => {
    await renderBuilder();
    const actionRow = screen.getByRole('group', { name: 'Lesson plan actions' });
    expect(within(actionRow).getByRole('button', { name: 'Add subtask +' })).toBeInTheDocument();
    expect(
      within(actionRow).getByRole('button', { name: 'Assign Tasks to Students' }),
    ).toBeInTheDocument();
  });

  it.each(['abc', '40abc', '-1', '101', '40%%', '1e2', ' '])(
    'rejects invalid weight %j',
    async value => {
      await renderBuilder();
      change('weight', value);
      expect(field('weight')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
      click('Save Lesson Plan');
      click('Assign Tasks to Students');
      expect(field('weight')).toHaveValue(value);
      expect(field('weight')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(assignments()).toHaveLength(0);
    },
  );

  it.each(['abc', '8/a', '-1/10', '1/-10', '1/0', '11/10', '8.5', '8/', '8/10/2'])(
    'rejects invalid pass mark %j',
    async value => {
      await renderBuilder();
      change('pass mark', value);
      expect(field('pass mark')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
      click('Save Lesson Plan');
      click('Assign Tasks to Students');
      expect(field('pass mark')).toHaveValue(value);
      expect(field('pass mark')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(assignments()).toHaveLength(0);
    },
  );

  it('shows all required errors across existing, duplicated, and new rows', async () => {
    await renderBuilder();
    change('weight', '');
    change('pass mark', '');
    change('due date', '');
    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]);
    click('Add subtask +');
    click('Save Lesson Plan');
    [1, 4, 5].forEach(row => {
      ['weight', 'pass mark', 'due date'].forEach(name => {
        expect(field(name, row)).toHaveAttribute('aria-invalid', 'true');
        expect(field(name, row)).toHaveDescription(/required/);
      });
    });
    click('Assign Tasks to Students');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(assignments()).toHaveLength(0);
  });

  it('continues to reject past due dates', async () => {
    await renderBuilder();
    change('due date', '2000-01-01');
    click('Save Lesson Plan');
    click('Assign Tasks to Students');
    expect(screen.getByText('Due date must be today or later.')).toBeInTheDocument();
    expect(assignments()).toHaveLength(0);
  });

  it.each(['0', '100%', '40', '20.5%'])(
    'allows valid weight %s and fraction through Save validation',
    async value => {
      await renderBuilder();
      change('weight', value);
      change('pass mark', '0/10');
      click('Save Lesson Plan');
      await waitFor(() => expect(assignments()).toHaveLength(1));
      expect(JSON.parse(assignments()[0][1].body).isAutoAssigned).toBe(true);
    },
  );

  it('allows a valid manual confirmation', async () => {
    await renderBuilder();
    change('pass mark', '10/10');
    await savePlan();
    click('Assign Tasks to Students');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    expect(
      screen.getByText('This will assign tasks to all eligible students. Do you want to proceed?'),
    ).toBeInTheDocument();
    expect(assignments()).toHaveLength(0);
    click('Confirm');
    await waitFor(() => expect(assignments()).toHaveLength(1));
    expect(JSON.parse(assignments()[0][1].body).isAutoAssigned).toBe(false);
  });

  it('shows the assigned count after complete success', async () => {
    await renderBuilder();
    await savePlan();
    vi.mocked(fetch).mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ assignedCount: 24, skippedCount: 0 }),
    }));
    click('Assign Tasks to Students');
    click('Confirm');
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('24 tasks assigned successfully.'),
    );
  });

  it('shows assigned and skipped counts after partial success', async () => {
    await renderBuilder();
    await savePlan();
    vi.mocked(fetch).mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({ assignedCount: 24, skippedCount: 5 }),
    }));
    click('Assign Tasks to Students');
    click('Confirm');
    await waitFor(() =>
      expect(toast.warn).toHaveBeenCalledWith(
        '24 tasks assigned, 5 skipped due to unmet prerequisites.',
      ),
    );
  });

  it('shows an error notification when assignment fails', async () => {
    await renderBuilder();
    await savePlan();
    vi.mocked(fetch).mockImplementationOnce(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));
    click('Assign Tasks to Students');
    click('Confirm');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Task assignment failed. Internal Server Error (500)',
      ),
    );
  });

  it('cancels manual assignment without sending an API request', async () => {
    await renderBuilder();
    await savePlan();
    click('Assign Tasks to Students');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    click('Cancel');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(assignments()).toHaveLength(0);
  });

  it.each(['name', 'type', 'weight', 'pass mark', 'due date'])(
    'revalidates %s at confirmation',
    async name => {
      await renderBuilder();
      await savePlan();
      click('Assign Tasks to Students');
      // Exercise the final guard even if row state changes after the modal opens.
      change(name, '');
      click('Confirm');
      expect(field(name)).toHaveAttribute('aria-invalid', 'true');
      expect(assignments()).toHaveLength(0);
    },
  );
});

describe('lesson plan persistence', () => {
  it('creates a plan before automatic assignment and patches subsequent saves', async () => {
    await renderBuilder();
    expect(fetch).not.toHaveBeenCalled();
    click('Save Lesson Plan');
    await waitFor(() => expect(assignments()).toHaveLength(1));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/educator\/lesson-plans$/);
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      title: 'Research',
      startDate: '2030-01-01',
      endDate: '2030-02-01',
    });
    expect(Object.keys(body).sort()).toEqual([
      'description',
      'endDate',
      'startDate',
      'subTasks',
      'theme',
      'title',
    ]);
    expect(Object.keys(body.subTasks[0]).sort()).toEqual([
      'dueDate',
      'name',
      'passMark',
      'type',
      'weight',
    ]);
    expect(JSON.parse(assignments()[0][1].body)).toMatchObject({
      lessonPlanId: 'saved-plan',
      isAutoAssigned: true,
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled(),
    );
    change('weight', '35%');
    click('Save Lesson Plan');
    await waitFor(() => expect(assignments()).toHaveLength(2));
    expect(fetch.mock.calls.find(([, opts]) => opts?.method === 'PATCH')[0]).toMatch(
      /lesson-plans\/saved-plan$/,
    );
  });

  it('never assigns when saving fails', async () => {
    await renderBuilder();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Save unavailable' }),
    });
    click('Save Lesson Plan');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Lesson plan save failed. Save unavailable'),
    );
    expect(assignments()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
  });

  it('retains the saved ID when automatic assignment fails and permits manual retry', async () => {
    await renderBuilder();
    vi.mocked(fetch).mockImplementation(async (url, options) => ({
      ok: !url.endsWith('/assign-tasks'),
      status: 500,
      statusText: 'Unavailable',
      json: async () =>
        url.includes('/lesson-plans') ? savedResponse(options, 'retained-id') : [],
    }));
    click('Save Lesson Plan');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Task assignment failed. Unavailable (500)'),
    );
    expect(toast.success).toHaveBeenCalledWith('Lesson plan saved successfully.');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeEnabled(),
    );
    click('Assign Tasks to Students');
    click('Confirm');
    await waitFor(() => expect(assignments()).toHaveLength(2));
    expect(JSON.parse(assignments()[1][1].body)).toMatchObject({
      lessonPlanId: 'retained-id',
      isAutoAssigned: false,
    });
  });

  it('blocks manual assignment for unsaved and modified subtasks', async () => {
    await renderBuilder();
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
    await savePlan();
    change('name', 'Changed');
    click('Assign Tasks to Students');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(assignments()).toHaveLength(0);
  });

  it('blocks missing metadata, reversed dates and zero subtasks', async () => {
    await renderBuilder();
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: ' ' } });
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Plan' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2029-01-01' } });
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2030-01-01' } });
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled();
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('guards duplicate saves while persistence is pending', async () => {
    await renderBuilder();
    let resolveSave;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveSave = resolve;
        }),
    );
    click('Save Lesson Plan');
    click('Save Lesson Plan');
    expect(fetch).toHaveBeenCalledTimes(1);
    resolveSave({ ok: true, json: async () => savedResponse(fetch.mock.calls[0][1]) });
    await waitFor(() => expect(assignments()).toHaveLength(1));
  });
});

it.each(['Manager', 'Student'])('does not allow %s to save', async role => {
  vi.mocked(useSelector).mockImplementation(selector => selector({ auth: { user: { role } } }));
  await renderBuilder();
  expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
  click('Save Lesson Plan');
  expect(fetch).not.toHaveBeenCalled();
  vi.mocked(useSelector).mockImplementation(selector =>
    selector({ auth: { user: { role: 'Educator' } } }),
  );
});

it('blocks a valid but changed subtask at manual confirmation', async () => {
  await renderBuilder();
  await savePlan();
  click('Assign Tasks to Students');
  change('weight', '25%');
  click('Confirm');
  expect(assignments()).toHaveLength(0);
});

describe('validation visibility', () => {
  it('renders no errors initially while invalid Save and Assign remain disabled', () => {
    render(<LessonPlanBuilder />);
    expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
    expect(screen.queryByText(/required\./)).not.toBeInTheDocument();
    expect(field('due date')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reveals only the interacted field and clears its error when corrected', () => {
    render(<LessonPlanBuilder />);
    fireEvent.blur(field('due date'));
    expect(field('due date')).toHaveAttribute('aria-invalid', 'true');
    expect(field('due date')).toHaveDescription('A due date is required.');
    expect(field('due date', 2)).toHaveAttribute('aria-invalid', 'false');
    change('due date', field('due date').min);
    expect(field('due date')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
    fireEvent.blur(screen.getByLabelText('Title'));
    expect(screen.getByLabelText('Title')).toHaveDescription('Title is required.');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Plan' } });
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'false');
  });

  it.each(['Save Lesson Plan', 'Assign Tasks to Students'])(
    'reveals errors after attempting disabled %s',
    action => {
      render(<LessonPlanBuilder />);
      fireEvent.pointerDown(screen.getByRole('button', { name: action }));
      [1, 2, 3].forEach(row =>
        expect(field('due date', row)).toHaveDescription('A due date is required.'),
      );
      expect(screen.getByLabelText('Title')).toHaveDescription('Title is required.');
      expect(screen.getByRole('button', { name: action })).toBeDisabled();
      expect(fetch).not.toHaveBeenCalled();
      change('due date', field('due date').min);
      expect(field('due date')).toHaveAttribute('aria-invalid', 'false');
    },
  );
});

describe('stable subtask IDs', () => {
  const saves = () => fetch.mock.calls.filter(([url]) => url.includes('/lesson-plans'));
  const saveAndWait = async () => {
    click('Save Lesson Plan');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled(),
    );
  };

  it('retains returned IDs for repeated saves and edits', async () => {
    await renderBuilder();
    await saveAndWait();
    expect(JSON.parse(saves()[0][1].body).subTasks.every(row => !row._id)).toBe(true);
    await saveAndWait();
    expect(JSON.parse(saves()[1][1].body).subTasks.map(row => row._id)).toEqual([
      subtaskId(0),
      subtaskId(1),
      subtaskId(2),
    ]);
    change('name', 'Edited title');
    await saveAndWait();
    expect(JSON.parse(saves()[2][1].body).subTasks[0]).toMatchObject({
      _id: subtaskId(0),
      name: 'Edited title',
    });
    expect(assignments()).toHaveLength(3);
  });

  it('omits IDs for new and duplicated rows, then retains their returned IDs', async () => {
    await renderBuilder();
    await saveAndWait();
    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]);
    click('Add subtask +');
    change('name', 'New task', 5);
    change('due date', field('due date', 5).min, 5);
    change('pass mark', '8/10', 5);
    change('weight', '10%', 5);
    await saveAndWait();
    const submitted = JSON.parse(saves()[1][1].body).subTasks;
    expect(submitted[0]._id).toBe(subtaskId(0));
    expect(submitted[3]).not.toHaveProperty('_id');
    expect(submitted[4]).not.toHaveProperty('_id');
    await saveAndWait();
    expect(JSON.parse(saves()[2][1].body).subTasks.map(row => row._id)).toEqual([
      subtaskId(0),
      subtaskId(1),
      subtaskId(2),
      subtaskId(3),
      subtaskId(4),
    ]);
  });

  it('keeps IDs on the correct rows when edits and deletion occur during saving', async () => {
    await renderBuilder();
    let resolveSave;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveSave = resolve;
        }),
    );
    click('Save Lesson Plan');
    const response = savedResponse(saves()[0][1]);
    change('name', 'Edited while saving', 2);
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    resolveSave({ ok: true, json: async () => response });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeEnabled(),
    );
    expect(field('name')).toHaveValue('Edited while saving');
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
    await saveAndWait();
    expect(JSON.parse(saves()[1][1].body).subTasks[0]).toMatchObject({
      _id: subtaskId(1),
      name: 'Edited while saving',
    });
  });
});

describe('successful save identity reconciliation failures', () => {
  const cases = [
    ['missing subTasks', () => undefined],
    ['incomplete array', rows => rows.slice(1)],
    ['missing ID', rows => rows.map((row, index) => (index ? row : { ...row, _id: undefined }))],
    ['malformed ID', rows => rows.map((row, index) => (index ? row : { ...row, _id: 'bad-id' }))],
    ['non-string ID', rows => rows.map((row, index) => (index ? row : { ...row, _id: 123 }))],
    ['null row', rows => rows.map((row, index) => (index ? row : null))],
    ['duplicate IDs', rows => rows.map(row => ({ ...row, _id: subtaskId(0) }))],
  ];

  describe.each(['POST', 'PATCH'])('%s', method => {
    it.each(cases)(
      'blocks retry and assignment after %s without discarding form data',
      async (name, corrupt) => {
        await renderBuilder();
        if (method === 'PATCH') await savePlan();
        const normalFetch = vi.mocked(fetch).getMockImplementation();
        vi.mocked(fetch).mockImplementation(async (url, options) => {
          if (!url.includes('/lesson-plans')) return normalFetch(url, options);
          const response = savedResponse(options);
          response.subTasks = corrupt(response.subTasks);
          return { ok: true, json: async () => response };
        });
        click('Save Lesson Plan');
        await waitFor(() =>
          expect(screen.getByRole('alert')).toHaveTextContent(
            'The lesson plan was saved, but its subtask identities could not be verified.',
          ),
        );
        expect(toast.error).not.toHaveBeenCalledWith(
          expect.stringContaining('Lesson plan save failed.'),
        );
        expect(screen.getByLabelText('Title')).toHaveValue('Research');
        expect(field('name')).toHaveValue('Subtask 1: Research summary');
        expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
        change('name', 'Still editable');
        click('Save Lesson Plan');
        click('Assign Tasks to Students');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        const writes = fetch.mock.calls.filter(([url]) => url.includes('/lesson-plans'));
        expect(writes).toHaveLength(1);
        expect(writes[0][1].method).toBe(method);
        expect(assignments()).toHaveLength(0);
        if (method === 'POST') {
          // Fetching logs with the returned plan ID demonstrates that it was retained.
          expect(fetch.mock.calls.some(([url]) => url.endsWith('/logs/saved-plan'))).toBe(true);
        }
      },
    );
  });

  it('rejects replacement identities for existing saved rows', async () => {
    await renderBuilder();
    await savePlan();
    vi.mocked(fetch).mockImplementationOnce(async (url, options) => {
      const response = savedResponse(options);
      response.subTasks[0]._id = subtaskId(99);
      return { ok: true, json: async () => response };
    });
    click('Save Lesson Plan');
    await screen.findByRole('alert');
    expect(assignments()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
  });
});

it('blocks confirmation from an already-open modal after reconciliation failure', async () => {
  await renderBuilder();
  await savePlan();
  click('Assign Tasks to Students');
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ _id: 'saved-plan' }),
  });
  click('Save Lesson Plan');
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  click('Confirm');
  expect(assignments()).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
});

it('keeps simultaneous metadata errors associated with their fields and clears each independently', () => {
  render(<LessonPlanBuilder />);
  ['Title', 'Start Date', 'End Date'].forEach(label => {
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'false');
    fireEvent.blur(screen.getByLabelText(label));
  });
  expect(screen.getAllByText('Invalid input')).toHaveLength(3);
  expect(screen.getByLabelText('Title')).toHaveDescription('Title is required.');
  expect(screen.getByLabelText('Start Date')).toHaveDescription('Date is required.');
  expect(screen.getByLabelText('End Date')).toHaveDescription('Date is required.');
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Research' } });
  expect(screen.getAllByText('Invalid input')).toHaveLength(2);
  expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'false');
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2030-01-01' } });
  expect(screen.getAllByText('Invalid input')).toHaveLength(1);
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2030-02-01' } });
  expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

describe('PATCH conflicts', () => {
  it('preserves edits and saved identities while blocking retries and assignment', async () => {
    await renderBuilder();
    await savePlan();
    change('name', 'Unsaved subtask edit');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Unsaved plan title' } });
    const json = vi.fn(async () => ({ error: 'Reload it and try again.' }));
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 409, json });
    click('Save Lesson Plan');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The lesson plan on the server changed.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('reconciled with the current server plan');
    expect(screen.getByRole('alert')).not.toHaveTextContent(/refresh|reload/i);
    expect(json).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/lesson-plans\/saved-plan$/);
    expect(options.method).toBe('PATCH');
    const submitted = JSON.parse(options.body);
    expect(submitted.subTasks.map(row => row._id)).toEqual([
      subtaskId(0),
      subtaskId(1),
      subtaskId(2),
    ]);
    expect(field('name')).toHaveValue('Unsaved subtask edit');
    expect(screen.getByLabelText('Title')).toHaveValue('Unsaved plan title');
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
    // Restoring the old values must not clear the conflict guard.
    change('name', 'Subtask 1: Research summary');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Research' } });
    click('Save Lesson Plan');
    click('Assign Tasks to Students');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(assignments()).toHaveLength(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Lesson plan save failed.'),
    );
  });

  it('blocks an already-open confirmation after a conflict, even with an unreadable body', async () => {
    await renderBuilder();
    await savePlan();
    click('Assign Tasks to Students');
    const json = vi.fn(async () => {
      throw new Error('Invalid JSON');
    });
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 409, json });
    click('Save Lesson Plan');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The lesson plan on the server changed.',
    );
    click('Confirm');
    expect(assignments()).toHaveLength(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(json).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save Lesson Plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Assign Tasks to Students' })).toBeDisabled();
  });
});
