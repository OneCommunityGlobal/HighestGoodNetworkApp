import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import configureStore from 'redux-mock-store';
import WBS from './wbs';
import { setWBSStart, setWBS } from '../../../actions/wbs';



jest.mock('../../../actions/wbs', () => ({
  addNewWBS: jest.fn(),
  fetchAllWBS: jest.fn(),
  setWBSStart: jest.fn(() => ({ type: 'SET_WBS_START' })),
  setWBS: jest.fn(data => ({ type: 'SET_WBS', payload: data })),
  setWBSError: jest.fn(err => ({ type: 'SET_WBS_ERROR', payload: err })),
}));

jest.mock('axios');
jest.mock('./AddWBS', () => () => <div data-testid="add-wbs">AddWBS Mock</div>);
jest.mock('./WBSItem/WBSItem', () => ({ index, name }) => (
  <tr data-testid={`wbs-item-${index}`}>{name}</tr>
));

const mockStore = configureStore([]);

describe('WBS Component', () => {
  let store;
  const projectId = 'project123';

  const initialState = {
    theme: { darkMode: false },
    wbs: {
      WBSItems: [
        { _id: 'wbs1', wbsName: 'WBS 1' },
        { _id: 'wbs2', wbsName: 'WBS 2' },
      ],
    },
    auth: {
      user: {
        permissions: {
          frontPermissions: ['deleteWbs', 'addWbs', 'fetchAllWBS'],
          backPermissions: [],
        },
        role: "Manager",
      },
    },
    role: { roles: [] },
    popupEditor: { currPopup: { popupContent: 'wbs content 1' } },
    infoCollections: { loading: false },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    store.dispatch = jest.fn();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <WBS match={{ params: { projectId } }} />
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders the WBS component without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
  });

  it('dispatches setWBSStart and setWBS when fetchAllWBS is called on mount', async () => {
    const mockWBSData = [{ _id: 'wbs1', wbsName: 'WBS 1' }];
    axios.get.mockResolvedValueOnce({ data: mockWBSData });

    renderComponent();

    expect(store.dispatch).toHaveBeenCalledWith(setWBSStart());

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(setWBS(mockWBSData));
    });
  });


  it('renders AddWBS component', () => {
    renderComponent();
    expect(screen.getByTestId('add-wbs')).toBeInTheDocument();
  });

  it('renders WBS items', () => {
    renderComponent();
    expect(screen.getByTestId('wbs-item-1')).toBeInTheDocument();
    expect(screen.getByText('WBS 1')).toBeInTheDocument();
    expect(screen.getByTestId('wbs-item-2')).toBeInTheDocument();
    expect(screen.getByText('WBS 2')).toBeInTheDocument();
  });

  it('renders breadcrumb with correct link', () => {
    renderComponent();
    const backLink = screen.getByRole('link', { name: '' });
    expect(backLink).toHaveAttribute('href', '/projects/');
    const backButton = screen.getByRole('button');
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveClass('btn-secondary');
  });

  it('renders table headers correctly', () => {
    renderComponent();
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
  
});