import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import UpdateEquipment from '../UpdateEquipment';

const mocks = vi.hoisted(() => ({
  fetchEquipmentById: vi.fn(),
  updateEquipment: vi.fn(),
}));

vi.mock('~/actions/bmdashboard/equipmentActions', () => mocks);

const equipmentId = 'equipment-1';
const equipmentHistory = {
  _id: equipmentId,
  itemType: { name: 'Cordless Drill' },
  project: { name: 'Community Kitchen' },
  purchaseStatus: 'Purchase',
  updateRecord: [
    {
      date: '2025-03-05T12:00:00.000Z',
      condition: 'Working well',
      lastUsedFor: 'Kitchen - tiling',
      replacementRequired: 'no',
    },
  ],
  logRecord: [
    {
      date: '2025-03-06T12:00:00.000Z',
      type: 'Check Out',
      responsibleUser: { firstName: 'Taylor', lastName: 'Volunteer' },
    },
  ],
};

const makeStore = () => {
  const createStore = configureMockStore([thunk]);
  return createStore({
    bmEquipments: { singleEquipment: {} },
    theme: { darkMode: false },
  });
};

const renderForm = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[`/bmdashboard/tools/${equipmentId}/update`]}>
        <Route path="/bmdashboard/tools/:equipmentId/update" component={UpdateEquipment} />
      </MemoryRouter>
    </Provider>,
  );

const fillRequiredFields = async () => {
  await waitFor(() =>
    expect(screen.getByLabelText(/Who used the tool\/equipment last time/i)).toHaveValue(
      'Taylor Volunteer',
    ),
  );
  fireEvent.change(screen.getByLabelText(/Status\/Condition Now/i), {
    target: { value: 'Working well' },
  });
  fireEvent.change(screen.getByLabelText(/What was it used for last time/i), {
    target: { value: 'Kitchen - tiling' },
  });
  fireEvent.click(screen.getAllByLabelText('No')[0]);
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchEquipmentById.mockImplementation(() => async () => equipmentHistory);
  mocks.updateEquipment.mockImplementation((id, data) => async () => ({
    ...equipmentHistory,
    updateRecord: [
      ...equipmentHistory.updateRecord,
      {
        date: '2025-03-07T12:00:00.000Z',
        condition: data.condition,
        replacementRequired: data.replacementRequired,
        replacementReason: data.replacementReason,
      },
    ],
  }));
});

