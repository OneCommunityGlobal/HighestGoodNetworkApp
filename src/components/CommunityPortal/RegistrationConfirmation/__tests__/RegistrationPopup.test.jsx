import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { toast } from 'react-toastify';
import RegistrationPopup from '../RegistrationPopup';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useHistory: () => ({
      push: mockPush,
    }),
  };
});

const mockStore = configureMockStore([]);

const renderPopup = (props = {}, initialState = { theme: { darkMode: false } }) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegistrationPopup {...props} />
      </MemoryRouter>
    </Provider>,
  );
};

describe('RegistrationPopup component', () => {
  const mockActivity = {
    id: '42',
    name: 'Permaculture Design Workshop',
    date: 'Saturday, April 18th, 2026',
    time: '2:00 PM CST',
    location: 'Community Garden',
    description: 'Learn permaculture principles.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  test('renders default fallback values when props are omitted', () => {
    renderPopup();
    expect(screen.getByText('Thank you for Registering!')).toBeInTheDocument();
    expect(screen.getByText('Event Name')).toBeInTheDocument();
    expect(screen.getByText("User's Full Name")).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, January 7th, 2025/)).toBeInTheDocument();
  });

  test('renders dynamic event and user information correctly', () => {
    renderPopup({
      activity: mockActivity,
      userName: 'Linlin Fan',
      userEmail: 'linlin@example.com',
    });

    expect(screen.getByText('Permaculture Design Workshop')).toBeInTheDocument();
    expect(screen.getByText('Linlin Fan')).toBeInTheDocument();
    expect(screen.getByText(/Saturday, April 18th, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/2:00 PM CST/)).toBeInTheDocument();
    expect(screen.getByText(/Community Garden/)).toBeInTheDocument();
  });

  test('navigates to event details and calls onClose when clicking details button', () => {
    const handleClose = vi.fn();
    renderPopup({
      activity: mockActivity,
      onClose: handleClose,
    });

    const detailsBtn = screen.getByText('(Click for more details)');
    fireEvent.click(detailsBtn);

    expect(mockPush).toHaveBeenCalledWith('/communityportal/activities/42');
    expect(handleClose).toHaveBeenCalled();
  });

  test('triggers calendar .ics download and success toast on "Add to my calendar"', () => {
    renderPopup({
      activity: mockActivity,
    });

    const calendarBtn = screen.getByText('Add to my calendar');
    fireEvent.click(calendarBtn);

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Calendar event downloaded!');
  });

  test('notifies user on "View details in Email"', () => {
    renderPopup({
      activity: mockActivity,
      userEmail: 'linlin@example.com',
    });

    const emailBtn = screen.getByText('View details in Email');
    fireEvent.click(emailBtn);

    expect(toast.info).toHaveBeenCalledWith(
      'Registration details have been sent to linlin@example.com',
    );
  });

  test('downloads registration ticket on "Download Ticket"', () => {
    renderPopup({
      activity: mockActivity,
      userName: 'Linlin Fan',
      userEmail: 'linlin@example.com',
    });

    const downloadBtn = screen.getByText('Download Ticket');
    fireEvent.click(downloadBtn);

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Ticket downloaded successfully!');
  });

  test('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderPopup({ onClose: handleClose });

    const closeBtn = screen.getByRole('button', { name: /close registration popup/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop overlay is clicked', () => {
    const handleClose = vi.fn();
    renderPopup({ onClose: handleClose });

    const overlay = screen.getByTestId('popup-overlay');
    fireEvent.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    renderPopup({ onClose: handleClose });

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('applies darkMode class when theme.darkMode is true', () => {
    renderPopup({}, { theme: { darkMode: true } });
    expect(screen.getByTestId('popup-wrapper').className).toMatch(/darkMode/);
  });
});
