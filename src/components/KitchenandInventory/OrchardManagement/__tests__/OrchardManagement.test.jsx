import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OrchardManagement from '../OrchardManagement';

// Keep the tests focused on the component's behavior rather than Reactstrap's
// portal, transition, and focus-trap implementation.
vi.mock('reactstrap', async () => {
  const ReactstrapReact = await import('react');

  function Modal({ isOpen, toggle, children, labelledBy, onClosed }) {
    const wasOpen = ReactstrapReact.useRef(false);

    ReactstrapReact.useEffect(() => {
      if (wasOpen.current && !isOpen) {
        onClosed?.();
      }
      wasOpen.current = isOpen;
    }, [isOpen, onClosed]);

    if (!isOpen) return null;

    return ReactstrapReact.createElement(
      'div',
      {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': labelledBy,
        tabIndex: -1,
      },
      children,
    );
  }

  function ModalHeader({ children, toggle }) {
    return ReactstrapReact.createElement(
      'h5',
      { className: 'mock-modal-header' },
      children,
      ReactstrapReact.createElement(
        'button',
        { type: 'button', 'aria-label': 'Close', onClick: toggle },
        '×',
      ),
    );
  }

  function ModalBody({ children }) {
    return ReactstrapReact.createElement('div', null, children);
  }

  return { Modal, ModalHeader, ModalBody };
});

afterEach(() => {
  vi.restoreAllMocks();
});

const openSection = async (user, sectionName) => {
  await user.click(screen.getByRole('button', { name: sectionName }));
};

