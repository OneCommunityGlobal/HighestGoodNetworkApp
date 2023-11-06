import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AssignBadgePopup from 'components/Badge/AssignBadgePopup';
import { Provider } from 'react-redux';

const mockStore = configureStore([thunk]);

// Added mock badge data and can be changed according to your test.

const mockallBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer) ' },
  { _id: '3', badgeName: '40 HOURS 2-WEEK STREAK' },
  { _id: '4', badgeName: 'NO BLUE SQUARE FOR 3 MONTHS' },
  { _id: '5', badgeName: '2X MINIMUM HOURS' },
  { _id: '6', badgeName: 'Most Hours in A Week' },
];

const mockToggle = jest.fn();

const renderComponent = () => {
  const store = mockStore({
    badge: { allBadgeData: mockallBadgeData },
  });

  return render(
    <Provider store={store}>
      <AssignBadgePopup allBadgeData={mockallBadgeData} toggle={mockToggle} />
    </Provider>,
  );
};

describe('AssignBadgePopup component', () => {
  it('Renders without crashing', () => {
    // check if component is rendering without a crash
    renderComponent();
  });
  it('Check if search box for badges rendering correct results', () => {
    // When searched for a particular text, the results should change and the ones that do not match the keyword should be null

    renderComponent();
    const searchInput = screen.getByPlaceholderText('Search Badge Name');
    fireEvent.change(searchInput, { target: { value: 'hours' } });

    expect(screen.getByText('30 HOURS 3-WEEK STREAK')).toBeInTheDocument();
    expect(screen.getByText('40 HOURS 2-WEEK STREAK')).toBeInTheDocument();
    expect(screen.getByText('2X MINIMUM HOURS')).toBeInTheDocument();
    expect(screen.getByText('Most Hours in A Week')).toBeInTheDocument();

    expect(screen.queryByText('LEAD A TEAM OF 40+ (Trailblazer)')).toBeNull();
    expect(screen.queryByText('NO BLUE SQUARE FOR 3 MONTHS')).toBeNull();
  });
  it('Verify Badge and Name column is present', () => {
    // Badge and Name column should be present in the document

    renderComponent();
    expect(screen.getByText('Badge')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
  it('Check if tool tip renders the text when hovered', async () => {
    // Added mouse events to check if the tool tip shows the text when hovered over it and should not show any text if mouse is not hovered over it.

    const { container } = renderComponent();
    const iconElement = container.querySelector('.fa.fa-info-circle');

    fireEvent.mouseEnter(iconElement);

    await waitFor(() => {
      const updatedText = screen.getByRole('tooltip');
      expect(updatedText.textContent).toContain(
        'Hmmm, little blank boxes... what could they mean? Yep, you guessed it, check those boxes to select the badges you wish to assign a person. Click the "Confirm" button at the bottom when you\'ve selected all you wish to add.',
      );
      expect(updatedText.textContent).toContain(
        'Want to assign multiple of the same badge to a person? Repeat the process!!',
      );
    });

    fireEvent.mouseLeave(iconElement);
    await waitFor(() => {
      const updatedText = screen.queryByRole('tooltip');
      expect(updatedText).toBeNull();
    });
  });
  it('Check filtered badges', () => {
    // check the length of rows displayed from filteredBadges

    renderComponent();
    const assignTableRows = screen.getAllByRole('row');
    expect(assignTableRows.length).toBe(mockallBadgeData.length + 1);
  });
  it('Check if confirm button works as expected', () => {
    // simulated confirm button event to check if it works as expected

    renderComponent();
    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    expect(mockToggle).toHaveBeenCalled();
  });
});
