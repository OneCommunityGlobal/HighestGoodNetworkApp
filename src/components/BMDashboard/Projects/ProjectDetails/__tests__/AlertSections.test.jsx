import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toast } from 'react-toastify';
import RentedToolsDisplay from '../RentedTools/RentedToolsDisplay';
import MaterialsDisplay from '../Materials/MaterialsDisplay';
import { DAY_MS } from '../alertUtils';
import { purchaseMaterial } from '~/actions/bmdashboard/materialsActions';

vi.mock('~/actions/bmdashboard/toolActions', () => ({
  fetchTools: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('~/actions/bmdashboard/equipmentActions', () => ({
  fetchAllEquipments: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('~/actions/bmdashboard/materialsActions', () => ({
  fetchAllMaterials: vi.fn(() => () => Promise.resolve()),
  resetMaterialUpdate: vi.fn(() => ({ type: 'RESET_UPDATE_MATERIAL' })),
  purchaseMaterial: vi.fn(),
}));
vi.mock('~/components/BMDashboard/UpdateMaterials/UpdateMaterialModal', () => ({
  default: ({ modal, record }) =>
    modal ? <div>Update modal for {record.itemType.name}</div> : null,
}));
vi.mock('~/components/BMDashboard/ItemList/RecordsModal', () => ({
  default: ({ modal, record }) => (modal ? <div>History for {record.itemType.name}</div> : null),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const PROJECT = 'p1';
const inDays = days => new Date(Date.now() + days * DAY_MS).toISOString();
const mockStore = configureMockStore([thunk]);

const baseState = {
  theme: { darkMode: false },
  bmTools: {
    toolslist: [
      {
        _id: 't-late',
        project: { _id: PROJECT },
        purchaseStatus: 'Rental',
        rentalDueDate: inDays(-2),
        itemType: { name: 'Late Drill' },
      },
      {
        _id: 't-later',
        project: { _id: PROJECT },
        purchaseStatus: 'Rental',
        rentalDueDate: inDays(10),
        itemType: { name: 'Another Saw' },
      },
    ],
  },
  bmEquipments: { equipmentslist: [] },
  materials: {
    materialslist: [
      {
        _id: 'm1',
        project: { _id: PROJECT },
        stockBought: 100,
        stockAvailable: 4,
        itemType: { _id: 'type-sand', name: 'Sand', unit: 'kg' },
      },
      {
        _id: 'm2',
        project: { _id: PROJECT },
        stockBought: 100,
        stockAvailable: 80,
        itemType: { _id: 'type-brick', name: 'Brick', unit: 'pcs' },
      },
    ],
    updateMaterials: { loading: false, result: null, error: undefined },
  },
};

const setup = (ui, state = baseState) => {
  const history = createMemoryHistory();
  render(
    <Provider store={mockStore(state)}>
      <Router history={history}>{ui}</Router>
    </Provider>,
  );
  return history;
};

beforeEach(() => {
  window.sessionStorage.clear();
  vi.clearAllMocks();
});

describe('RentedToolsDisplay', () => {
  it("shows this project's rentals, most urgent first, with due-date labels", async () => {
    setup(<RentedToolsDisplay projectId={PROJECT} />);
    const cards = await screen.findAllByRole('listitem');
    expect(cards.map(card => within(card).getByRole('heading').textContent)).toEqual([
      'Late Drill',
      'Another Saw',
    ]);
    expect(within(cards[0]).getByText(/Critical · Overdue by 2 days/)).toBeInTheDocument();
    expect(screen.queryByText('Card title')).not.toBeInTheDocument();
  });

  it('links each card to its tool detail page', async () => {
    const history = setup(<RentedToolsDisplay projectId={PROJECT} />);
    const link = await screen.findByRole('link', { name: 'Late Drill' });
    expect(link).toHaveAttribute('href', '/bmdashboard/tools/t-late');
    fireEvent.click(link);
    expect(history.location.pathname).toBe('/bmdashboard/tools/t-late');
  });

  it('keeps the chosen sort for the session', async () => {
    setup(<RentedToolsDisplay projectId={PROJECT} />);
    fireEvent.change(await screen.findByLabelText('Sort by'), { target: { value: 'name' } });
    expect(JSON.parse(window.sessionStorage.getItem('bmProjectAlerts:rentals')).sortBy).toBe(
      'name',
    );
    const titles = screen.getAllByRole('heading').map(h => h.textContent);
    expect(titles).toEqual(['Another Saw', 'Late Drill']);
  });

  it('shows an empty state when the project has no rentals', async () => {
    setup(<RentedToolsDisplay projectId="no-rentals" />);
    expect(await screen.findByText('No active rentals for this project.')).toBeInTheDocument();
  });
});

describe('MaterialsDisplay', () => {
  it('lists only materials under 20% with their remaining stock', async () => {
    setup(<MaterialsDisplay projectId={PROJECT} />);
    const cards = await screen.findAllByRole('listitem');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText(/4 of 100 kg/)).toBeInTheDocument();
    expect(within(cards[0]).getByText(/Critical · 4.0% left/)).toBeInTheDocument();
  });

  it('opens update and history views from the quick actions and the card', async () => {
    setup(<MaterialsDisplay projectId={PROJECT} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Update quantity' }));
    expect(screen.getByText('Update modal for Sand')).toBeInTheDocument();
    // The card's title button (stretched over the card) opens the history view.
    fireEvent.click(screen.getByRole('button', { name: 'Sand' }));
    expect(screen.getByText('History for Sand')).toBeInTheDocument();
  });

  it('submits a restock request and confirms it', async () => {
    purchaseMaterial.mockResolvedValue({ status: 201 });
    setup(<MaterialsDisplay projectId={PROJECT} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create restock request' }));
    expect(screen.getByLabelText(/Quantity/)).toHaveValue(96);
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
    await waitFor(() =>
      expect(purchaseMaterial).toHaveBeenCalledWith({
        primaryId: PROJECT,
        secondaryId: 'type-sand',
        quantity: 96,
        priority: 'High',
        brand: '',
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Restock request submitted for Sand');
  });

  it('shows the error when a restock request fails', async () => {
    purchaseMaterial.mockResolvedValue({ status: 400, data: { message: 'Quantity too high' } });
    setup(<MaterialsDisplay projectId={PROJECT} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create restock request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Quantity too high');
    expect(toast.error).toHaveBeenCalled();
  });
});
