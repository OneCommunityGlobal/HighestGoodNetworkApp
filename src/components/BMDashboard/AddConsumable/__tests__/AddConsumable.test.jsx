import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toast } from 'react-toastify';
import { vi } from 'vitest';

import AddConsumable from '../AddConsumable';
import { fetchInvUnits } from '../../../../actions/bmdashboard/invUnitActions';
import {
  fetchConsumableTypes,
  postBuildingConsumableType,
  resetPostBuildingConsumableTypeResult,
} from '../../../../actions/bmdashboard/invTypeActions';

vi.mock('../../../../actions/bmdashboard/invUnitActions');
vi.mock('../../../../actions/bmdashboard/invTypeActions');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockInvUnits = [
  { unit: 'kg', _id: '1' },
  { unit: 'lbs', _id: '2' },
  { unit: 'pieces', _id: '3' },
  { unit: 'meters', _id: '4' },
];

const initialState = {
  bmInvUnits: { list: mockInvUnits },
  bmInvTypes: { postedResult: null },
};

const renderComponent = (customState = {}) => {
  const storeState = { ...initialState, ...customState };
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <AddConsumable />
    </Provider>,
  );
};

describe('AddConsumable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchInvUnits.mockReturnValue({ type: 'FETCH_INV_UNITS' });
    fetchConsumableTypes.mockReturnValue({ type: 'FETCH_CONSUMABLE_TYPES' });
    postBuildingConsumableType.mockReturnValue({ type: 'POST_BUILDING_CONSUMABLE_TYPE' });
    resetPostBuildingConsumableTypeResult.mockReturnValue({
      type: 'RESET_POST_BUILDING_CONSUMABLE_TYPE_RESULT',
    });
  });

  describe('Initial Rendering', () => {
    it('renders the ADD CONSUMABLES FORM title', () => {
      renderComponent();
      expect(screen.getByText('ADD CONSUMABLES FORM')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderComponent();
      expect(screen.getByText(/Item Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Consumable Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Size \(optional\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Measurement/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Please check here if you want to enter a New Measurement/i),
      ).toBeInTheDocument();
    });

    it('has the Item Type field disabled with value "Consumable"', () => {
      renderComponent();
      const itemTypeInput = screen.getByDisplayValue('Consumable');
      expect(itemTypeInput).toBeDisabled();
    });

    it('has the Add Consumable button disabled initially', () => {
      renderComponent();
      const submitButton = screen.getByRole('button', { name: /Add Consumable/i });
      expect(submitButton).toBeDisabled();
    });

    it('dispatches fetchInvUnits on component mount', () => {
      renderComponent();
      expect(fetchInvUnits).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('shows error message for consumable name less than 4 characters', async () => {
      renderComponent();
      const nameInput = screen.getByPlaceholderText('Consumable Name');
      await userEvent.type(nameInput, 'abc');
      expect(
        screen.getByText(
          /Consumable "name" length must be at least 4 characters that are not space/i,
        ),
      ).toBeInTheDocument();
    });

    it('shows error message for description less than 10 characters', async () => {
      renderComponent();
      const descriptionInput = screen.getByPlaceholderText('Description');
      await userEvent.type(descriptionInput, 'short');
      expect(
        screen.getByText(
          /Consumable "description" length must be at least 10 characters that are not space/i,
        ),
      ).toBeInTheDocument();
    });

    it('shows error message for size containing only spaces', async () => {
      renderComponent();
      const sizeInput = screen.getByPlaceholderText('Size');
      await userEvent.type(sizeInput, '   ');
      expect(
        screen.getByText(
          /Consumable "size" can not be space. Can be left blank if not applicable/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('New Measurement Feature', () => {
    it('shows new measurement input when checkbox is checked', async () => {
      renderComponent();
      const checkbox = screen.getByLabelText(
        /Please check here if you want to enter a New Measurement/i,
      );
      await userEvent.click(checkbox);
      expect(screen.getByLabelText(/New Measurement Unit/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Unit')).toBeInTheDocument();
    });

    it('enables unit dropdown when new measurement checkbox is unchecked', async () => {
      renderComponent();
      const checkbox = screen.getByLabelText(
        /Please check here if you want to enter a New Measurement/i,
      );
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('allows entering a new unit when new measurement is enabled', async () => {
      renderComponent();
      const checkbox = screen.getByLabelText(
        /Please check here if you want to enter a New Measurement/i,
      );
      await userEvent.click(checkbox);
      const newUnitInput = screen.getByPlaceholderText('New Unit');
      await userEvent.type(newUnitInput, 'custom unit');
      expect(newUnitInput).toHaveValue('custom unit');
    });
  });

  describe('Success Handling', () => {
    it('shows success toast and resets form on successful submission', () => {
      const successState = {
        bmInvUnits: { list: mockInvUnits },
        bmInvTypes: {
          postedResult: { error: false, result: { name: 'Test Consumable', _id: '123' } },
        },
      };
      renderComponent(successState);
      expect(toast.success).toHaveBeenCalledWith(
        'Created a new Consumable Type "Test Consumable" successfully',
      );
      expect(fetchConsumableTypes).toHaveBeenCalled();
      expect(resetPostBuildingConsumableTypeResult).toHaveBeenCalled();
    });

    it('resets form fields after successful submission', () => {
      const successState = {
        bmInvUnits: { list: mockInvUnits },
        bmInvTypes: {
          postedResult: { error: false, result: { name: 'Test Consumable', _id: '123' } },
        },
      };
      renderComponent(successState);
      expect(screen.getByPlaceholderText('Consumable Name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Description')).toHaveValue('');
      expect(screen.getByPlaceholderText('Size')).toHaveValue('');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast on submission failure', () => {
      const errorState = {
        bmInvUnits: { list: mockInvUnits },
        bmInvTypes: {
          postedResult: { error: true, result: 'Something went wrong' },
        },
      };
      renderComponent(errorState);
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      expect(resetPostBuildingConsumableTypeResult).toHaveBeenCalled();
    });
  });

  describe('Input Field Updates', () => {
    it('updates consumable name field correctly', async () => {
      renderComponent();
      const nameInput = screen.getByPlaceholderText('Consumable Name');
      await userEvent.type(nameInput, 'New Consumable');
      expect(nameInput).toHaveValue('New Consumable');
    });

    it('updates description field correctly', async () => {
      renderComponent();
      const descriptionInput = screen.getByPlaceholderText('Description');
      await userEvent.type(descriptionInput, 'New description');
      expect(descriptionInput).toHaveValue('New description');
    });

    it('updates size field correctly', async () => {
      renderComponent();
      const sizeInput = screen.getByPlaceholderText('Size');
      await userEvent.type(sizeInput, 'Medium');
      expect(sizeInput).toHaveValue('Medium');
    });
  });
});
