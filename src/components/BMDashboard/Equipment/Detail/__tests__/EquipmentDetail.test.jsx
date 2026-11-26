import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter, Route } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { equipmentReducer } from '~/reducers/bmdashboard/equipmentReducer';
import { setEquipment } from '~/actions/bmdashboard/equipmentActions';
import EquipmentDetail from '../EquipmentDetail';

vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('~/actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => () => {},
}));
vi.mock('~/actions/bmdashboard/invTypeActions', () => ({
  fetchEquipmentTypes: () => () => {},
}));

const equipmentId = '507f1f77bcf86cd799439011';
const projectId = '507f1f77bcf86cd799439012';
const secondProjectId = '507f1f77bcf86cd799439013';
const equipment = {
  _id: equipmentId,
  itemType: { name: 'Excavator', category: 'Equipment' },
  project: { _id: projectId, name: 'First Project' },
  equipmentClass: 'Heavy Machinery',
  purchaseStatus: 'Rented',
  currentUsage: 'Operational',
  condition: 'Good',
};

function setup(initialEquipment = equipment) {
  const initialState = {
    bmEquipments: {
      equipmentslist: [],
      singleEquipment: initialEquipment,
      updateEquipment: { loading: false, error: null },
    },
    bmProjects: [
      { _id: projectId, name: 'First Project' },
      { _id: secondProjectId, name: 'Second Project' },
    ],
    bmInvTypes: { list: [{ name: 'Excavator', category: 'Equipment' }] },
  };
  const reducer = (state = initialState, action) => ({
    ...state,
    bmEquipments: equipmentReducer(state.bmEquipments, action),
  });
  const store = createStore(reducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/bmdashboard/equipment/${equipmentId}`]}>
        <Route path="/bmdashboard/equipment/:equipmentId">
          <EquipmentDetail />
        </Route>
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

describe('Equipment detail editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockReturnValue(new Promise(() => {}));
  });

  it('renders the equipment and prepopulates supported legacy values', () => {
    setup();
    expect(screen.getByText('Excavator')).toBeInTheDocument();
    expect(screen.getByText('Heavy Machinery')).toBeInTheDocument();
    expect(screen.getByText('Rented')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Belongs to Project:')).toHaveValue(projectId);
    expect(screen.getByLabelText('Class:')).toHaveValue('Heavy Machinery');
    expect(screen.getByRole('radio', { name: 'Rented' })).toBeChecked();
    expect(screen.getByLabelText('Current Usage:')).toHaveValue('Operational');
    expect(screen.getByLabelText('Condition:')).toHaveValue('Good');
    expect(
      within(screen.getByLabelText('Condition:')).getByRole('option', { name: 'Good' }),
    ).toBeInTheDocument();
  });

  it.each(['Rental', 'Rented'])('shows Rental Duration for %s equipment', purchaseStatus => {
    setup({ ...equipment, purchaseStatus });
    expect(screen.getByText(/Rental Duration:/)).toBeInTheDocument();
  });

  it.each(['Purchased', 'Purchase', 'Needed'])(
    'hides Rental Duration for %s equipment',
    purchaseStatus => {
      setup({ ...equipment, purchaseStatus });
      expect(screen.queryByText(/Rental Duration:/)).not.toBeInTheDocument();
    },
  );

  it('loads persisted equipment after opening the detail route', async () => {
    axios.get.mockResolvedValue({ data: { ...equipment, condition: 'Used' } });
    setup({});
    expect(await screen.findByText('Excavator')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`/bm/equipment/${equipmentId}`));
    expect(screen.getAllByText('Used')).not.toHaveLength(0);
  });

  it('saves selected values using the existing API and updates the displayed response', async () => {
    setup();
    const saved = {
      ...equipment,
      project: { _id: secondProjectId, name: 'Second Project' },
      equipmentClass: 'Equipment',
      purchaseStatus: 'Purchased',
      currentUsage: 'Under Maintenance',
      condition: 'Refurbished',
    };
    axios.put.mockResolvedValue({ data: saved });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Belongs to Project:'), {
      target: { value: secondProjectId },
    });
    fireEvent.change(screen.getByLabelText('Class:'), { target: { value: 'Equipment' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Owned' }));
    fireEvent.change(screen.getByLabelText('Current Usage:'), {
      target: { value: 'Under Maintenance' },
    });
    fireEvent.change(screen.getByLabelText('Condition:'), { target: { value: 'Refurbished' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('button', { name: 'Edit' });
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/bm/equipment/${equipmentId}`),
      {
        projectId: secondProjectId,
        equipmentClass: 'Equipment',
        purchaseStatus: 'Purchased',
        currentUsage: 'Under Maintenance',
        condition: 'Refurbished',
      },
    );
    expect(toast.success).toHaveBeenCalledWith('Equipment updated successfully!');
    expect(screen.getByText('Second Project')).toBeInTheDocument();
    expect(screen.getByText('Owned')).toBeInTheDocument();
  });

  it('preserves legacy values on unrelated saves without creating a class value', async () => {
    setup({
      ...equipment,
      equipmentClass: undefined,
      purchaseStatus: 'Purchase',
      condition: 'Like New',
    });
    axios.put.mockResolvedValue({
      data: { ...equipment, purchaseStatus: 'Purchase', condition: 'Like New' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('radio', { name: 'Owned' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('button', { name: 'Edit' });
    expect(axios.put.mock.calls[0][1]).toEqual({
      projectId,
      purchaseStatus: 'Purchase',
      currentUsage: 'Operational',
      condition: 'Like New',
    });
  });

  it.each(['Like New', 'Good', 'Worn', 'Lost', 'Needs Repair', 'Needs Replacing'])(
    'retains the existing legacy condition %s',
    async condition => {
      setup({ ...equipment, condition });
      axios.put.mockResolvedValue({ data: { ...equipment, condition } });
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByLabelText('Condition:')).toHaveValue(condition);
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      await screen.findByRole('button', { name: 'Edit' });
      expect(axios.put.mock.calls[0][1].condition).toBe(condition);
    },
  );

  it('keeps the existing Needed status available without classifying it as owned or rented', async () => {
    setup({ ...equipment, purchaseStatus: 'Needed' });
    axios.put.mockResolvedValue({ data: { ...equipment, purchaseStatus: 'Needed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('radio', { name: 'Needed' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('button', { name: 'Edit' });
    expect(axios.put.mock.calls[0][1].purchaseStatus).toBe('Needed');
  });

  it('sends Rental when the user selects Rented', async () => {
    setup({ ...equipment, purchaseStatus: 'Purchased' });
    axios.put.mockResolvedValue({ data: { ...equipment, purchaseStatus: 'Rental' } });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Rented' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('button', { name: 'Edit' });
    expect(axios.put.mock.calls[0][1].purchaseStatus).toBe('Rental');
  });

  it('keeps unsaved changes on failure and ignores equipment updates while editing', async () => {
    const store = setup();
    axios.put
      .mockRejectedValueOnce({ response: { data: { message: 'Save failed' } } })
      .mockResolvedValueOnce({ data: { ...equipment, condition: 'Used' } });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Condition:'), { target: { value: 'Used' } });
    act(() => store.dispatch(setEquipment({ ...equipment, condition: 'New' })));
    expect(screen.getByLabelText('Condition:')).toHaveValue('Used');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Save failed'));
    expect(screen.getByLabelText('Condition:')).toHaveValue('Used');
    expect(toast.success).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await screen.findByRole('button', { name: 'Edit' });
    expect(axios.put).toHaveBeenCalledTimes(2);
    expect(axios.put.mock.calls[1][1].condition).toBe('Used');
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('discards unsaved edits on cancel and starts a fresh edit', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Condition:'), { target: { value: 'Used' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(axios.put).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Condition:')).toHaveValue('Good');
  });

  it('rejects invalid values before issuing an update', () => {
    setup({ ...equipment, project: null, purchaseStatus: '', currentUsage: '', condition: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Select a valid project.')).toBeInTheDocument();
    expect(screen.getByText('Select a valid ownership.')).toBeInTheDocument();
    expect(screen.getByText('Select a valid current usage.')).toBeInTheDocument();
    expect(screen.getByText('Select a valid condition.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('shows unsupported existing condition values but requires a supported choice', () => {
    setup({ ...equipment, condition: 'Unknown' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Condition:')).toHaveValue('Unknown');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Select a valid condition.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('guards against duplicate saves while the request is pending', async () => {
    setup();
    let resolveRequest;
    axios.put.mockReturnValue(
      new Promise(resolve => {
        resolveRequest = resolve;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const button = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByLabelText('Condition:')).toBeDisabled();
    resolveRequest({ data: equipment });
    await screen.findByRole('button', { name: 'Edit' });
  });
});
