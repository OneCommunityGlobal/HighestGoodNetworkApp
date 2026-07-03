import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import KIInventory from '../KIInventory';

const mockStore = configureMockStore([thunk]);

const renderInventory = () => {
  const store = mockStore({
    theme: { darkMode: false },
    kiInventory: {
      items: [],
      preservedItems: [],
      stats: { totalItems: 0, criticalStock: 0, lowStock: 0 },
      loading: false,
      statsLoading: false,
      preservedLoading: false,
      addItemLoading: false,
      addItemError: null,
      error: null,
    },
  });

  render(
    <Provider store={store}>
      <KIInventory />
    </Provider>,
  );
};

describe('KIInventory Add Item button', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { data: [] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('opens the Add Item modal from the page action button', () => {
    renderInventory();

    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));

    expect(screen.getByRole('dialog', { name: 'Add Inventory Item' })).toBeInTheDocument();
    expect(screen.getByText('ingredients')).toBeInTheDocument();
  });

  test('passes the active tab category to the Add Item modal', () => {
    renderInventory();

    fireEvent.click(screen.getByText('Equipment & Supplies'));
    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));

    expect(screen.getByRole('dialog', { name: 'Add Inventory Item' })).toBeInTheDocument();
    expect(screen.getByText('equipment & supplies')).toBeInTheDocument();
  });
});
