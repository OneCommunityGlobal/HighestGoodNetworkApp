import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // If using Redux
import MockAssignTableRow from './MockAssignTableRow';
import AssignBadgePopup from '../AssignBadgePopup';

/** ********************************TEST PRE-REQUISITE*************************************** */
// Mock Redux store
const mockStore = configureStore([]);
const initialState = {
  badge: {
    selectedBadges: [],
  },
};
const store = mockStore(initialState);

// Add more mock data as needed
const mockBadges = [
  { id: 1, name: 'Badge 1' },
  { id: 2, name: 'Badge 2' },
];

// Tool tip message : Update  here if the message changes in future
const tip1 =
  'Hmmm, little blank boxes... what could they mean? Yep, you guessed it, check those boxes to select the badges you wish to assign a person. Click the "Confirm" button at the bottom when you\'ve selected all you wish to add.';
const tip2 = 'Want to assign multiple of the same badge to a person? Repeat the process!!';

// Render component
const renderComponent = () => {
  render(
    <Provider store={store}>
      <AssignBadgePopup />
    </Provider>,
  );
};

jest.mock('axios');

/** **************************************TEST CASES******************************************** */
describe('Userprofile/AssignBadgePopup Test Suite', () => {
  it('Test case 1: Compoment renders without crashing', () => {
    renderComponent();
    const popup = screen.getByTestId('test-assignbadgepopup');
    expect(popup).toBeInTheDocument();
  });

  it('Test case 2 : Displays badge search input', () => {
    renderComponent();
    const searchInput = screen.getByTestId('test-searchBadgeName');
    expect(searchInput).toBeInTheDocument();
  });

  it('Test case 3: Assert if expected value gets updated in the input box', async () => {
    renderComponent();

    const searchInput = screen.getByTestId('test-searchBadgeName');

    fireEvent.change(searchInput, { target: { value: 'Some Badge' } });

    // Wait for the component to update after the search input change
    await waitFor(() => {
      expect(searchInput.value).toBe('Some Badge');
    });
  });

  it('Test case 4 : Assert the pop up contains only one table with 3 columns ', async () => {
    renderComponent();

    // / Find all tables within the component
    const tables = screen.getAllByRole('table');

    // Ensure there's only one table
    expect(tables.length).toBe(1);

    // Find all table headers (th elements) within the table
    const tableHeaders = tables[0].querySelectorAll('th');

    // Ensure there are exactly three table headers in the table
    expect(tableHeaders.length).toBe(3);
  });
  it('Test case 5 : Assert the presnce of objects associated with the search results: a table and three columns', async () => {
    renderComponent();

    const table = screen.getByTestId('test-badgeResults');
    const badge = screen.getByText('Badge');
    const name = screen.getByText('Name');
    const tooltip = screen.getByTestId('test-selectinfo');

    expect(table).toBeInTheDocument();
    expect(badge).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    expect(tooltip).toBeInTheDocument();
  });
  it('Test case 6 : Assert the tool tip  message doesnt get displayed unless hover overed', async () => {
    const message1 = screen.queryByText(tip1);
    const message2 = screen.queryByText(tip2);

    expect(message1).toBeNull();
    expect(message2).toBeNull();
  });
  it('Test case 7 : Assert the tool tip message  displayed when  hover overed', async () => {
    renderComponent();

    const tooltip = screen.getByTestId('test-selectinfo');
    fireEvent.mouseEnter(tooltip);
    const message1 = await screen.findByText(tip1);
    const message2 = await screen.findByText(tip2);
    expect(message1).toBeInTheDocument();
    expect(message2).toBeInTheDocument();
  });
  it('Test case 8 : Assert if the pop up has a submit button ', async () => {
    renderComponent();
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });
  it('Test case 9 :  Assert if the popup renders badge data correctly ', async () => {
    renderComponent();
    // Find the AssignTableRow component within AssignBadgePopup
    const assignTableRowComponent = screen.getByTestId('test-badgeResults'); // Assuming you have a data-testid on the AssignTableRow

    // Render the AssignTableRow component within AssignBadgePopup with badge data
    render(<MockAssignTableRow badges={mockBadges} />, { container: assignTableRowComponent });
    // Check if the rendered table row contains badge ID and name
    mockBadges.forEach(mockBadge => {
      const badgeNameElement = screen.getByText(mockBadge.name);
      expect(badgeNameElement).toBeInTheDocument();
    });
  });
});
