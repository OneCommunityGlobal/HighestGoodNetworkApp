import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import KIReorderItemModal, { validateReorderForm } from '../KIReorderItemModal';
import styles from '../KIReorderItem.module.css';

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
  onsite: false,
  expiryDate: getDateValue(30),
};

const defaultProps = {
  isOpen: true,
  item: inventoryItem,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  isSubmitting: false,
  submitError: '',
  darkMode: false,
};

const renderModal = props => {
  render(<KIReorderItemModal {...defaultProps} {...props} />);
};

describe('KIReorderItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows the selected item stock details', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Reorder Inventory Item' });
    expect(within(dialog).getByText('Tomatoes')).toBeInTheDocument();
    expect(within(dialog).getByText('5 lbs')).toBeInTheDocument();
    expect(within(dialog).getByText('3 lbs')).toBeInTheDocument();
    expect(within(dialog).getByText('Pantry')).toBeInTheDocument();
  });

  test.each([
    { label: 'empty', value: '' },
    { label: 'zero', value: '0' },
    { label: 'negative', value: '-4' },
  ])('rejects a $label order quantity', ({ value }) => {
    renderModal();

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    expect(
      screen.getByText('Order quantity must be a number greater than zero.'),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('rejects a non-numeric order quantity', () => {
    expect(
      validateReorderForm({ addedQuantity: 'not-a-number', newExpiry: '' }, inventoryItem),
    ).toEqual({
      addedQuantity: 'Order quantity must be a number greater than zero.',
    });
  });

  test('requires a future replacement expiry date for expired stock', () => {
    renderModal({
      item: {
        ...inventoryItem,
        expiryDate: getDateValue(-2),
      },
    });

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '6' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    expect(
      screen.getByText('A new expiry date is required for expired stock.'),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('rejects a new expiry date that is not in the future', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText('New expiry date (optional)'), {
      target: { value: getDateValue(0) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    expect(screen.getByText('New expiry date must be a future date.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('omits an empty optional expiry date and closes after success', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    renderModal({ onSubmit, onClose });

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '6.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('item-1', { addedQuantity: 6.5 });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('includes a future expiry date when supplied', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const futureExpiry = getDateValue(45);
    renderModal({
      item: { ...inventoryItem, expiryDate: getDateValue(-2) },
      onSubmit,
    });

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText('New expiry date (required)'), {
      target: { value: futureExpiry },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('item-1', {
        addedQuantity: 8,
        newExpiry: futureExpiry,
      });
    });
  });

  test('keeps the modal open and displays a submission error', async () => {
    renderModal({
      onSubmit: vi.fn().mockRejectedValue(new Error('Unable to update stock.')),
      onClose: vi.fn(),
    });

    fireEvent.change(screen.getByLabelText('Order quantity (lbs)'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reorder' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to update stock.');
    expect(screen.getByRole('dialog', { name: 'Reorder Inventory Item' })).toBeInTheDocument();
  });

  test('applies dark styling and keeps controls available at tablet width', () => {
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));
    renderModal({ darkMode: true });

    expect(screen.getByTestId('reorder-item-modal')).toHaveClass(
      styles.reorderItemModal,
      'dark-mode',
    );
    expect(screen.getByLabelText('Order quantity (lbs)')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Confirm Reorder' })).toBeEnabled();
  });
});
