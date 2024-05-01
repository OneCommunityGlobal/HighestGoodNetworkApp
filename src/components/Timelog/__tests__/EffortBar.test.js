import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EffortBar from '../EffortBar';

const mockStore = configureStore([]);

describe('EffortBar Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      timeEntries: {
        period: [
          { isTangible: true, hours: '2', minutes: '30', projectId: '1' },
          { isTangible: false, hours: '1', minutes: '15', projectId: '2' }
        ],
        weeks: [
          // Populate with mock week data as per your application's structure
        ],
      },
    });
  });

  it('renders with default props', () => {
    render(
      <Provider store={store}>
        <EffortBar activeTab={4} projectsSelected={['all']} />
      </Provider>,
    );

    expect(screen.getByText(/Tangible Effort:/)).toBeInTheDocument();
    expect(screen.getByText(/Intangible Effort:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Effort:/)).toBeInTheDocument();
  });

  it('calculates and displays tangible and intangible effort times correctly', () => {
    render(
      <Provider store={store}>
        <EffortBar activeTab={4} projectsSelected={['all']} />
      </Provider>,
    );

    expect(screen.getByText(/Tangible Effort: 2.50 hrs/)).toBeInTheDocument();
    expect(screen.getByText(/Intangible Effort: 1.25 hrs/)).toBeInTheDocument();
  });

  it('calculates and displays the total effort time correctly', () => {
    render(
      <Provider store={store}>
        <EffortBar activeTab={4} projectsSelected={['all']} />
      </Provider>,
    );

    expect(screen.getByText(/Total Effort: 3.75 hrs/)).toBeInTheDocument();
  });
});
