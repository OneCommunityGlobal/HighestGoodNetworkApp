import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import KIInventory from '../KIInventory';
import { ENDPOINTS } from '../../../../utils/URL';

const mockStore = configureMockStore([thunk]);

const getDateValue = daysFromToday => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const inventoryItem = {
  _id: 'item-1',
  name: 'Tomatoes',
  type: 'Vegetables',
  unit: 'lbs',
  location: 'Pantry',
  category: 'INGREDIENT',
  presentQuantity: 5,
  storedQuantity: 10,
  reorderAt: 3,
  monthlyUsage: 2,
  onsite: true,
  expiryDate: getDateValue(30),
};

const getInventoryState = items => ({
  theme: { darkMode: false },
  kiInventory: {
    items,
    preservedItems: [],
    stats: { totalItems: items.length, criticalStock: 0, lowStock: 0 },
    loading: false,
    statsLoading: false,
    preservedLoading: false,
    addItemLoading: false,
    addItemError: null,
    updateItemLoading: false,
    updateItemError: null,
    deleteItemLoading: false,
    deleteItemError: null,
    reorderItemLoading: false,
    reorderItemError: null,
    error: null,
  },
});

const renderInventory = (items = []) => {
  const store = mockStore(getInventoryState(items));

  render(
    <Provider store={store}>
      <KIInventory />
    </Provider>,
  );
};

describe('KIInventory action buttons', () => {
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

  test('opens the Update Item modal with the selected item', () => {
    renderInventory([inventoryItem]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Update Item' })[0]);

    expect(screen.getByRole('dialog', { name: 'Update Inventory Item' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tomatoes')).toBeInTheDocument();
    expect(screen.getByText('ingredients')).toBeInTheDocument();
  });

  test('opens the Reorder modal with the selected item', () => {
    renderInventory([inventoryItem]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reorder' })[0]);

    const dialog = screen.getByRole('dialog', { name: 'Reorder Inventory Item' });
    expect(within(dialog).getByText('Tomatoes')).toBeInTheDocument();
    expect(within(dialog).getByText('5 lbs')).toBeInTheDocument();
  });

  test('submits received stock, refreshes inventory data, and closes the modal', async () => {
    axios.post.mockResolvedValue({ data: { data: inventoryItem } });
    renderInventory([inventoryItem]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reorder' })[0]);
    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.KI_INVENTORY_STORED_QUANTITY, {
        itemId: 'item-1',
        addedQuantity: 7,
      });
    });
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.KI_INVENTORY_ITEMS);
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.KI_INVENTORY_STATS);
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.KI_INVENTORY_PRESERVED);
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Reorder Inventory Item' }),
      ).not.toBeInTheDocument();
    });
  });

  test('keeps the Reorder modal open when the API request fails', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'Stock update failed.' } },
    });
    renderInventory([inventoryItem]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Reorder' })[0]);
    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Stock update failed.');
    expect(screen.getByRole('dialog', { name: 'Reorder Inventory Item' })).toBeInTheDocument();
  });
});
