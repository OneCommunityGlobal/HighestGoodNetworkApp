import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from 'redux-mock-store';

import WBS from './wbs';
import { fetchAllWBS } from '../../../actions/wbs';
import { getProjectDetail } from '../../../actions/project';

vi.mock('../../../actions/wbs', () => ({
  __esModule: true,
  fetchAllWBS: vi.fn(projectId => ({ type: 'FETCH_ALL_WBS', payload: projectId })),
  setWBSStart: vi.fn(() => ({ type: 'SET_WBS_START' })),
  setWBS: vi.fn(data => ({ type: 'SET_WBS', payload: data })),
  addNewWBS: vi.fn(),
  setWBSError: vi.fn(),
}));

vi.mock('../../../actions/project', () => ({
  __esModule: true,
  getProjectDetail: vi.fn(projectId => ({ type: 'GET_PROJECT_DETAIL', payload: projectId })),
}));

vi.mock('./AddWBS', () => ({
  __esModule: true,
  default: () => <div data-testid="add-wbs">AddWBS Mock</div>,
}));

vi.mock('./WBSItem/WBSItem', () => ({
  __esModule: true,
  default: ({ index, name }) => (
    <tr data-testid={`wbs-item-${index}`}>
      <td>{index}</td>
      <td>{name}</td>
      <td></td>
    </tr>
  ),
}));

describe('WBS Component', () => {
  const mockStore = configureStore([]);
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
    store.dispatch = vi.fn();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <WBS match={{ params: { projectId } }} />
        </MemoryRouter>
      </Provider>
    );

  it('renders the WBS component without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Return to Project List/i)).toBeInTheDocument();
  });

  it('dispatches fetchAllWBS and getProjectDetail on mount', () => {
    renderComponent();
    expect(store.dispatch).toHaveBeenCalledWith(fetchAllWBS(projectId));
    expect(store.dispatch).toHaveBeenCalledWith(getProjectDetail(projectId));
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
    const backLink = screen.getByRole('link', { name: /Return to Project List/i });
    expect(backLink).toHaveAttribute('href', '/projects/');
    const backButton = screen.getByRole('button');
    expect(backButton).toHaveClass('btn-secondary');
  });

  it('renders table headers correctly', () => {
    renderComponent();
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
  
});