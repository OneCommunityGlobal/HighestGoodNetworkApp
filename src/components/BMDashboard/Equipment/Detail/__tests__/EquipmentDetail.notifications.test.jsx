import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter, Route } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { equipmentReducer } from '~/reducers/bmdashboard/equipmentReducer';
import EquipmentDetail from '../EquipmentDetail';

vi.unmock('react-toastify');
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('~/actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => () => {},
}));
vi.mock('~/actions/bmdashboard/invTypeActions', () => ({
  fetchEquipmentTypes: () => () => {},
}));

const equipmentId = '507f1f77bcf86cd799439011';
const projectId = '507f1f77bcf86cd799439012';
const equipment = {
  _id: equipmentId,
  itemType: { name: 'Excavator', category: 'Equipment' },
  project: { _id: projectId, name: 'Project' },
  purchaseStatus: 'Rental',
  currentUsage: 'Operational',
  condition: 'Good',
};

function renderDetail() {
  const initialState = {
    bmEquipments: {
      equipmentslist: [],
      singleEquipment: equipment,
      updateEquipment: { loading: false, error: null },
    },
    bmProjects: [{ _id: projectId, name: 'Project' }],
    bmInvTypes: { list: [] },
  };
  const reducer = (state = initialState, action) => ({
    ...state,
    bmEquipments: equipmentReducer(state.bmEquipments, action),
  });
  const store = createStore(reducer, applyMiddleware(thunk));

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/bmdashboard/equipment/${equipmentId}`]}>
        <ToastContainer />
        <Route path="/bmdashboard/equipment/:equipmentId">
          <EquipmentDetail />
        </Route>
      </MemoryRouter>
    </Provider>,
  );
}

describe('Equipment detail save notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockReturnValue(new Promise(() => {}));
  });

  it('renders a success notification after the update succeeds', async () => {
    let resolveRequest;
    axios.put.mockReturnValue(
      new Promise(resolve => {
        resolveRequest = resolve;
      }),
    );
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Condition:'), { target: { value: 'Used' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.queryByText('Equipment updated successfully!')).not.toBeInTheDocument();
    await act(async () => {
      resolveRequest({ data: { ...equipment, condition: 'Used' } });
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Equipment updated successfully!');
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders an error notification and retains edits when the update fails', async () => {
    axios.put.mockRejectedValue({ response: { data: { message: 'Save failed' } } });
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Condition:'), { target: { value: 'Used' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
    expect(screen.getByLabelText('Condition:')).toHaveValue('Used');
    expect(screen.queryByText('Equipment updated successfully!')).not.toBeInTheDocument();
  });
});
