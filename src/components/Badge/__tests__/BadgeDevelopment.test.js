import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BadgeDevelopment from '../BadgeDevelopment';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

const mockStore = configureStore([thunk]);

// mock data used for testing purpose. You can add your own data to test the component.

const store = mockStore({
  badge: {
    allBadgeData: [],
  },
  allProjects: {
    projects: [],
  },
});

describe('BadgeDevelopment component', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment allBadgeData={[]} />
      </Provider>,
    );
  });
  it('shows modal elements when Create New Badge button is clicked', () => {
    const { container } = render(
      <Provider store={store}>
        <BadgeDevelopment allBadgeData={[]} />
      </Provider>,
    );
    const buttonElement = container.querySelector('.btn--dark-sea-green.btn.btn-secondary');
    fireEvent.click(buttonElement);
    const newBadgeElement = screen.getByText('New Badge');
    expect(newBadgeElement).toBeInTheDocument();
  });
  it('does not show modal elements when Create New Badge button is not clicked', () => {
    render(
      <Provider store={store}>
        <BadgeDevelopment allBadgeData={[]} />
      </Provider>,
    );
    const newBadgeElement = screen.queryByText('New Badge');
    expect(newBadgeElement).not.toBeInTheDocument();
  });
});