describe('UpdateEquipment history and status form', () => {
  it('prefills editable defaults and summarizes the latest applicable history', async () => {
    renderForm();

    await waitFor(() => {
      expect(screen.getByLabelText(/Who used the tool\/equipment last time/i)).toHaveValue(
        'Taylor Volunteer',
      );
      expect(screen.getByLabelText(/What was it used for last time/i)).toHaveValue(
        'Kitchen - tiling',
      );
    });
    expect(screen.getByText('Last Update Summary')).toBeInTheDocument();
    expect(screen.getByText('Mar 5, 2025')).toBeInTheDocument();
    expect(screen.getAllByText('Working well').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Taylor Volunteer').length).toBeGreaterThan(0);
  });

  it('does not overwrite user edits when the history request resolves later', async () => {
    let resolveHistory;
    mocks.fetchEquipmentById.mockImplementation(() => () =>
      new Promise(resolve => {
        resolveHistory = resolve;
      }),
    );

    renderForm();
    fireEvent.change(screen.getByLabelText(/Who used the tool\/equipment last time/i), {
      target: { value: 'Jane Doe (Volunteer #1)' },
    });
    fireEvent.change(screen.getByLabelText(/What was it used for last time/i), {
      target: { value: 'Garden - landscaping' },
    });

    resolveHistory(equipmentHistory);

    await waitFor(() => {
      expect(screen.getByLabelText(/Who used the tool\/equipment last time/i)).toHaveValue(
        'Jane Doe (Volunteer #1)',
      );
      expect(screen.getByLabelText(/What was it used for last time/i)).toHaveValue(
        'Garden - landscaping',
      );
    });
  });

  it('requires and submits a replacement reason, then confirms saved response values', async () => {
    renderForm();
    await fillRequiredFields();

    fireEvent.click(screen.getByLabelText('Yes'));
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));
    expect(
      await within(screen.getByTestId('submit-feedback')).findByRole('alert'),
    ).toHaveTextContent('Please complete the following required fields: Replacement reason.');

    fireEvent.change(screen.getByLabelText(/Replacement reason/i), {
      target: { value: 'The drill motor has failed.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));

    await waitFor(() =>
      expect(mocks.updateEquipment).toHaveBeenCalledWith(
        equipmentId,
        expect.objectContaining({
          replacementRequired: 'yes',
          replacementReason: 'The drill motor has failed.',
        }),
      ),
    );
    expect(await screen.findByText(/Cordless Drill status saved as Good/i)).toBeInTheDocument();
    expect(screen.getAllByText(/The drill motor has failed/).length).toBeGreaterThan(0);
  });

  it('shows distinct loading, empty-history and history-error states', async () => {
    let resolveHistory;
    mocks.fetchEquipmentById.mockImplementation(() => () =>
      new Promise(resolve => {
        resolveHistory = resolve;
      }),
    );

    renderForm();
    expect(screen.getByText(/Loading equipment history/i)).toBeInTheDocument();
    resolveHistory({ ...equipmentHistory, updateRecord: [], logRecord: [] });
    expect(await screen.findByText(/No previous status or usage history/i)).toBeInTheDocument();
  });

  it('shows an explicit message when equipment history cannot be loaded', async () => {
    mocks.fetchEquipmentById.mockImplementation(() => async () => ({
      error: new Error('Request failed'),
    }));

    renderForm();

    expect(await screen.findByText(/Equipment history could not be loaded/i)).toBeInTheDocument();
  });

  it('tolerates malformed and incomplete history records', async () => {
    mocks.fetchEquipmentById.mockImplementation(() => async () => ({
      _id: equipmentId,
      updateRecord: [null, { date: 'not-a-date', condition: 'Good' }, { condition: 'Good' }],
      logRecord: [
        {
          date: '2025-03-06T12:00:00.000Z',
          type: 'Check Out',
          responsibleUser: '507f191e810c19729de860ea',
        },
        { type: 'Check Out' },
      ],
    }));

    renderForm();

    await waitFor(() => expect(screen.queryByText(/Loading equipment history/i)).toBeNull());
    expect(screen.getByLabelText(/Who used the tool\/equipment last time/i)).toHaveValue('');
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
  });

  it('shows a failed update as an error without a success confirmation', async () => {
    mocks.updateEquipment.mockImplementation(() => async () => {
      throw new Error('Server down');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderForm();
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));

    expect(await screen.findByText(/Failed to update equipment/i)).toBeInTheDocument();
    expect(screen.queryByText(/status saved as/i)).toBeNull();
  });

  it('ignores a second submit while the first is in flight', async () => {
    let resolveUpdate;
    mocks.updateEquipment.mockImplementation(() => () =>
      new Promise(resolve => {
        resolveUpdate = resolve;
      }),
    );

    renderForm();
    await fillRequiredFields();
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    fireEvent.submit(submitButton);
    fireEvent.submit(submitButton);

    expect(mocks.updateEquipment).toHaveBeenCalledTimes(1);
    resolveUpdate({ ...equipmentHistory });
    await screen.findByText(/status saved as/i);
  });

  it('does not let a stale history response populate a different equipment', async () => {
    const resolvers = {};
    mocks.fetchEquipmentById.mockImplementation(id => () =>
      new Promise(resolve => {
        resolvers[id] = resolve;
      }),
    );
    const routerHistory = createMemoryHistory({ initialEntries: ['/t/equipment-1'] });
    render(
      <Provider store={makeStore()}>
        <Router history={routerHistory}>
          <Route path="/t/:equipmentId" component={UpdateEquipment} />
        </Router>
      </Provider>,
    );
    await waitFor(() => expect(resolvers['equipment-1']).toBeDefined());

    act(() => routerHistory.push('/t/equipment-2'));
    await waitFor(() => expect(resolvers['equipment-2']).toBeDefined());

    await act(async () => {
      resolvers['equipment-2']({ ...equipmentHistory, _id: 'equipment-2', logRecord: [] });
      resolvers['equipment-1'](equipmentHistory);
    });
    expect(screen.getByLabelText(/Who used the tool\/equipment last time/i)).toHaveValue('');
  });

  it('keeps image selection preview-only and never claims it was saved', async () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:preview');
    global.URL.revokeObjectURL = vi.fn();
    renderForm();
    await fillRequiredFields();

    const input = screen.getByLabelText('Upload image files');
    const file = new File(['x'], 'tool.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/preview only; it will not be saved/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));
    await screen.findByText(/status saved as/i);
    expect(screen.queryByText(/image.*(saved|uploaded) successfully/i)).toBeNull();
    expect(mocks.updateEquipment.mock.calls[0][1]).not.toHaveProperty('images');
  });
});

describe('UpdateEquipment smart default sources', () => {
  const userField = () => screen.getByLabelText(/Who used the tool\/equipment last time/i);
  const purposeField = () => screen.getByLabelText(/What was it used for last time/i);
  const loadWith = history => {
    mocks.fetchEquipmentById.mockImplementation(() => async () => ({
      ...equipmentHistory,
      ...history,
    }));
    return renderForm();
  };

  it('selects the saved status-update user and purpose when there is no checkout history', async () => {
    loadWith({
      logRecord: [],
      updateRecord: [
        {
          date: '2025-03-05T12:00:00.000Z',
          condition: 'Working well',
          lastUsedBy: 'Jane Doe (Volunteer #2)',
          lastUsedFor: 'Garden - landscaping',
        },
      ],
    });

    await waitFor(() => expect(userField()).toHaveValue('Jane Doe (Volunteer #2)'));
    expect(purposeField()).toHaveValue('Garden - landscaping');
    expect(screen.getAllByText('Jane Doe (Volunteer #2)').length).toBeGreaterThan(1);
  });

  it('uses whichever of checkout and saved update is more recent', async () => {
    const updateRecord = [
      {
        date: '2025-03-08T12:00:00.000Z',
        condition: 'Working well',
        lastUsedBy: 'Jane Doe (Volunteer #3)',
      },
    ];
    const { unmount } = loadWith({ updateRecord });
    await waitFor(() => expect(userField()).toHaveValue('Jane Doe (Volunteer #3)'));
    unmount();

    loadWith({ updateRecord: [{ ...updateRecord[0], date: '2025-03-01T12:00:00.000Z' }] });
    await waitFor(() => expect(userField()).toHaveValue('Taylor Volunteer'));
  });

  it('skips unpopulated user ids and falls back to a readable saved name', async () => {
    loadWith({
      logRecord: [
        { date: '2025-03-09T12:00:00.000Z', type: 'Check Out', responsibleUser: 'a'.repeat(24) },
        {
          date: '2025-03-10T12:00:00.000Z',
          type: 'Check In',
          responsibleUser: { firstName: 'No' },
        },
      ],
      updateRecord: [
        {
          date: '2025-03-05T12:00:00.000Z',
          condition: 'Working well',
          lastUsedBy: 'Jane Doe (Volunteer #1)',
        },
      ],
    });
    await waitFor(() => expect(userField()).toHaveValue('Jane Doe (Volunteer #1)'));
  });

  it('picks the newest record that actually has a purpose, not simply the newest record', async () => {
    loadWith({
      updateRecord: [
        { date: '2025-03-01T12:00:00.000Z', condition: 'Good', lastUsedFor: 'Bathroom - plumbing' },
        { date: '2025-03-04T12:00:00.000Z', condition: 'Good', lastUsedFor: 'Kitchen - tiling' },
        { date: '2025-03-09T12:00:00.000Z', condition: 'Needs Repair', lastUsedFor: '  ' },
      ],
    });
    await waitFor(() => expect(purposeField()).toHaveValue('Kitchen - tiling'));
  });

  it('leaves the user empty when no previous user exists and the purpose empty when none exists', async () => {
    loadWith({
      logRecord: [],
      updateRecord: [{ date: '2025-03-05T12:00:00.000Z', condition: 'Working well' }],
    });
    await screen.findByText('Last Update Summary');
    expect(userField()).toHaveValue('');
    expect(purposeField()).toHaveValue('');
  });

  it('shows a previously saved free-text value as a selected option', async () => {
    loadWith({
      logRecord: [],
      updateRecord: [
        {
          date: '2025-03-05T12:00:00.000Z',
          condition: 'Working well',
          lastUsedBy: 'Morgan Custom',
          lastUsedFor: 'Roof repair',
        },
      ],
    });
    await waitFor(() => expect(userField()).toHaveValue('Morgan Custom'));
    expect(purposeField()).toHaveValue('Roof repair');
    expect(screen.getByRole('option', { name: 'Morgan Custom', selected: true })).toBeTruthy();
  });

  it('defaults from the saved record on a fresh load after a successful save, but not after a failed one', async () => {
    const saved = {
      ...equipmentHistory,
      logRecord: [],
      updateRecord: [
        {
          date: '2025-03-07T12:00:00.000Z',
          condition: 'Working well',
          lastUsedBy: 'Jane Doe (Volunteer #4)',
          lastUsedFor: 'Living room - painting',
          replacementRequired: 'no',
        },
      ],
    };
    let serverState = { ...equipmentHistory, logRecord: [], updateRecord: [] };
    mocks.fetchEquipmentById.mockImplementation(() => async () => serverState);
    mocks.updateEquipment.mockImplementationOnce(() => async () => {
      throw new Error('Server down');
    });
    mocks.updateEquipment.mockImplementationOnce(() => async () => {
      serverState = saved;
      return saved;
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount: unmountFirst } = renderForm();
    await screen.findByText('Last Update Summary');
    fireEvent.change(userField(), { target: { value: 'Jane Doe (Volunteer #4)' } });
    fireEvent.change(purposeField(), { target: { value: 'Living room - painting' } });
    fireEvent.change(screen.getByLabelText(/Status\/Condition Now/i), {
      target: { value: 'Working well' },
    });
    fireEvent.click(screen.getAllByLabelText('No')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));
    await screen.findByText(/Failed to update equipment/i);
    unmountFirst();

    const { unmount: unmountSecond } = renderForm();
    await screen.findByText('Last Update Summary');
    expect(userField()).toHaveValue('');
    expect(purposeField()).toHaveValue('');
    unmountSecond();

    const { unmount: unmountThird } = renderForm();
    await screen.findByText('Last Update Summary');
    fireEvent.change(userField(), { target: { value: 'Jane Doe (Volunteer #4)' } });
    fireEvent.change(purposeField(), { target: { value: 'Living room - painting' } });
    fireEvent.change(screen.getByLabelText(/Status\/Condition Now/i), {
      target: { value: 'Working well' },
    });
    fireEvent.click(screen.getAllByLabelText('No')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Update Status/i }));
    await screen.findByText(/status saved as/i);
    unmountThird();

    renderForm();
    await waitFor(() => expect(userField()).toHaveValue('Jane Doe (Volunteer #4)'));
    expect(purposeField()).toHaveValue('Living room - painting');
  });

  describe('submission feedback', () => {
    const feedback = () => screen.getByTestId('submit-feedback');
    const submitBtn = () => screen.getByRole('button', { name: /^Update Status$/i });

    it('renders a clean button label with no icon glyphs', () => {
      renderForm();
      expect(submitBtn().textContent).toBe('Update Status');
    });

    it('lists every missing field in one alert placed above the action buttons, with no PUT', async () => {
      renderForm();
      fireEvent.click(submitBtn());
      const alert = await within(feedback()).findByRole('alert');
      expect(alert).toHaveTextContent(/Please complete the following required fields:/);
      expect(alert).toHaveTextContent(/Status\/Condition/);
      expect(alert).toHaveTextContent(/What it was used for last time/);
      expect(alert).toHaveTextContent(/Replacement required/);
      expect(within(feedback()).getAllByRole('alert')).toHaveLength(1);
      expect(
        alert.compareDocumentPosition(submitBtn()) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(mocks.updateEquipment).not.toHaveBeenCalled();
    });

    it('shows Saving... while pending and keeps the confirmation after success', async () => {
      let resolveSave;
      mocks.updateEquipment.mockImplementation(() => () =>
        new Promise(resolve => {
          resolveSave = resolve;
        }),
      );
      renderForm();
      await fillRequiredFields();
      fireEvent.click(submitBtn());
      const saving = await screen.findByRole('button', { name: /Saving\.\.\./ });
      expect(saving).toBeDisabled();
      resolveSave({
        updateRecord: [
          {
            date: '2025-04-01T00:00:00.000Z',
            condition: 'Working well',
            lastUsedBy: 'Taylor Volunteer',
            lastUsedFor: 'Kitchen - tiling',
            replacementRequired: false,
          },
        ],
      });
      const status = await within(feedback()).findByRole('alert');
      expect(status).toHaveTextContent(/status saved as/i);
      expect(status.textContent).not.toMatch(/image.*(uploaded|saved)/i);
      expect(submitBtn()).toBeEnabled();
    });

    it.each([
      ['backend failure', { response: { status: 500, data: { error: 'Boom' } } }, /Boom/],
      ['network failure', { request: {}, message: 'Network Error' }, /no response from server/i],
    ])('shows %s near the buttons and preserves entries', async (_n, err, pattern) => {
      mocks.updateEquipment.mockImplementation(() => () => Promise.reject(err));
      renderForm();
      await fillRequiredFields();
      fireEvent.click(submitBtn());
      const alert = await within(feedback()).findByRole('alert');
      expect(alert).toHaveTextContent(pattern);
      expect(screen.queryByText(/status saved as/i)).toBeNull();
      expect(screen.getByLabelText(/What was it used for last time/i)).toHaveValue(
        'Kitchen - tiling',
      );
    });
  });

  describe('status values', () => {
    const statusField = () => screen.getByLabelText(/Status\/Condition Now/i);

    it.each([
      ['Working well', 'Good'],
      ['Broken/Needs repair', 'Needs Repair'],
      ['Stolen/Lost', 'Out of Order'],
      ['End of life', 'Out of Order'],
      ['Returned', 'Good'],
    ])('keeps the label "%s" and submits the canonical value %s', async (label, stored) => {
      renderForm();
      await fillRequiredFields();
      fireEvent.change(statusField(), { target: { value: label } });
      fireEvent.click(screen.getByRole('button', { name: /^Update Status$/i }));

      await waitFor(() => expect(mocks.updateEquipment).toHaveBeenCalledTimes(1));
      expect(mocks.updateEquipment.mock.calls[0][1].condition).toBe(stored);
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    });

    it.each([
      ['Working well', 'Working well'],
      ['Good', 'Working well'],
      ['Needs Repair', 'Broken/Needs repair'],
      ['Broken/Needs repair', 'Broken/Needs repair'],
      ['Out of Order', 'Stolen/Lost'],
    ])('preselects the dropdown for a saved %s record', async (saved, label) => {
      mocks.fetchEquipmentById.mockImplementation(() => async () => ({
        ...equipmentHistory,
        updateRecord: [{ date: '2025-03-05T12:00:00.000Z', condition: saved }],
      }));
      renderForm();
      await waitFor(() => expect(statusField()).toHaveValue(label));
    });
  });

  describe('details navigation', () => {
    const setupWithHistory = () => {
      const routerHistory = createMemoryHistory({
        initialEntries: [`/bmdashboard/tools/${equipmentId}/update`],
      });
      render(
        <Provider store={makeStore()}>
          <Router history={routerHistory}>
            <Route path="/bmdashboard/tools/:equipmentId/update" component={UpdateEquipment} />
          </Router>
        </Provider>,
      );
      return routerHistory;
    };

    it('links the success confirmation to the equipment details route with the same id', async () => {
      const routerHistory = setupWithHistory();
      await fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: /^Update Status$/i }));

      fireEvent.click(await screen.findByRole('button', { name: /view the equipment details/i }));

      expect(routerHistory.location.pathname).toBe(`/bmdashboard/equipment/${equipmentId}`);
    });

    it('does not navigate after an unsuccessful submission', async () => {
      mocks.updateEquipment.mockImplementation(() => () => Promise.reject(new Error('fail')));
      const routerHistory = setupWithHistory();
      await fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: /^Update Status$/i }));

      await within(screen.getByTestId('submit-feedback')).findByRole('alert');
      expect(screen.queryByRole('button', { name: /view the equipment details/i })).toBeNull();
      expect(routerHistory.location.pathname).toBe(`/bmdashboard/tools/${equipmentId}/update`);
    });
  });

  it('applies the scoped navy-on-light-blue summary class regardless of theme', async () => {
    renderForm();
    await screen.findByText('Last Update Summary');
    const panel = screen
      .getAllByRole('alert')
      .find(el => within(el).queryByText('Last Update Summary'));
    expect(panel.className).toMatch(/lastUpdateSummary/);
  });
});