describe('OrchardManagement', () => {
  it('renders the page heading, description, and summary metrics', () => {
    render(<OrchardManagement />);

    expect(screen.getByRole('heading', { name: 'Orchard Management' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage fruit trees, bushes, and orchard maintenance schedules.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Total Trees & Bushes')).toBeInTheDocument();
    expect(screen.getByText('Pending Orders')).toBeInTheDocument();
    expect(screen.getByText('Trimming Tasks')).toBeInTheDocument();
    expect(screen.getByText('Expected Harvests')).toBeInTheDocument();

    const metricValues = screen.getAllByText(/^(5|2|4|6)$/).map(element => element.textContent);

    expect(metricValues).toEqual(expect.arrayContaining(['5', '2', '4', '6']));
  });

  it('shows the tree and bush inventory by default', () => {
    render(<OrchardManagement />);

    expect(screen.getByRole('heading', { name: 'Orchard Inventory' })).toBeInTheDocument();
    expect(screen.getByText('Apple Tree (Honeycrisp)')).toBeInTheDocument();
    expect(screen.getByText('Pear Tree (Bartlett)')).toBeInTheDocument();
    expect(screen.getByText('Cherry Tree (Bing)')).toBeInTheDocument();
    expect(screen.getByText('Blueberry Bush')).toBeInTheDocument();
    expect(screen.getByText('Raspberry Bush')).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: 'View Details' })).toHaveLength(5);

    expect(screen.getByRole('button', { name: '+ Add Tree/Bush' })).toBeInTheDocument();
  });

  it('opens the tree details modal with the selected tree information', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await user.click(screen.getAllByRole('button', { name: 'View Details' })[0]);

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('heading', {
        name: /^Tree & Bush Details/,
      }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Apple Tree (Honeycrisp)')).toBeInTheDocument();
    expect(within(dialog).getByText('Row 1, Position 3')).toBeInTheDocument();
    expect(within(dialog).getByText('2022-04-15')).toBeInTheDocument();
    expect(within(dialog).getByText('excellent')).toBeInTheDocument();
    expect(within(dialog).getByText(/years/)).toBeInTheDocument();
  });

  it('closes the details modal using its close button and restores focus', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    const detailsButton = screen.getAllByRole('button', {
      name: 'View Details',
    })[0];

    await user.click(detailsButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(detailsButton).toHaveFocus();
    });
  });

  it('navigates to the Orders section and displays the initial orders', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    expect(screen.getByRole('heading', { name: 'Tree & Bush Orders' })).toBeInTheDocument();
    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getByText('OR-002')).toBeInTheDocument();
    expect(screen.getByText('Heritage Orchard Nursery')).toBeInTheDocument();
    expect(screen.getByText('Berry Best Plants')).toBeInTheDocument();
    expect(screen.getByText('ordered')).toBeInTheDocument();
    expect(screen.getByText('shipped')).toBeInTheDocument();
  });

  it('opens and closes the New Order form', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    await user.click(screen.getByRole('button', { name: '+ New Order' }));

    expect(screen.getByRole('textbox', { name: 'Supplier' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Items' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ordered date')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected delivery')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Order' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('button', { name: 'Save Order' })).not.toBeInTheDocument();
  });

  it('adds a new order and updates the pending order count', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    await user.click(screen.getByRole('button', { name: '+ New Order' }));

    await user.type(screen.getByRole('textbox', { name: 'Supplier' }), 'Green Valley Nursery');
    await user.type(screen.getByRole('textbox', { name: 'Items' }), '3x Lemon Trees');

    fireEvent.change(screen.getByLabelText('Ordered date'), {
      target: { value: '2026-11-01' },
    });

    fireEvent.change(screen.getByLabelText('Expected delivery'), {
      target: { value: '2026-12-01' },
    });

    await user.click(screen.getByRole('button', { name: 'Save Order' }));

    expect(screen.getByText('OR-003')).toBeInTheDocument();
    expect(screen.getByText('Green Valley Nursery')).toBeInTheDocument();
    expect(screen.getByText('3x Lemon Trees')).toBeInTheDocument();
    expect(screen.getByText('2026-12-01')).toBeInTheDocument();

    expect(screen.getByText('3', { exact: true })).toBeInTheDocument();
  });

  it('progresses an order from ordered to shipped to delivered', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getByText('ordered')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark as Shipped' }));

    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getAllByText('shipped')).toHaveLength(2);

    const deliveredButtons = screen.getAllByRole('button', {
      name: 'Mark as Delivered',
    });

    await user.click(deliveredButtons[0]);

    expect(screen.queryByText('OR-001')).not.toBeInTheDocument();
    expect(screen.getByText('OR-002')).toBeInTheDocument();
    expect(screen.getByText('1', { exact: true })).toBeInTheDocument();
  });

  it('opens the order details modal with the selected order information', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    await user.click(screen.getAllByRole('button', { name: 'View Details' })[0]);

    const dialog = screen.getByRole('dialog');

    expect(
      within(dialog).getByRole('heading', {
        name: /^Order Details/,
      }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('OR-001')).toBeInTheDocument();
    expect(within(dialog).getByText('Heritage Orchard Nursery')).toBeInTheDocument();
    expect(within(dialog).getByText('2x Peach Trees, 1x Plum Tree')).toBeInTheDocument();
    expect(within(dialog).getByText('ordered')).toBeInTheDocument();
    expect(within(dialog).getByText('2024-10-01')).toBeInTheDocument();
    expect(within(dialog).getByText('2024-11-15')).toBeInTheDocument();
  });

  it('shows the empty state when all orders have been delivered', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Orders');

    // Deliver the first order.
    await user.click(screen.getByRole('button', { name: 'Mark as Shipped' }));

    await user.click(screen.getAllByRole('button', { name: 'Mark as Delivered' })[0]);

    // The remaining order is already shipped.
    await user.click(screen.getByRole('button', { name: 'Mark as Delivered' }));

    expect(screen.getByText('No pending orders.')).toBeInTheDocument();
    expect(screen.getByText('0', { exact: true })).toBeInTheDocument();
  });

  it('navigates to the Planting Schedule and displays the initial tasks', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Planting Schedule');

    expect(screen.getByRole('heading', { name: 'Planting Schedule' })).toBeInTheDocument();
    expect(screen.getByText('2x Peach Trees')).toBeInTheDocument();
    expect(screen.getByText('1x Plum Tree')).toBeInTheDocument();
    expect(screen.getByText('5x Strawberry Plants')).toBeInTheDocument();
    expect(screen.getByText('Requires full sun')).toBeInTheDocument();
    expect(screen.getByText('Add compost before planting')).toBeInTheDocument();
  });

  it('opens and closes the Add Planting Task form', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Planting Schedule');

    await user.click(screen.getByRole('button', { name: '+ Add Planting Task' }));

    expect(screen.getByRole('textbox', { name: 'Plant name' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Row' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Position' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled date')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('button', { name: 'Save Planting Task' })).not.toBeInTheDocument();
  });

  it('adds a planting task with the submitted details', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Planting Schedule');

    await user.click(screen.getByRole('button', { name: '+ Add Planting Task' }));

    await user.type(screen.getByRole('textbox', { name: 'Plant name' }), 'Orange Trees');

    await user.clear(screen.getByRole('spinbutton', { name: 'Quantity' }));

    await user.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '3');

    await user.type(screen.getByRole('spinbutton', { name: 'Row' }), '5');

    await user.type(screen.getByRole('spinbutton', { name: 'Position' }), '2');

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Water regularly');

    fireEvent.change(screen.getByLabelText('Scheduled date'), {
      target: { value: '2026-12-15' },
    });

    await user.click(screen.getByRole('button', { name: 'Save Planting Task' }));

    expect(screen.getByText('3x Orange Trees')).toBeInTheDocument();
    expect(screen.getByText('Row 5, Position 2')).toBeInTheDocument();
    expect(screen.getByText('Water regularly')).toBeInTheDocument();
    expect(screen.getByText('2026-12-15')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Save Planting Task' })).not.toBeInTheDocument();
  });

  it('uses the default note when a planting task is submitted without notes', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Planting Schedule');

    await user.click(screen.getByRole('button', { name: '+ Add Planting Task' }));

    await user.type(screen.getByRole('textbox', { name: 'Plant name' }), 'Fig Tree');

    await user.type(screen.getByRole('spinbutton', { name: 'Row' }), '6');

    await user.type(screen.getByRole('spinbutton', { name: 'Position' }), '1');

    fireEvent.change(screen.getByLabelText('Scheduled date'), {
      target: { value: '2026-12-20' },
    });

    await user.click(screen.getByRole('button', { name: 'Save Planting Task' }));

    expect(screen.getByText('1x Fig Tree')).toBeInTheDocument();
    expect(screen.getByText('No notes provided')).toBeInTheDocument();
  });

  it('shows the placeholder content for Trimming Schedule and Harvest Calendar', async () => {
    const user = userEvent;
    render(<OrchardManagement />);

    await openSection(user, 'Trimming Schedule');

    expect(screen.getByRole('heading', { name: 'Trimming Schedule' })).toBeInTheDocument();

    await openSection(user, 'Harvest Calendar');

    expect(screen.getByRole('heading', { name: 'Harvest Calendar' })).toBeInTheDocument();
  });
});
