import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OrchardManagement from '../OrchardManagement';

// Keep tests focused on component behavior rather than Reactstrap internals.
vi.mock('reactstrap', async () => {
  const ReactstrapReact = await import('react');

  function Modal({ isOpen, children, labelledBy, onClosed }) {
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

const renderPage = async sectionName => {
  render(<OrchardManagement />);

  if (sectionName) {
    await userEvent.click(screen.getByRole('button', { name: sectionName }));
  }
};

const openForm = async buttonName => {
  await userEvent.click(screen.getByRole('button', { name: buttonName }));
};

const changeDate = (label, value) => {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value },
  });
};

const expectHeading = name => {
  expect(screen.getByRole('heading', { name })).toBeInTheDocument();
};

describe('OrchardManagement', () => {
  it('renders the page heading, description, and summary metrics', async () => {
    await renderPage();

    expectHeading('Orchard Management');
    expect(
      screen.getByText('Manage fruit trees, bushes, and orchard maintenance schedules.'),
    ).toBeInTheDocument();

    [
      'Total Trees & Bushes',
      'Pending Orders',
      'Trimming Tasks',
      'Expected Harvests',
    ].forEach(metric => expect(screen.getByText(metric)).toBeInTheDocument());

    const metricValues = screen.getAllByText(/^(5|2|4|6)$/).map(element => element.textContent);
    expect(metricValues).toEqual(expect.arrayContaining(['5', '2', '4', '6']));
  });

  it('shows the tree and bush inventory by default', async () => {
    await renderPage();

    expectHeading('Orchard Inventory');

    [
      'Apple Tree (Honeycrisp)',
      'Pear Tree (Bartlett)',
      'Cherry Tree (Bing)',
      'Blueberry Bush',
      'Raspberry Bush',
    ].forEach(name => expect(screen.getByText(name)).toBeInTheDocument());

    expect(screen.getAllByRole('button', { name: 'View Details' })).toHaveLength(5);
    expect(screen.getByRole('button', { name: '+ Add Tree/Bush' })).toBeInTheDocument();
  });

  it('opens the tree details modal with the selected tree information', async () => {
    await renderPage();

    await userEvent.click(screen.getAllByRole('button', { name: 'View Details' })[0]);

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('heading', { name: /^Tree & Bush Details/ }),
    ).toBeInTheDocument();

    ['Apple Tree (Honeycrisp)', 'Row 1, Position 3', '2022-04-15', 'excellent'].forEach(detail =>
      expect(within(dialog).getByText(detail)).toBeInTheDocument(),
    );

    expect(within(dialog).getByText(/years/)).toBeInTheDocument();
  });

  it('closes the details modal using its close button and restores focus', async () => {
    await renderPage();

    const detailsButton = screen.getAllByRole('button', { name: 'View Details' })[0];

    await userEvent.click(detailsButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(detailsButton).toHaveFocus();
    });
  });

  it('navigates to the Orders section and displays the initial orders', async () => {
    await renderPage('Orders');

    expectHeading('Tree & Bush Orders');

    [
      'OR-001',
      'OR-002',
      'Heritage Orchard Nursery',
      'Berry Best Plants',
      'ordered',
      'shipped',
    ].forEach(value => expect(screen.getByText(value)).toBeInTheDocument());
  });

  it('opens and closes the New Order form', async () => {
    await renderPage('Orders');

    await openForm('+ New Order');

    ['Supplier', 'Items'].forEach(label => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });

    ['Ordered date', 'Expected delivery'].forEach(label => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Save Order' })).toBeInTheDocument();

    await openForm('Cancel');

    expect(screen.queryByRole('button', { name: 'Save Order' })).toBeNull();
  });

  it('adds a new order and updates the pending order count', async () => {
    await renderPage('Orders');

    await openForm('+ New Order');

    await userEvent.type(screen.getByRole('textbox', { name: 'Supplier' }), 'Green Valley Nursery');
    await userEvent.type(screen.getByRole('textbox', { name: 'Items' }), '3x Lemon Trees');

    changeDate('Ordered date', '2026-11-01');
    changeDate('Expected delivery', '2026-12-01');

    await openForm('Save Order');

    ['OR-003', 'Green Valley Nursery', '3x Lemon Trees', '2026-12-01'].forEach(value => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });

    expect(screen.getByText('3', { exact: true })).toBeInTheDocument();
  });

  it('progresses an order from ordered to shipped to delivered', async () => {
    await renderPage('Orders');

    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getByText('ordered')).toBeInTheDocument();

    await openForm('Mark as Shipped');

    expect(screen.getByText('OR-001')).toBeInTheDocument();
    expect(screen.getAllByText('shipped')).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('button', { name: 'Mark as Delivered' })[0]);

    expect(screen.queryByText('OR-001')).toBeNull();
    expect(screen.getByText('OR-002')).toBeInTheDocument();
    expect(screen.getByText('1', { exact: true })).toBeInTheDocument();
  });

  it('opens the order details modal with the selected order information', async () => {
    await renderPage('Orders');

    await userEvent.click(screen.getAllByRole('button', { name: 'View Details' })[0]);

    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByRole('heading', { name: /^Order Details/ })).toBeInTheDocument();

    [
      'OR-001',
      'Heritage Orchard Nursery',
      '2x Peach Trees, 1x Plum Tree',
      'ordered',
      '2024-10-01',
      '2024-11-15',
    ].forEach(value => expect(within(dialog).getByText(value)).toBeInTheDocument());
  });

  it('shows the empty state when all orders have been delivered', async () => {
    await renderPage('Orders');

    await openForm('Mark as Shipped');
    await userEvent.click(screen.getAllByRole('button', { name: 'Mark as Delivered' })[0]);
    await openForm('Mark as Delivered');

    expect(screen.getByText('No pending orders.')).toBeInTheDocument();
    expect(screen.getByText('0', { exact: true })).toBeInTheDocument();
  });

  it('navigates to the Planting Schedule and displays the initial tasks', async () => {
    await renderPage('Planting Schedule');

    expectHeading('Planting Schedule');

    [
      '2x Peach Trees',
      '1x Plum Tree',
      '5x Strawberry Plants',
      'Requires full sun',
      'Add compost before planting',
    ].forEach(value => expect(screen.getByText(value)).toBeInTheDocument());
  });

  it('opens and closes the Add Planting Task form', async () => {
    await renderPage('Planting Schedule');

    await openForm('+ Add Planting Task');

    ['Plant name', 'Notes'].forEach(label => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });

    ['Quantity', 'Row', 'Position'].forEach(label => {
      expect(screen.getByRole('spinbutton', { name: label })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Scheduled date')).toBeInTheDocument();

    await openForm('Cancel');

    expect(screen.queryByRole('button', { name: 'Save Planting Task' })).toBeNull();
  });

  it('adds a planting task with the submitted details', async () => {
    await renderPage('Planting Schedule');

    await openForm('+ Add Planting Task');

    await userEvent.type(screen.getByRole('textbox', { name: 'Plant name' }), 'Orange Trees');

    await userEvent.clear(screen.getByRole('spinbutton', { name: 'Quantity' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '3');

    await userEvent.type(screen.getByRole('spinbutton', { name: 'Row' }), '5');
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Position' }), '2');
    await userEvent.type(screen.getByRole('textbox', { name: 'Notes' }), 'Water regularly');

    changeDate('Scheduled date', '2026-12-15');

    await openForm('Save Planting Task');

    ['3x Orange Trees', 'Row 5, Position 2', 'Water regularly', '2026-12-15'].forEach(value =>
      expect(screen.getByText(value)).toBeInTheDocument(),
    );

    expect(screen.queryByRole('button', { name: 'Save Planting Task' })).toBeNull();
  });

  it('uses the default note when a planting task is submitted without notes', async () => {
    await renderPage('Planting Schedule');

    await openForm('+ Add Planting Task');

    await userEvent.type(screen.getByRole('textbox', { name: 'Plant name' }), 'Fig Tree');
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Row' }), '6');
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Position' }), '1');

    changeDate('Scheduled date', '2026-12-20');

    await openForm('Save Planting Task');

    expect(screen.getByText('1x Fig Tree')).toBeInTheDocument();
    expect(screen.getByText('No notes provided')).toBeInTheDocument();
  });

  it('shows the placeholder content for Trimming Schedule and Harvest Calendar', async () => {
    await renderPage('Trimming Schedule');

    expectHeading('Trimming Schedule');

    await userEvent.click(screen.getByRole('button', { name: 'Harvest Calendar' }));

    expectHeading('Harvest Calendar');
  });
});
