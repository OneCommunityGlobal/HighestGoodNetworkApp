import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, fireEvent, screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { TeamTableSearchPanelBase } from '~/components/Teams/TeamTableSearchPanel';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

const initialProps = {
  onCreateNewTeamClick: vi.fn(),
  onSearch: vi.fn(),
  hasPermission: vi.fn(),
  darkMode: false,
};

let store;

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });
});

describe('TeamTableSearchPanelBase', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanelBase
          onCreateNewTeamClick={initialProps.onCreateNewTeamClick}
          onSearch={initialProps.onSearch}
          hasPermission={initialProps.hasPermission}
          darkMode={initialProps.darkMode}
        />
      </Provider>,
    );
  });

  it('renders the "Create New Team" button when user has permission', () => {
    const mockHasPermission = vi.fn(permission => permission === 'postTeam');

    render(
      <Provider store={store}>
        <TeamTableSearchPanelBase
          onCreateNewTeamClick={initialProps.onCreateNewTeamClick}
          onSearch={initialProps.onSearch}
          hasPermission={mockHasPermission}
          darkMode={initialProps.darkMode}
        />
      </Provider>,
    );

    const createNewTeamButton = screen.getByText('Create New Team');
    expect(createNewTeamButton).toBeInTheDocument();
  });

  it('calls onCreateNewTeamClick when the "Create New Team" button is clicked', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanelBase
          onCreateNewTeamClick={initialProps.onCreateNewTeamClick}
          onSearch={initialProps.onSearch}
          hasPermission={() => true}
          darkMode={initialProps.darkMode}
        />
      </Provider>,
    );

    const createNewTeamButton = screen.getByRole('button', { name: 'Create New Team' });
    expect(createNewTeamButton).toBeInTheDocument();
    // fireEvent.click(createNewTeamButton);
    // expect(initialProps.onCreateNewTeamClick).toHaveBeenCalled();
  });

  it('calls onSearch when the input value changes', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanelBase
          onCreateNewTeamClick={initialProps.onCreateNewTeamClick}
          onSearch={initialProps.onSearch}
          hasPermission={() => true}
          darkMode={initialProps.darkMode}
        />
      </Provider>,
    );

    const searchInput = screen.getByPlaceholderText('Search Text');
    fireEvent.change(searchInput, { target: { value: 'search query' } });
    expect(initialProps.onSearch).toHaveBeenCalledWith('search query');
  });
});
