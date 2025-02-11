import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import BMDashboard from '../BMDashboard';

// Import the fetchBMProjects action creator
import { fetchBMProjects as mockFetchBMProjects } from '../../../actions/bmdashboard/projectActions';

jest.mock('../../../actions/bmdashboard/projectActions');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockProjects = [
  {
    _id: '1',
    name: 'Project 1',
    hoursWorked: 100,
    totalMaterialsCost: 5000,
    totalEquipmentCost: 2000,
    mostMaterialWaste: {
      stockWasted: 50,
      itemType: { unit: 'kg', name: 'Material A' },
    },
    members: [{}, {}],
    mostMaterialBought: {
      stockBought: 100,
      itemType: { unit: 'kg', name: 'Material B' },
    },
    leastMaterialAvailable: {
      stockAvailable: 20,
      itemType: { unit: 'kg', name: 'Material C' },
    },
  },
  {
    _id: '2',
    name: 'Project 2',
    hoursWorked: 200,
    totalMaterialsCost: 9000,
    totalEquipmentCost: 7000,
    mostMaterialWaste: {
      stockWasted: 30,
      itemType: { unit: 'kg', name: 'Material A' },
    },
    members: [{}, {}],
    mostMaterialBought: {
      stockBought: 50,
      itemType: { unit: 'kg', name: 'Material B' },
    },
    leastMaterialAvailable: {
      stockAvailable: 10,
      itemType: { unit: 'kg', name: 'Material C' },
    },
  },
];

describe('BMDashboard Tests', () => {
  let store;

  beforeEach(() => {
    const initialState = {
      bmProjects: mockProjects,
      errors: {},
    };
    store = mockStore(initialState);
  });

  // Mock the fetchBMProjects action to return mock data
  beforeEach(() => {
    mockFetchBMProjects.mockReturnValue(() => ({
      type: 'FETCH_PROJECTS_SUCCESS',
      payload: mockProjects,
    }));
  });

  // Test Case 1: Renders BMDashboard and checks for header
  it('Renders BMDashboard and checks for header', () => {
    render(
      <Provider store={store}>
        <BMDashboard />
      </Provider>,
    );
    expect(screen.getByText('Building and Inventory Management Dashboard')).toBeInTheDocument();
  });

  // Skipping Test Case 2
  it.skip('Renders dropdown with project options', async () => {
    render(
      <Provider store={store}>
        <BMDashboard />
      </Provider>,
    );

    const dropdown = await screen.findByLabelText(/select projects/i);
    userEvent.click(dropdown);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  // Skipping Test Case 3
  it.skip('Shows an error message if no project is selected and the button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <BMDashboard />
        </BrowserRouter>
      </Provider>,
    );

    const button = await screen.findByRole('button', { name: /go to project dashboard/i });
    userEvent.click(button);

    expect(screen.getByText(/please select a project/i)).toBeInTheDocument();
  });

  // Skipping Test Case 4
  it.skip('Navigates to the correct project dashboard upon selecting a project and clicking the button', async () => {
    const history = createMemoryHistory();
    render(
      <Provider store={store}>
        <Router history={history}>
          <BMDashboard />
        </Router>
      </Provider>,
    );

    const selectDropdown = await screen.findByLabelText(/select projects/i);
    userEvent.selectOptions(selectDropdown, '1');

    const goToDashboardButton = await screen.findByRole('button', {
      name: /go to project dashboard/i,
    });
    userEvent.click(goToDashboardButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe('/bmdashboard/projects/1');
    });
  });
});
