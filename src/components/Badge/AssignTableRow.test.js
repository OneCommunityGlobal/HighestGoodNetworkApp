import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AssignTableRow from 'components/Badge/AssignTableRow';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

const addSelectBadge = jest.fn();
const removeSelectBadge = jest.fn();

const mockStore = configureStore();
const store = mockStore({});

const renderComponent = mockData => {
  return render(
    <Provider store={store}>
      <AssignTableRow
        badge={mockData.badge}
        selectedBadges={mockData.selectedBadges}
        index={mockData.index}
        addSelectBadge={addSelectBadge}
        removeSelectBadge={removeSelectBadge}
      />
    </Provider>,
  );
};

describe('AssignTableRow component', () => {
  const mockData = {
    badge: {
      _id: '1',
      imageUrl: 'image-url',
      badgeName: 'Badge Name',
      description: 'Badge Description',
    },
    selectedBadges: ['assign-badge-1'],
    index: 0,
  };

  it('renders AssignTableRow component', async () => {
    renderComponent(mockData);

    // Use getByRole with the role "checkbox"
    const checkbox = screen.getByRole('checkbox');

    // Add your assertions based on your component's rendering
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
  });

  it('handles checkbox change correctly when initially checked', async () => {
    renderComponent(mockData);

    // Use getByRole with the role "checkbox"
    const checkbox = screen.getByRole('checkbox');

    // Ensure checkbox is initially checked
    expect(checkbox).toHaveProperty('checked', true);

    fireEvent.click(checkbox);

    // Wait for the state to update
    await waitFor(() => {
      expect(checkbox).toHaveProperty('checked', false);
    });
  });

  it('handles checkbox change correctly when initially unchecked', async () => {
    const uncheckedMockData = {
      ...mockData,
      selectedBadges: [],
    };

    renderComponent(uncheckedMockData);

    const checkbox = screen.getByRole('checkbox');

    // Ensure checkbox is initially unchecked
    expect(checkbox).toHaveProperty('checked', false);

    fireEvent.click(checkbox);

    // Wait for the state to update
    await waitFor(() => {
      expect(checkbox).toHaveProperty('checked', true);
    });
  });

  it('renders without crashing when invalid badge ID is in selected badges', () => {
    const mockDataInvalidSelectedBadge = { ...mockData, selectedBadges: ['invalid-badge-id'] };
    renderComponent(mockDataInvalidSelectedBadge);

    // Check that the checkbox is rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Check that Badge Name is present despite the invalid badge ID
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
  });

  it('renders without crashing when selectedBadges prop is missing', () => {
    const mockDataWithoutSelectedBadges = { ...mockData, selectedBadges: undefined };
    renderComponent(mockDataWithoutSelectedBadges);

    // Check that the checkbox is rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Check that Badge Name is present despite the invalid badge ID
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
  });

  it('renders without crashing with incomplete or invalid badge data', () => {
    const mockDataInvalidBadge = { ...mockData, badge: {} };
    renderComponent(mockDataInvalidBadge);

    // Check that the checkbox is rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Check that Badge Name is not present due to incomplete/invalid badge data
    expect(screen.queryByText('Badge Name')).toBeNull();
  });

  it('renders without crashing with an invalid index', () => {
    const mockDataInvalidIndex = { ...mockData, index: 'invalid-index' };
    renderComponent(mockDataInvalidIndex);

    // Check that the checkbox is rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Check that Badge Name is present (assuming it should be unaffected by the invalid index)
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
  });

  it('renders without crashing with missing or invalid badge image URL', () => {
    const mockDataWithoutImage = { ...mockData, badge: { ...mockData.badge, imageUrl: undefined } };

    renderComponent(mockDataWithoutImage);

    // Check that the checkbox is rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // Check that Badge Name is present despite the missing image URL (assuming it should be unaffected)
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
  });
});
