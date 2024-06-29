import React from 'react';
import { render, screen } from '@testing-library/react';
import { WbsTable } from 'components/Reports/WbsTable';

describe('WbsTable Component', () => {
  const mockWbsData = {
    fetched: true,
    WBSItems: [
      { _id: '1', wbsName: 'WBS Item 1', isActive: true },
      { _id: '2', wbsName: 'WBS Item 2', isActive: false },
    ],
  };

  it('renders WbsTable component with WBS items', () => {
    const { getByText } = render(<WbsTable wbs={mockWbsData} skip={0} take={5} />);

    // Check if WBS items are rendered
    const wbsItem1 = getByText('WBS Item 1');
    const wbsItem2 = getByText('WBS Item 2');
    expect(wbsItem1).toBeInTheDocument();
    expect(wbsItem2).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    const { getByText } = render(<WbsTable wbs={mockWbsData} skip={0} take={5} />);

    // Check if table headers are rendered
    const header1 = getByText('#');
    const header2 = getByText('Name');
    const header3 = getByText('Active');
    const header4 = getByText('ID');

    expect(header1).toBeInTheDocument();
    expect(header2).toBeInTheDocument();
    expect(header3).toBeInTheDocument();
    expect(header4).toBeInTheDocument();
  });

  it('renders WBS items within specified range', () => {
    const mockWbsRangeData = {
      fetched: true,
      WBSItems: [
        { _id: '1', wbsName: 'WBS Item 1', isActive: true },
        { _id: '2', wbsName: 'WBS Item 2', isActive: false },
        { _id: '3', wbsName: 'WBS Item 3', isActive: true },
        { _id: '4', wbsName: 'WBS Item 4', isActive: false },
      ],
    };

    const skip = 1;
    const take = 2;

    const { queryByText } = render(<WbsTable wbs={mockWbsRangeData} skip={skip} take={take} />);

    // Ensure WBS items within specified range are rendered
    const wbsItem1 = queryByText('WBS Item 1');
    const wbsItem2 = queryByText('WBS Item 2');
    const wbsItem3 = queryByText('WBS Item 3');
    const wbsItem4 = queryByText('WBS Item 4');

    expect(wbsItem1).toBeNull();
    expect(wbsItem2).toBeInTheDocument();
    expect(wbsItem3).toBeInTheDocument();
    expect(wbsItem4).toBeNull();
  });

  it('renders paginated WBS items', () => {
    const mockWbsPaginatedData = {
      fetched: true,
      WBSItems: [
        { _id: '1', wbsName: 'WBS 1', isActive: true },
        { _id: '2', wbsName: 'WBS 2', isActive: false },
        { _id: '3', wbsName: 'WBS 3', isActive: true },
        { _id: '4', wbsName: 'WBS 4', isActive: false },
      ],
    };

    const { queryByText } = render(<WbsTable wbs={mockWbsPaginatedData} skip={1} take={2} />);

    // Check that WBS item 'WBS 1' is not rendered (as it's skipped)
    const wbsItem1 = queryByText('WBS 1');
    expect(wbsItem1).toBeNull();

    // Check for specific paginated WBS item text content
    const wbsItem2 = queryByText('WBS 2');
    expect(wbsItem2).toBeInTheDocument();

    const wbsItem3 = queryByText('WBS 3');
    expect(wbsItem3).toBeInTheDocument();

    // Check that WBS item 'WBS 4' is not rendered (as it's beyond the take limit)
    const wbsItem4 = queryByText('WBS 4');
    expect(wbsItem4).toBeNull();
  });

  it('renders WBS items with truncated IDs when window width is less than 1100', () => {
    const mockWbsTruncatedData = {
      fetched: true,
      WBSItems: [
        { _id: '1234567890', wbsName: 'WBS Item 1', isActive: true },
        { _id: '0987654321', wbsName: 'WBS Item 2', isActive: false },
      ],
    };

    global.innerWidth = 1000; // Set innerWidth to simulate smaller window

    render(<WbsTable wbs={mockWbsTruncatedData} skip={0} take={5} />);

    // Check if the IDs are truncated when window width is less than 1100
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
    expect(screen.queryByText('1234567890')).toHaveTextContent('1234567890'.substring(0, 10));
    expect(screen.queryByText('0987654321')).toHaveTextContent('0987654321'.substring(0, 10));
  });

  it('renders table with WBS items', () => {
    const { container } = render(<WbsTable wbs={mockWbsData} skip={0} take={2} />);
    const tableRows = container.querySelectorAll('.wbs-table-row');

    expect(tableRows.length).toBe(3); // Ensure all WBS items are rendered
  });

  it('renders "Active" icon for active WBS item', () => {
    const { container } = render(<WbsTable wbs={mockWbsData} skip={0} take={2} />);
    const activeIcon = container.querySelector('.isActive');

    expect(activeIcon).toBeInTheDocument(); // Ensure the "Active" icon is rendered
  });

  it('renders "Inactive" icon for inactive WBS item', () => {
    const { container } = render(<WbsTable wbs={mockWbsData} skip={0} take={2} />);
    const inactiveIcon = container.querySelector('.isNotActive');

    expect(inactiveIcon).toBeInTheDocument(); // Ensure the "Inactive" icon is rendered
  });
});
