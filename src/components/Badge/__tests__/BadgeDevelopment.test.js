import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BadgeDevelopment from '../BadgeDevelopment';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

// Mock the BadgeDevelopmentTable and CreateNewBadgePopup components
jest.mock('components/Badge/BadgeDevelopmentTable', () => () => <div>BadgeDevelopmentTable</div>);
jest.mock('components/Badge/CreateNewBadgePopup', () => () => <div>CreateNewBadgePopup</div>);

describe('BadgeDevelopment Component', () => {
  const mockStore = configureStore([]);
  const initialState = {
    theme: themeMock,
  };
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('Should render without crashing', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment />
      </Provider>,
    );
    expect(screen.getByText('Create New Badge')).toBeInTheDocument();
  });

  it('Should open the create new badge popup when the button is clicked', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
  });

  it('should render the BadgeDevelopmentTable component', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment />
      </Provider>,
    );
    const table = document.querySelector('.table');
    expect(table);
  });

  it('should close the New Badge popup when the button is clicked', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    fireEvent.click(screen.getByText('New Badge'));
    expect(screen.getByText('Create New Badge'));
  });
});
