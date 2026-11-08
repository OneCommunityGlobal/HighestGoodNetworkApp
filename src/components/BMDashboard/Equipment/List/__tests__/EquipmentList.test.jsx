import { act, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import EquipmentList from '../EquipmentList';
import EquipmentsTable from '../EquipmentsTable';
import styles from '../Equipments.module.css';

vi.mock('~/actions/bmdashboard/equipmentActions', () => ({
  fetchAllEquipments: () => ({ type: 'FETCH_EQUIPMENT' }),
}));
vi.mock('../EquipmentsInputs', () => ({ default: () => null }));
vi.mock('react-tooltip', () => ({ default: () => null }));

function createTestStore(equipments = []) {
  const initialState = {
    theme: { darkMode: false },
    bmEquipments: { equipmentslist: equipments },
  };
  return createStore((state = initialState, action) =>
    action.type === 'SET_THEME' ? { ...state, theme: { darkMode: action.darkMode } } : state,
  );
}

describe('Equipment list', () => {
  afterEach(() => {
    document.body.classList.remove('dark-mode', 'bm-dashboard-dark');
  });

  it('updates the heading theme class when dark mode is toggled', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <EquipmentList />
        </MemoryRouter>
      </Provider>,
    );
    const heading = screen.getByText('EQUIPMENT');
    expect(heading).toHaveClass(styles.BuildingTitle);
    expect(heading).not.toHaveClass(styles.darkTitle);
    act(() => store.dispatch({ type: 'SET_THEME', darkMode: true }));
    expect(heading).toHaveClass(styles.darkTitle);
    expect(document.body).toHaveClass('dark-mode', 'bm-dashboard-dark');
    act(() => store.dispatch({ type: 'SET_THEME', darkMode: false }));
    expect(heading).not.toHaveClass(styles.darkTitle);
    expect(document.body).not.toHaveClass('dark-mode', 'bm-dashboard-dark');
  });

  it.each([
    ['Purchased', 'Yes', 'No'],
    ['Purchase', 'Yes', 'No'],
    ['Rental', 'No', 'Yes'],
    ['Rented', 'No', 'Yes'],
    ['Needed', 'No', 'No'],
  ])('displays the ownership columns correctly for %s', (purchaseStatus, bought, rental) => {
    const store = createTestStore([
      { _id: 'equipment-1', itemType: { name: 'Excavator' }, purchaseStatus },
    ]);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <EquipmentsTable equipment={[]} project={[]} />
        </MemoryRouter>
      </Provider>,
    );
    const row = screen.getAllByRole('row')[1];
    expect(within(row).getByText('Excavator')).toBeInTheDocument();
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent(bought);
    expect(cells[3]).toHaveTextContent(rental);
  });
});
