import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CountryApplicationMap from './CountryApplicationMap';

// Mock react-simple-maps
jest.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }) => <div data-testid="composable-map">{children}</div>,
  Geographies: ({ children }) => <div data-testid="geographies">{children}</div>,
  Geography: ({ children, ...props }) => (
    <div data-testid="geography" {...props}>
      {children}
    </div>
  ),
}));

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { darkMode: false }) => state,
  },
});

const renderWithProvider = component => {
  return render(<Provider store={mockStore}>{component}</Provider>);
};

describe('CountryApplicationMap', () => {
  test('renders the map component with title', () => {
    renderWithProvider(<CountryApplicationMap />);

    expect(screen.getByText('Country of Application Map')).toBeInTheDocument();
    expect(
      screen.getByText('Interactive map showing application distribution by country'),
    ).toBeInTheDocument();
  });

  test('renders filter controls', () => {
    renderWithProvider(<CountryApplicationMap />);

    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByText('Roles (Multi-select)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Last 30 Days')).toBeInTheDocument();
  });

  test('renders map container', () => {
    renderWithProvider(<CountryApplicationMap />);

    expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    expect(screen.getByTestId('geographies')).toBeInTheDocument();
  });

  test('renders summary statistics', () => {
    renderWithProvider(<CountryApplicationMap />);

    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.getByText('Avg per Country')).toBeInTheDocument();
  });

  test('renders role checkboxes', () => {
    renderWithProvider(<CountryApplicationMap />);

    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Data Analyst')).toBeInTheDocument();
  });

  test('supports dark mode', () => {
    const darkModeStore = configureStore({
      reducer: {
        theme: (state = { darkMode: true }) => state,
      },
    });

    render(
      <Provider store={darkModeStore}>
        <CountryApplicationMap />
      </Provider>,
    );

    expect(screen.getByText('Country of Application Map')).toBeInTheDocument();
  });
});
