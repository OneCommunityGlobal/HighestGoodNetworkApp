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

const renderInventory = (items = [], inventoryOverrides = {}) => {
  const state = getInventoryState(items);
  const store = mockStore({
    ...state,
    kiInventory: { ...state.kiInventory, ...inventoryOverrides },
  });

  render(
    <Provider store={store}>
      <KIInventory />
    </Provider>,
  );
};

const findBarcode = value => {
  fireEvent.click(screen.getByRole('button', { name: 'Scan Barcode' }));
  const scanner = within(screen.getByRole('dialog', { name: 'Scan Barcode' }));
  fireEvent.change(scanner.getByLabelText('Barcode'), { target: { value } });
  fireEvent.click(scanner.getByRole('button', { name: 'Find Item' }));
  return scanner;
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

  test.each([
    ['Update Item', 'Update Inventory Item'],
    ['Reorder', 'Reorder Inventory Item'],
  ])('opens %s from a matching record in another category', (action, dialogName) => {
    renderInventory([
      { ...inventoryItem, barcode: '0012345000058' },
      {
        ...inventoryItem,
        _id: 'item-2',
        name: 'Tomato seeds',
        category: 'SEEDS',
        location: 'Seed rack',
        presentQuantity: 0,
        barcode: '012345000058',
      },
    ]);
    fireEvent.change(screen.getByPlaceholderText('Search ingredients...'), {
      target: { value: 'Garlic' },
    });

    const scanner = findBarcode('012345000058');
    expect(scanner.getByRole('status')).toHaveTextContent('2 matches');
    const seedMatch = within(scanner.getAllByRole('listitem')[1]);
    expect(seedMatch.getByText('Seed rack')).toBeInTheDocument();
    expect(seedMatch.getByText('0 lbs')).toBeInTheDocument();
    fireEvent.click(seedMatch.getByRole('button', { name: action }));

    const dialog = within(screen.getByRole('dialog', { name: dialogName }));
    if (action === 'Update Item') {
      expect(dialog.getByDisplayValue('Tomato seeds')).toBeInTheDocument();
      expect(dialog.getByText('seeds')).toBeInTheDocument();
    } else {
      expect(dialog.getByText('Tomato seeds')).toBeInTheDocument();
    }
    expect(screen.queryByRole('dialog', { name: 'Scan Barcode' })).not.toBeInTheDocument();
  });

  test('prefills Add Item from an unmatched barcode and clears it for the next normal add', () => {
    renderInventory();
    fireEvent.click(screen.getByText('Equipment & Supplies'));

    const scanner = findBarcode(' 012345000058 ');
    fireEvent.click(scanner.getByRole('button', { name: 'Add Item' }));

    const addModal = within(screen.getByRole('dialog', { name: 'Add Inventory Item' }));
    expect(addModal.getByLabelText('Barcode (optional)')).toHaveValue('0012345000058');
    expect(addModal.getByText('equipment & supplies')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
    fireEvent.click(addModal.getByRole('button', { name: 'Cancel' }));

    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    expect(screen.getByLabelText('Barcode (optional)')).toHaveValue('');
  });

  test('retries an inventory lookup failure with the scanned code retained', () => {
    renderInventory([], { error: 'Failed to fetch inventory items.' });

    const scanner = findBarcode('012345000058');
    expect(scanner.getByRole('alert')).toHaveTextContent('Failed to fetch inventory items.');
    expect(scanner.queryByRole('button', { name: 'Add Item' })).not.toBeInTheDocument();
    axios.get.mockClear();

    fireEvent.click(scanner.getByRole('button', { name: 'Retry' }));
    expect(axios.get).toHaveBeenCalledExactlyOnceWith(ENDPOINTS.KI_INVENTORY_ITEMS);
    expect(scanner.getByLabelText('Barcode')).toHaveValue('0012345000058');
  });

  test.each([
    ['the backend message', { message: 'Item not found.' }, 'Item not found.'],
    ['the Axios message', {}, 'Request failed with status code 404'],
  ])('shows %s after a delete returns 404', async (_scenario, data, expectedMessage) => {
    axios.delete.mockRejectedValueOnce({
      message: 'Request failed with status code 404',
      response: { status: 404, data },
    });
    renderInventory([inventoryItem]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Update Item' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Update Inventory Item' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Item' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm Delete' }));

    expect(axios.delete).toHaveBeenCalledWith(ENDPOINTS.KI_INVENTORY_ITEM(inventoryItem._id));
    expect((await within(dialog).findByRole('alert')).textContent).toBe(expectedMessage);
    expect(dialog).toBeInTheDocument();
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
