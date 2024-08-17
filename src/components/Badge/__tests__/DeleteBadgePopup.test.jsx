import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeleteBadgePopup from '../DeleteBadgePopup';

const mockStore = configureStore([]);

describe('DeleteBadgePopup Component', () => {
  let store;
  let mockSetDeletePopup;
  let mockDeleteBadge;

  beforeEach(() => {
    store = mockStore({
      theme: {
        darkMode: false, // or true to test dark mode
      },
    });
    mockSetDeletePopup = jest.fn();
    mockDeleteBadge = jest.fn();
  });

  const renderComponent = (darkMode = false, open = true) => {
    store = mockStore({
      theme: {
        darkMode,
      },
    });

    return render(
      <Provider store={store}>
        <DeleteBadgePopup
          open={open}
          setDeletePopup={mockSetDeletePopup}
          deleteBadge={mockDeleteBadge}
          badgeId={1}
          badgeName="Test Badge"
        />
      </Provider>
    );
  };

  test('renders correctly in light mode', () => {
    renderComponent(false);

    expect(screen.getByText(/Confirm Delete Badge/i)).toBeInTheDocument();
    expect(screen.getByText(/Hold up there Sparky/i)).toBeInTheDocument();
    expect(screen.getByText(/Badge Name: Test Badge/i)).toBeInTheDocument();
  });

  test('renders correctly in dark mode', () => {
    renderComponent(true);

    expect(screen.getByText(/Confirm Delete Badge/i)).toBeInTheDocument();
    expect(screen.getByText(/Hold up there Sparky/i)).toBeInTheDocument();
    expect(screen.getByText(/Badge Name: Test Badge/i)).toBeInTheDocument();
    // Add more assertions to check specific dark mode styles if necessary
  });

  test('calls deleteBadge and closes popup on delete', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(mockDeleteBadge).toHaveBeenCalledWith(1);
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
  });

  test('closes popup on cancel', () => {
    renderComponent();

    fireEvent.click(screen.getByText(/Cancel/i));

    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
    expect(mockDeleteBadge).not.toHaveBeenCalled();
  });

  test('closes popup when close button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText(/close/i)); // Assuming the close button has an aria-label="close"

    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
    expect(mockDeleteBadge).not.toHaveBeenCalled();
  });

  test('does not render modal when open is false', () => {
    renderComponent(false, false);

    expect(screen.queryByText(/Confirm Delete Badge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hold up there Sparky/i)).not.toBeInTheDocument();
  });

  test('toggles modal when toggle is called', () => {
    renderComponent();
  
    // Close the modal using the close button (X)
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
  
    // Click the delete button to confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
    expect(mockDeleteBadge).toHaveBeenCalledWith(1);
  });
  
});
