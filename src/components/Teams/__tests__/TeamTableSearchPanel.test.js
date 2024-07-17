import React from 'react';
import TeamTableSearchPanel from 'components/Teams/TeamTableSearchPanel';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, fireEvent, screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

const initialProps = {
  onCreateNewTeamClick: jest.fn(),
  onSearch: jest.fn(),
};

let store;

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });
});

describe('TeamTableSearchPanel', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanel />;
      </Provider>,
    );
  });

  it('renders the "Create New Team" button when user has permission', () => {
    const { getByRole } = render(
      <Provider store={store}>
        <TeamTableSearchPanel hasPermission={() => true} />;
      </Provider>,
    );

    const createNewTeamButton = getByRole('button', { name: 'Create New Team' });
    expect(createNewTeamButton).toBeInTheDocument();
  });

  it('does not render the "Create New Team" button when user does not have permission', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanel hasPermission={() => false} />;
      </Provider>,
    );

    const createNewTeamButton = screen.queryByText('Create New Team');
    expect(createNewTeamButton).toBeNull;
  });

  it('calls onCreateNewTeamClick when the "Create New Team" button is clicked', () => {
    const { getByRole } = render(
      <Provider store={store}>
        <TeamTableSearchPanel {...initialProps} />;
      </Provider>,
    );

    const createNewTeamButton = getByRole('button', { name: 'Create New Team' });
    fireEvent.click(createNewTeamButton);
    expect(initialProps.onCreateNewTeamClick).toHaveBeenCalled();
  });

  it('calls onSearch when the input value changes', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <TeamTableSearchPanel {...initialProps} />;
      </Provider>,
    );

    const searchInput = getByPlaceholderText('Search Text');
    fireEvent.change(searchInput, { target: { value: 'search query' } });
    expect(initialProps.onSearch).toHaveBeenCalledWith('search query');
  });
});
