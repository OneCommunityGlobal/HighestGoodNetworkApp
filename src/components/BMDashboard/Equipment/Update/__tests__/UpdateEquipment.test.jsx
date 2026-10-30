import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
      await screen.findByText(/Please provide a reason when replacement is required/i),
    ).toBeInTheDocument();

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
    expect(
      await screen.findByText(/Cordless Drill status saved as Working well/i),
    ).toBeInTheDocument();
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
