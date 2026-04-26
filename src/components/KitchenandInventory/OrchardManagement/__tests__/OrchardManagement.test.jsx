import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrchardManagement from '../OrchardManagement';

describe('OrchardManagement', () => {
  test('renders page title and subtitle', () => {
    render(<OrchardManagement />);

    expect(screen.getByText('Orchard Management')).toBeInTheDocument();
    expect(
      screen.getByText('Manage fruit trees, bushes, and orchard maintenance schedules.'),
    ).toBeInTheDocument();
  });

  test('renders all 4 summary cards with correct values', () => {
    render(<OrchardManagement />);

    expect(screen.getByText('Total Trees & Bushes')).toBeInTheDocument();
    expect(screen.getByText('Pending Orders')).toBeInTheDocument();
    expect(screen.getByText('Trimming Tasks')).toBeInTheDocument();
    expect(screen.getByText('Expected Harvests')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('renders all section tabs', () => {
    render(<OrchardManagement />);

    expect(screen.getByRole('button', { name: 'Trees & Bushes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Planting Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trimming Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Harvest Schedule' })).toBeInTheDocument();
  });

  test('shows Trees & Bushes section by default', () => {
    render(<OrchardManagement />);

    expect(screen.getByText('Orchard Inventory')).toBeInTheDocument();
    expect(screen.getByText('All trees and bushes in the orchard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Add Tree/Bush' })).toBeInTheDocument();
  });

  test('renders all orchard item cards in Trees & Bushes section', () => {
    render(<OrchardManagement />);

    expect(screen.getByText('Apple Tree (Honeycrisp)')).toBeInTheDocument();
    expect(screen.getByText('Pear Tree (Bartlett)')).toBeInTheDocument();
    expect(screen.getByText('Cherry Tree (Bing)')).toBeInTheDocument();
    expect(screen.getByText('Blueberry Bush')).toBeInTheDocument();
    expect(screen.getByText('Raspberry Bush')).toBeInTheDocument();
  });

  test('renders planted date labels and view details buttons for orchard cards', () => {
    render(<OrchardManagement />);

    expect(screen.getAllByText('Planted').length).toBe(5);
    expect(screen.getAllByRole('button', { name: 'View Details' }).length).toBe(5);
  });

  test('switches to Orders tab and hides orchard inventory', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

    expect(screen.getByRole('button', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.queryByText('Orchard Inventory')).not.toBeInTheDocument();
    expect(screen.queryByText('Apple Tree (Honeycrisp)')).not.toBeInTheDocument();
  });

  test('switches to Planting Schedule tab and shows placeholder title', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Planting Schedule' }));

    expect(screen.getByRole('button', { name: 'Planting Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planting Schedule' })).toBeInTheDocument();
    expect(screen.queryByText('Orchard Inventory')).not.toBeInTheDocument();
  });

  test('switches back to Trees & Bushes tab and shows orchard inventory again', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trees & Bushes' }));

    expect(screen.getByText('Orchard Inventory')).toBeInTheDocument();
    expect(screen.getByText('Apple Tree (Honeycrisp)')).toBeInTheDocument();
  });

  test('renders calculated ages as years for each orchard item', () => {
    render(<OrchardManagement />);

    const ageTexts = screen.getAllByText(/years$/i);
    expect(ageTexts.length).toBe(5);
  });
});
