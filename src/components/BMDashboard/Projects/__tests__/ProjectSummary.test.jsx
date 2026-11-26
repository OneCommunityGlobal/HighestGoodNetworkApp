import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProjectSummary from '../ProjectSummary';

const mockStore = configureStore([]);

const renderSummary = project => {
  const store = mockStore({ theme: { darkMode: false } });
  return render(
    <Provider store={store}>
      <ProjectSummary project={project} />
    </Provider>,
  );
};

describe('ProjectSummary', () => {
  it('renders project-specific values and rental data', () => {
    renderSummary({
      name: 'Project A',
      hoursWorked: 12,
      totalMaterialsCost: 125,
      totalEquipmentCost: 300,
      mostMaterialWaste: { stockWasted: 2, itemType: { unit: 'kg', name: 'Sand' } },
      mostMaterialBought: { stockBought: 10, itemType: { unit: 'kg', name: 'Sand' } },
      leastMaterialAvailable: { stockAvailable: 1, itemType: { unit: 'kg', name: 'Sand' } },
      rentalSummary: {
        itemName: 'Excavator 2',
        rentalDueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      },
    });

    expect(screen.getByText('125 USD')).toBeInTheDocument();
    expect(screen.getByText('300 USD')).toBeInTheDocument();
    expect(screen.getByText(/2 kg of Sand has been wasted/)).toBeInTheDocument();
    expect(screen.getByText(/Excavator 2 rental ends in 72 hours/)).toBeInTheDocument();
  });

  it('uses clear empty states when project records are missing', () => {
    renderSummary({ name: 'Empty Project', members: [] });

    expect(screen.getAllByText('No cost data recorded')).toHaveLength(2);
    expect(screen.getAllByText('No material data recorded')).toHaveLength(2);
    expect(screen.getByText('No rental data recorded')).toBeInTheDocument();
    expect(screen.getByText('No stock data recorded')).toBeInTheDocument();
  });
});
