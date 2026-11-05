import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EquipmentsTable from '../EquipmentsTable';

vi.mock('~/actions/bmdashboard/equipmentActions', () => ({
  fetchAllEquipments: () => ({ type: 'MOCK_FETCH_ALL_EQUIPMENTS' }),
}));

const equipmentslist = [
  {
    _id: 'equipment-1',
    project: { _id: 'project-1', name: 'Community Kitchen' },
    itemType: { name: 'Cordless Drill' },
    purchaseStatus: 'Purchased',
    updateRecord: [
      {
        _id: 'update-1',
        date: '2025-03-05T12:00:00.000Z',
        createdBy: { _id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' },
      },
    ],
    purchaseRecord: [{ _id: 'purchase-1', date: '2025-01-10T12:00:00.000Z', status: 'Approved' }],
  },
  {
    _id: 'equipment-2',
    project: { _id: 'project-2', name: 'Garden' },
    itemType: { name: 'Shovel' },
    purchaseStatus: 'Rental',
    updateRecord: [],
    purchaseRecord: [],
  },
];

const setupTable = () => {
  const history = createMemoryHistory({ initialEntries: ['/bmdashboard/equipment'] });
  const store = configureMockStore([thunk])({ bmEquipments: { equipmentslist } });
  render(
    <Provider store={store}>
      <Router history={history}>
        <EquipmentsTable equipment={[]} project={[]} />
      </Router>
    </Provider>,
  );
  return { history };
};

describe('EquipmentsTable', () => {
  it('renders a row per equipment with detail links', () => {
    setupTable();
    expect(screen.getByRole('link', { name: 'Cordless Drill' }).getAttribute('href')).toBe(
      '/bmdashboard/equipment/equipment-1',
    );
    expect(screen.getByText('Shovel')).toBeInTheDocument();
  });

  it('navigates to the status update form for the clicked equipment', () => {
    const { history } = setupTable();
    fireEvent.click(screen.getAllByLabelText('Edit updates')[1]);
    expect(history.location.pathname).toBe('/bmdashboard/tools/equipment-2/update');
    expect(screen.queryByText(/Edit Record/)).not.toBeInTheDocument();
  });

  it('opens update history from the UPDATES View button', () => {
    const { history } = setupTable();
    fireEvent.click(screen.getAllByRole('button', { name: 'View' })[0]);
    expect(screen.getByText(/Update History/)).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(history.location.pathname).toBe('/bmdashboard/equipment');
  });

  it('opens purchase history from the PURCHASES View button', () => {
    setupTable();
    fireEvent.click(screen.getAllByRole('button', { name: 'View' })[1]);
    expect(screen.getByText(/Purchase History/)).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});
