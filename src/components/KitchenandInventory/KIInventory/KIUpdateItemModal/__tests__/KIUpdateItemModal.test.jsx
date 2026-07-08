import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KIUpdateItemModal from '../KIUpdateItemModal';

const getDateValue = daysFromToday => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const defaultItem = {
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
  lastHarvestDate: getDateValue(-7),
  nextHarvestDate: getDateValue(14),
  nextHarvestQuantity: 6,
};

const defaultProps = {
  isOpen: true,
  item: defaultItem,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  onDelete: vi.fn(),
  categoryLabel: 'ingredients',
  categoryValue: 'INGREDIENT',
  isSubmitting: false,
  isDeleting: false,
  submitError: '',
  deleteError: '',
  darkMode: false,
};

const renderModal = props => {
  const mergedProps = { ...defaultProps, ...props };
  render(<KIUpdateItemModal {...mergedProps} />);
};

describe('KIUpdateItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders selected item values when open', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Update Inventory Item' })).toBeInTheDocument();
    expect(screen.getByText('ingredients')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tomatoes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pantry')).toBeInTheDocument();
    expect(screen.getByLabelText('Onsite grown')).toBeChecked();
  });

  test('validates required fields before submitting', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Stored quantity'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.getByText('Item name is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Stored quantity must be greater than or equal to current stock.'),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('submits the edited payload and closes after a successful update', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    renderModal({ onSubmit, onClose });

    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Roma Tomatoes' } });
    fireEvent.change(screen.getByLabelText('Current stock'), { target: { value: '7' } });
    fireEvent.click(screen.getByLabelText('Onsite grown'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({
          name: 'Roma Tomatoes',
          type: 'Vegetables',
          unit: 'lbs',
          location: 'Pantry',
          category: 'INGREDIENT',
          onsite: false,
          presentQuantity: 7,
          storedQuantity: 10,
          reorderAt: 3,
          monthlyUsage: 2,
          expiryDate: getDateValue(30),
        }),
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('requires confirmation before deleting the item', async () => {
    const onDelete = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    renderModal({ onDelete, onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Item' }));

    expect(screen.getByText('Delete Tomatoes? This cannot be undone.')).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('item-1');
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('keeps the modal open and shows an error when delete fails', async () => {
    renderModal({
      onDelete: vi.fn().mockRejectedValue(new Error('Server rejected delete')),
      onClose: vi.fn(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server rejected delete');
    expect(screen.getByRole('dialog', { name: 'Update Inventory Item' })).toBeInTheDocument();
  });

  test('keeps the modal open and shows an error when update fails', async () => {
    renderModal({
      onSubmit: vi.fn().mockRejectedValue(new Error('Server rejected update')),
      onClose: vi.fn(),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server rejected update');
    expect(screen.getByRole('dialog', { name: 'Update Inventory Item' })).toBeInTheDocument();
  });
});
