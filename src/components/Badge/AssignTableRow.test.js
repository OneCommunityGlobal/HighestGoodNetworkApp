import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AssignTableRow from 'components/Badge/AssignTableRow';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Mock the redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

const mockStore = configureStore([thunk]);

const renderComponent = (props, initialState = {}) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
<<<<<<< HEAD
      <AssignTableRow
        badge={mockData.badge}
        existBadges={mockData.selectedBadges}
        index={mockData.index}
        addSelectBadge={addSelectBadge}
        removeSelectBadge={removeSelectBadge}
      />
=======
      <table>
        <tbody>
          <AssignTableRow {...props} />
        </tbody>
      </table>
>>>>>>> development
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
    index: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-redux').useSelector.mockReturnValue([]);
  });

  it('renders AssignTableRow component', () => {
    renderComponent(mockData);
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles checkbox change correctly when initially unchecked', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);

    renderComponent(mockData);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_SELECT_BADGE',
        badgeId: 'assign-badge-1',
      }),
    );
  });

  it('handles checkbox change correctly when initially checked', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue(['assign-badge-1']);

    renderComponent(mockData);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'REMOVE_SELECT_BADGE',
        badgeId: 'assign-badge-1',
      }),
    );
  });

  it('renders without crashing when invalid badge ID is in selected badges', () => {
    require('react-redux').useSelector.mockReturnValue(['invalid-badge-id']);
    renderComponent(mockData);
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders without crashing when selectedBadges prop is missing', () => {
    require('react-redux').useSelector.mockReturnValue(undefined);
    renderComponent({ badge: mockData.badge, index: mockData.index });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders without crashing with incomplete or invalid badge data', () => {
    renderComponent({ badge: {}, index: 0 });
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders without crashing with an invalid index', () => {
    renderComponent({ ...mockData, index: 'invalid-index' });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders without crashing with missing or invalid badge image URL', () => {
    renderComponent({ badge: { ...mockData.badge, imageUrl: undefined }, index: 0 });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
