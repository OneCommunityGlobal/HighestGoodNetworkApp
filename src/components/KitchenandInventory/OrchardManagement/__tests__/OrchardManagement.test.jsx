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
    expect(screen.getByRole('button', { name: 'Harvest Calendar' })).toBeInTheDocument();
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

    expect(screen.getAllByText('Planted')).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: 'View Details' })).toHaveLength(5);
  });

  test('switches to Orders tab and hides orchard inventory', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

    expect(screen.getByRole('heading', { name: 'Tree & Bush Orders' })).toBeInTheDocument();
    expect(screen.queryByText('Orchard Inventory')).not.toBeInTheDocument();
    expect(screen.queryByText('Apple Tree (Honeycrisp)')).not.toBeInTheDocument();
  });

  test('renders all initial orders in the Orders section', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getByText('Heritage Orchard Nursery')).toBeInTheDocument();
    expect(screen.getByText('2x Peach Trees, 1x Plum Tree')).toBeInTheDocument();

    expect(screen.getByText('OR-002')).toBeInTheDocument();
    expect(screen.getByText('Berry Best Plants')).toBeInTheDocument();
    expect(screen.getByText('5x Strawberry Plants')).toBeInTheDocument();
  });

  test('marks an ordered item as shipped', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Shipped' }));

    expect(screen.getAllByText('shipped', { selector: 'span' })).toHaveLength(2);

    expect(screen.getAllByRole('button', { name: 'Mark as Delivered' })).toHaveLength(2);
  });

  test('marks a shipped item as delivered and updates pending orders', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Shipped' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Mark as Delivered' })[0]);

    expect(screen.queryByText('OR-001')).not.toBeInTheDocument();
    expect(screen.getByText('OR-002')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('switches to Planting Schedule tab and displays planting tasks', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Planting Schedule' }));

    expect(screen.getByRole('heading', { name: 'Planting Schedule' })).toBeInTheDocument();

    expect(screen.getByText('2x Peach Trees')).toBeInTheDocument();
    expect(screen.getByText('1x Plum Tree')).toBeInTheDocument();
    expect(screen.getByText('5x Strawberry Plants')).toBeInTheDocument();

    expect(screen.queryByText('Orchard Inventory')).not.toBeInTheDocument();
  });

  test('adds a planting task', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Planting Schedule' }));

    expect(screen.queryAllByText('1x Apple Tree')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: '+ Add Planting Task' }));

    expect(screen.getByText('1x Apple Tree')).toBeInTheDocument();
    expect(screen.getByText('Row 1, Position 6')).toBeInTheDocument();
    expect(screen.getByText('Water thoroughly after planting')).toBeInTheDocument();
    expect(screen.getByText('2024-12-01')).toBeInTheDocument();
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

    expect(ageTexts).toHaveLength(5);
  });

  test('shows placeholder sections for Trimming Schedule and Harvest Calendar', () => {
    render(<OrchardManagement />);

    fireEvent.click(screen.getByRole('button', { name: 'Trimming Schedule' }));

    expect(screen.getByRole('heading', { name: 'Trimming Schedule' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Harvest Calendar' }));

    expect(screen.getByRole('heading', { name: 'Harvest Calendar' })).toBeInTheDocument();
  });
});
