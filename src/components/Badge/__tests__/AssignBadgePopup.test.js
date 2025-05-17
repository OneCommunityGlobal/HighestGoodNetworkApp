import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AssignBadgePopup from 'components/Badge/AssignBadgePopup';
import { Provider } from 'react-redux';
import { themeMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

const mockallBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer) ' },
  { _id: '3', badgeName: '40 HOURS 2-WEEK STREAK' },
  { _id: '4', badgeName: 'NO BLUE SQUARE FOR 3 MONTHS' },
  { _id: '5', badgeName: '2X MINIMUM HOURS' },
  { _id: '6', badgeName: 'Most Hours in A Week' },
];

const mockSubmit = jest.fn();

const renderComponent = (initialSelectedBadges = []) => {
  const store = mockStore({
    badge: { allBadgeData: mockallBadgeData, selectedBadges: initialSelectedBadges },
    theme: themeMock,
  });

  return render(
    <Provider store={store}>
      <AssignBadgePopup allBadgeData={mockallBadgeData} submit={mockSubmit} />
    </Provider>,
  );
};

describe('AssignBadgePopup component', () => {
  it('Renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Badge')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('Check if search box for badges rendering correct results', () => {
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
    renderComponent();
    expect(screen.getByText('Badge')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('Check if tool tip renders the text when hovered', async () => {
    const { container } = renderComponent();
    const iconElement = container.querySelector('.fa.fa-info-circle');

    fireEvent.mouseEnter(iconElement);

    await waitFor(() => {
      const updatedText = screen.getByRole('tooltip');
      expect(updatedText.textContent).toContain(
        'Check those boxes to select the badges you wish to assign a person. Click the "Confirm" button at the bottom when you\'ve selected all you wish to add.',
      );
      expect(updatedText.textContent).toContain(
        'Want to assign multiple of the same badge to a person? Repeat the process!',
      );
    });

    fireEvent.mouseLeave(iconElement);
    await waitFor(() => {
      const updatedText = screen.queryByRole('tooltip');
      expect(updatedText).toBeNull();
    });
  });

  it('Check filtered badges', () => {
    renderComponent();
    const assignTableRows = screen.getAllByRole('row');
    expect(assignTableRows.length).toBe(mockallBadgeData.length + 1);
  });

  it('Check if confirm button is disabled when no badges are selected', () => {
    renderComponent();
    const buttonElement = screen.getByRole('button', { name: /confirm/i });
    expect(buttonElement).toBeDisabled();
  });

  it('Check if confirm button is enabled when badges are selected', () => {
    renderComponent(['assign-badge-1']);
    const buttonElement = screen.getByRole('button', { name: /confirm/i });
    expect(buttonElement).not.toBeDisabled();
  });

  it('Check if confirm button works as expected when enabled', () => {
    renderComponent(['assign-badge-1']);
    const buttonElement = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(buttonElement);
    expect(mockSubmit).toHaveBeenCalled();
  });
});
