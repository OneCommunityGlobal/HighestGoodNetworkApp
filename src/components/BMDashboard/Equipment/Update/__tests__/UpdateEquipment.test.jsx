import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Route } from 'react-router-dom';
import UpdateEquipment from '../UpdateEquipment';

vi.mock('~/actions/bmdashboard/equipmentActions', () => ({
  fetchEquipmentById: () => ({ type: 'FETCH_EQUIPMENT' }),
  updateEquipment: () => ({ type: 'UPDATE_EQUIPMENT' }),
}));
vi.mock('~/components/BMDashboard/shared/CheckTypesModal', () => ({
  default: () => null,
}));
vi.mock('~/components/common/Radio', () => ({ default: () => null }));
vi.mock('~/components/common/DragAndDrop/DragAndDrop', () => ({
  default: () => null,
}));
vi.mock('~/components/common/Image/Image', () => ({ default: () => null }));
vi.mock('~/components/common/FilePreview/FilePreview', () => ({
  default: () => null,
}));

const equipmentId = '507f1f77bcf86cd799439011';

function renderUpdateEquipment(purchaseStatus) {
  const initialState = {
    bmEquipments: {
      singleEquipment: {
        _id: equipmentId,
        purchaseStatus,
        itemType: { name: 'Excavator', category: 'Equipment' },
      },
    },
    theme: { darkMode: false },
  };
  const store = createStore((state = initialState) => state);

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/bmdashboard/tools/${equipmentId}/update`]}>
        <Route path="/bmdashboard/tools/:equipmentId/update">
          <UpdateEquipment />
        </Route>
      </MemoryRouter>
    </Provider>,
  );
}

describe('Update equipment rental details', () => {
  it.each(['Rental', 'Rented'])('shows rental-only fields for %s equipment', purchaseStatus => {
    renderUpdateEquipment(purchaseStatus);
    expect(screen.getByText('Rental End Date')).toBeInTheDocument();
    expect(screen.getByText('Days Left')).toBeInTheDocument();
  });

  it.each(['Purchased', 'Purchase', 'Needed'])(
    'hides rental-only fields for %s equipment',
    purchaseStatus => {
      renderUpdateEquipment(purchaseStatus);
      expect(screen.queryByText('Rental End Date')).not.toBeInTheDocument();
      expect(screen.queryByText('Days Left')).not.toBeInTheDocument();
    },
  );
});
