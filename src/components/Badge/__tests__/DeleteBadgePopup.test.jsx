import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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
        darkMode: false,
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
          badgeId="mockBadgeId"
          badgeName="Mock Badge"
        />
      </Provider>
    );
  };

  test('renders DeleteBadgePopup component in light mode', () => {
    renderComponent(false);

    expect(screen.getByText('Confirm Delete Badge')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this badge/i)).toBeInTheDocument();
    expect(screen.getByText(/badge name: mock badge/i)).toBeInTheDocument();
    expect(screen.getByText(/consider your next move carefully/i)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('renders DeleteBadgePopup component in dark mode', () => {
    renderComponent(true);

    expect(screen.getByText('Confirm Delete Badge')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this badge/i)).toBeInTheDocument();
    expect(screen.getByText(/badge name: mock badge/i)).toBeInTheDocument();
    expect(screen.getByText(/consider your next move carefully/i)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls setDeletePopup when Cancel button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
    expect(mockDeleteBadge).not.toHaveBeenCalled();
  });

  test('calls deleteBadge and setDeletePopup when Delete button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Delete'));

    expect(mockDeleteBadge).toHaveBeenCalledWith('mockBadgeId');
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
  });

  test('closes popup when close button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText(/close/i)); 
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

    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
    expect(mockDeleteBadge).toHaveBeenCalledWith('mockBadgeId');
  });

  test('closes modal when header close button is clicked', () => {
    renderComponent();
  
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
  });

  test('does not crash when badgeId is null or undefined', () => {
    render(
      <Provider store={store}>
        <DeleteBadgePopup
          open={true}
          setDeletePopup={mockSetDeletePopup}
          deleteBadge={mockDeleteBadge}
          badgeId={null}
          badgeName="Test Badge"
        />
      </Provider>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(mockDeleteBadge).toHaveBeenCalledWith(null);
    expect(mockSetDeletePopup).toHaveBeenCalledWith(false);
  });
  test('applies correct styles in light mode', () => {
    renderComponent(false);
  
    expect(screen.getByText(/Confirm Delete Badge/i)).not.toHaveClass('bg-space-cadet');
    expect(screen.getByText(/Hold up there Sparky/i).parentElement).not.toHaveClass('bg-yinmn-blue');
    expect(screen.getByRole('button', { name: /Delete/i })).toHaveClass('btn-danger');
  });
  
  test('applies correct styles in dark mode', () => {
    renderComponent(true);
  
    const header = screen.getByText(/Confirm Delete Badge/i).closest('.modal-header');
    expect(header).toHaveClass('bg-space-cadet');
  
    const body = screen.getByText(/Hold up there Sparky/i).closest('.modal-body');
    expect(body).toHaveClass('bg-yinmn-blue');
  
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    expect(deleteButton).toHaveClass('btn-danger');
  });
  
  
  test('handles empty badge name gracefully', () => {
    render(
      <Provider store={store}>
        <DeleteBadgePopup
          open={true}
          setDeletePopup={mockSetDeletePopup}
          deleteBadge={mockDeleteBadge}
          badgeId="mockBadgeId"
          badgeName=""
        />
      </Provider>
    );
  
    const badgeNameElement = screen.getByText(/Badge Name:/i);
    expect(badgeNameElement).toBeInTheDocument();
    expect(badgeNameElement.textContent).toBe('Badge Name: ');
  });
  
});
