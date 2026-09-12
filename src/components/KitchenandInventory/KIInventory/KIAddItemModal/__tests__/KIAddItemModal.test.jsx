import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KIAddItemModal from '../KIAddItemModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  categoryLabel: 'ingredients',
  categoryValue: 'INGREDIENT',
  isSubmitting: false,
  submitError: '',
  darkMode: false,
};

const renderModal = props => {
  const mergedProps = { ...defaultProps, ...props };
  render(<KIAddItemModal {...mergedProps} />);
};

const getDateValue = daysFromToday => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Tomatoes' } });
  fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Vegetables' } });
  fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'lbs' } });
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Pantry' } });
  fireEvent.change(screen.getByLabelText('Current stock'), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText('Stored quantity'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Reorder threshold'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Monthly usage'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Expiry date'), { target: { value: getDateValue(30) } });
};

describe('KIAddItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the selected category when open', () => {
    renderModal({
      categoryLabel: 'equipment & supplies',
      categoryValue: 'EQUIPEMENTANDSUPPLIES',
    });

    expect(screen.getByRole('dialog', { name: 'Add Inventory Item' })).toBeInTheDocument();
    expect(screen.getByText('equipment & supplies')).toBeInTheDocument();
  });

  test('validates required fields before submitting', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByText('Item name is required.')).toBeInTheDocument();
    expect(screen.getByText('Current stock must be a non-negative number.')).toBeInTheDocument();
    expect(screen.getByText('Expiry date is required.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('validates stored quantity against current stock', () => {
    renderModal();

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Stored quantity'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(
      screen.getByText('Stored quantity must be greater than or equal to current stock.'),
    ).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('validates that last harvest date is not in the future', () => {
    renderModal();

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Last harvest date'), {
      target: { value: getDateValue(12) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByText('Last harvest date cannot be in the future.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('submits the payload and closes after a successful add', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    renderModal({ onSubmit, onClose });

    fillRequiredFields();
    fireEvent.click(screen.getByLabelText('Onsite grown'));
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tomatoes',
          type: 'Vegetables',
          unit: 'lbs',
          location: 'Pantry',
          category: 'INGREDIENT',
          onsite: true,
          presentQuantity: 5,
          storedQuantity: 10,
          reorderAt: 3,
          monthlyUsage: 2,
          expiryDate: getDateValue(30),
        }),
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('omits empty optional fields from the add payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    renderModal({ onSubmit });

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedPayload = onSubmit.mock.calls[0][0];
    expect(submittedPayload).not.toHaveProperty('lastHarvestDate');
    expect(submittedPayload).not.toHaveProperty('nextHarvestDate');
    expect(submittedPayload).not.toHaveProperty('nextHarvestQuantity');
  });

  test('keeps the modal open and shows an error when submit fails', async () => {
    renderModal({
      onSubmit: vi.fn().mockRejectedValue(new Error('Server rejected item')),
      onClose: vi.fn(),
    });

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server rejected item');
    expect(screen.getByRole('dialog', { name: 'Add Inventory Item' })).toBeInTheDocument();
  });
});
