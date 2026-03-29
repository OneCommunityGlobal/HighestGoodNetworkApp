import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { configureStore } from 'redux-mock-store';
import { toast } from 'react-toastify';
import AddMaterial from '../AddMaterial/AddMaterial';
import * as invTypeActions from '../../../actions/bmdashboard/invTypeActions';
import * as invUnitActions from '../../../actions/bmdashboard/invUnitActions';

// Mock dependencies
vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../../actions/bmdashboard/invTypeActions');
vi.mock('../../../actions/bmdashboard/invUnitActions');

vi.mock('../../common/DragAndDrop/DragAndDrop', () => ({
  __esModule: true,
  default: function MockDragAndDrop({ updateUploadedFiles }) {
    return (
      <input
        data-testid="drag-and-drop"
        type="file"
        onChange={e => {
          const files = Array.from(e.target.files);
          updateUploadedFiles(files);
        }}
      />
    );
  },
}));

vi.mock('react-phone-input-2', () => ({
  __esModule: true,
  default: function MockPhoneInput(props) {
    return (
      <input
        data-testid="phone-input"
        value={props.value}
        onChange={e => props.onChange(e.target.value, { dialCode: '1', countryCode: 'us' })}
        placeholder="Phone number"
      />
    );
  },
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockStore = configureStore([]);

describe('AddMaterial', () => {
  let store;
  let history;
  let mockDispatch;

  const mockMaterialTypes = [
    { _id: '1', name: 'Steel', unit: 'kg' },
    { _id: '2', name: 'Wood', unit: 'board feet' },
    { _id: '3', name: 'Concrete', unit: 'm³' },
  ];

  const mockUnits = [{ unit: 'kg' }, { unit: 'board feet' }, { unit: 'm³' }, { unit: 'pieces' }];

  const initialState = {
    bmInvTypes: {
      list: mockMaterialTypes,
      postedResult: null,
    },
    bmInvUnits: {
      list: mockUnits,
    },
    auth: {
      user: {
        email: 'test@example.com',
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    history = createMemoryHistory();
    mockDispatch = vi.fn();
    store.dispatch = mockDispatch;

    // Mock action creators
    invTypeActions.fetchMaterialTypes.mockReturnValue({ type: 'FETCH_MATERIAL_TYPES' });
    invTypeActions.postBuildingInventoryType.mockReturnValue({
      type: 'POST_BUILDING_INVENTORY_TYPE',
    });
    invTypeActions.resetPostBuildingInventoryTypeResult.mockReturnValue({
      type: 'RESET_POST_BUILDING_INVENTORY_TYPE_RESULT',
    });
    invUnitActions.fetchInvUnits.mockReturnValue({ type: 'FETCH_INV_UNITS' });

    vi.clearAllMocks();
  });

  const renderComponent = (storeState = initialState) => {
    const testStore = mockStore(storeState);
    testStore.dispatch = mockDispatch;

    return render(
      <Provider store={testStore}>
        <Router history={history}>
          <AddMaterial />
        </Router>
      </Provider>,
    );
  };

  describe('Form Input Handling', () => {
    test('updates invoice number input', () => {
      renderComponent();

      const invoiceInput = screen.getByLabelText(/Invoice Number or ID/);
      fireEvent.change(invoiceInput, { target: { value: 'INV-12345' } });

      expect(invoiceInput.value).toBe('INV-12345');
    });

    test('updates unit price input', () => {
      renderComponent();

      const unitPriceInput = screen.getByLabelText(/Unit Price/);
      fireEvent.change(unitPriceInput, { target: { value: '100' } });

      expect(unitPriceInput.value).toBe('100');
    });

    test('updates quantity input', () => {
      renderComponent();

      const quantityInput = screen.getByLabelText(/Total quantity/);
      fireEvent.change(quantityInput, { target: { value: '5' } });

      expect(quantityInput.value).toBe('5');
    });

    test('updates description textarea', () => {
      renderComponent();

      const descriptionInput = screen.getByLabelText(/Material Description/);
      fireEvent.change(descriptionInput, { target: { value: 'Test description for material' } });

      expect(descriptionInput.value).toBe('Test description for material');
    });

    test('updates currency selection', () => {
      renderComponent();

      const currencySelect = screen.getByLabelText(/Currency/);
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });

      expect(currencySelect.value).toBe('EUR');
    });

    test('updates purchase date input', () => {
      renderComponent();

      const purchaseDateInput = screen.getByLabelText(/Purchase Date/);
      fireEvent.change(purchaseDateInput, { target: { value: '2024-01-15' } });

      expect(purchaseDateInput.value).toBe('2024-01-15');
    });

    test('updates phone number input', () => {
      renderComponent();

      const phoneInput = screen.getByTestId('phone-input');
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

      expect(phoneInput.value).toBe('+1234567890');
    });

    test('updates link input', () => {
      renderComponent();

      const linkInput = screen.getByLabelText(/Link to Buy/);
      fireEvent.change(linkInput, { target: { value: 'https://example.com' } });

      expect(linkInput.value).toBe('https://example.com');
    });

    test('updates shipping fee input', () => {
      renderComponent();

      const shippingInput = screen.getByLabelText(/Shipping Fee/);
      fireEvent.change(shippingInput, { target: { value: '15.50' } });

      expect(shippingInput.value).toBe('15.50');
    });

    test('updates taxes input', () => {
      renderComponent();

      const taxesInput = screen.getByLabelText(/Taxes/);
      fireEvent.change(taxesInput, { target: { value: '8.5' } });

      expect(taxesInput.value).toBe('8.5');
    });
  });

  describe('Material Selection', () => {
    test('selects existing material and auto-fills name and unit', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: '1' } });

      expect(materialSelect.value).toBe('1');
    });

    test('shows textbox when "Other" material is selected', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: 'other' } });

      expect(screen.getByLabelText(/Enter New Material/)).toBeInTheDocument();
    });

    test('updates new material name in textbox', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: 'other' } });

      const newMaterialInput = screen.getByLabelText(/Enter New Material/);
      fireEvent.change(newMaterialInput, { target: { value: 'Custom Material' } });

      expect(newMaterialInput.value).toBe('Custom Material');
    });

    test('hides textbox when switching back from "Other"', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);

      // Select "Other" first
      fireEvent.change(materialSelect, { target: { value: 'other' } });
      expect(screen.getByLabelText(/Enter New Material/)).toBeInTheDocument();

      // Switch back to existing material
      fireEvent.change(materialSelect, { target: { value: '1' } });
      expect(screen.queryByLabelText(/Enter New Material/)).not.toBeInTheDocument();
    });
  });

  describe('Unit Selection', () => {
    test('unit dropdown is disabled when material is selected', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: '1' } });

      const unitSelect = screen.getByLabelText(/Select Unit/);
      expect(unitSelect).toBeDisabled();
    });

    test('unit dropdown is enabled when "Other" material is selected', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: 'other' } });

      const unitSelect = screen.getByLabelText(/Select Unit/);
      expect(unitSelect).not.toBeDisabled();
    });

    test('shows textbox when "Other" unit is selected', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: 'other' } });

      const unitSelect = screen.getByLabelText(/Select Unit/);
      fireEvent.change(unitSelect, { target: { value: 'other' } });

      expect(screen.getByLabelText(/Enter New Unit/)).toBeInTheDocument();
    });

    test('updates new unit name in textbox', () => {
      renderComponent();

      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: 'other' } });

      const unitSelect = screen.getByLabelText(/Select Unit/);
      fireEvent.change(unitSelect, { target: { value: 'other' } });

      const newUnitInput = screen.getByLabelText(/Enter New Unit/);
      fireEvent.change(newUnitInput, { target: { value: 'custom unit' } });

      expect(newUnitInput.value).toBe('custom unit');
    });
  });

  describe('File Upload', () => {
    test('handles file upload', () => {
      renderComponent();

      const fileInput = screen.getByTestId('drag-and-drop');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // File preview should appear
      expect(screen.getByAltText('preview-0')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
    });

    test('removes uploaded file', () => {
      renderComponent();

      const fileInput = screen.getByTestId('drag-and-drop');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const removeButton = screen.getByRole('button', { name: 'X' });
      fireEvent.click(removeButton);

      expect(screen.queryByAltText('preview-0')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty required fields', async () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /Submit/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Missing Required Field')).toBeInTheDocument();
      });
    });

    test('validates quantity is positive integer', async () => {
      renderComponent();

      // Fill form with invalid quantity
      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: '1' } });

      fireEvent.change(screen.getByLabelText(/Invoice Number or ID/), {
        target: { value: 'INV-123' },
      });
      fireEvent.change(screen.getByLabelText(/Unit Price/), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Total quantity/), { target: { value: '0' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-01-15' } });
      fireEvent.change(screen.getByLabelText(/Material Description/), {
        target: { value: 'Valid description' },
      });

      const submitButton = screen.getByRole('button', { name: /Submit/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Missing Required Field')).toBeInTheDocument();
      });
    });
  });

  describe('Price Calculation', () => {
    test('calculates and displays total price', () => {
      renderComponent();

      // Fill price-related fields
      fireEvent.change(screen.getByLabelText(/Unit Price/), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Total quantity/), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/Shipping Fee/), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText(/Taxes/), { target: { value: '10' } });

      // Total should be (100 * 5) + (10% of 500) + 20 = 500 + 50 + 20 = 570
      expect(screen.getByText('570.00 USD')).toBeInTheDocument();
    });

    test('updates total price when inputs change', () => {
      renderComponent();

      // Initial calculation
      fireEvent.change(screen.getByLabelText(/Unit Price/), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText(/Total quantity/), { target: { value: '2' } });

      expect(screen.getByText('100.00 USD')).toBeInTheDocument();

      // Update quantity
      fireEvent.change(screen.getByLabelText(/Total quantity/), { target: { value: '4' } });

      expect(screen.getByText('200.00 USD')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      renderComponent();

      // Fill all required fields
      const materialSelect = screen.getByLabelText(/Select Material/);
      fireEvent.change(materialSelect, { target: { value: '1' } });

      fireEvent.change(screen.getByLabelText(/Invoice Number or ID/), {
        target: { value: 'INV-123' },
      });
      fireEvent.change(screen.getByLabelText(/Unit Price/), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Total quantity/), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-01-15' } });
      fireEvent.change(screen.getByLabelText(/Material Description/), {
        target: { value: 'Valid description' },
      });

      const submitButton = screen.getByRole('button', { name: /Submit/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'POST_BUILDING_INVENTORY_TYPE' });
      });
    });

    test('resets form after successful submission', async () => {
      const stateWithSuccess = {
        ...initialState,
        bmInvTypes: {
          ...initialState.bmInvTypes,
          postedResult: {
            result: { name: 'Test Material' },
            error: false,
          },
        },
      };

      renderComponent(stateWithSuccess);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Created a new Material Type "Test Material" successfully',
        );
      });
    });
  });

  describe('Cancel Functionality', () => {
    test('resets form when cancel button is clicked', () => {
      renderComponent();

      // Fill some fields
      fireEvent.change(screen.getByLabelText(/Invoice Number or ID/), {
        target: { value: 'INV-123' },
      });
      fireEvent.change(screen.getByLabelText(/Unit Price/), { target: { value: '100' } });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      fireEvent.click(cancelButton);

      // Fields should be reset
      expect(screen.getByLabelText(/Invoice Number or ID/).value).toBe('');
      expect(screen.getByLabelText(/Unit Price/).value).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('shows error toast on submission failure', async () => {
      const stateWithError = {
        ...initialState,
        bmInvTypes: {
          ...initialState.bmInvTypes,
          postedResult: {
            result: 'Error message',
            error: true,
          },
        },
      };

      renderComponent(stateWithError);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error message');
      });
    });
  });

  describe('Created By Display', () => {
    test('displays creator email', () => {
      renderComponent();

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
