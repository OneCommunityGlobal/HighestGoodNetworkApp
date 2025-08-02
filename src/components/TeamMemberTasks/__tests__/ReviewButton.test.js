import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import * as redux from 'react-redux';
import ReviewButton from '../ReviewButton';
import * as xssProtection from '../../../utils/xssProtection';

jest.mock('../../../utils/URL', () => ({
  ApiEndpoint: 'http://localhost:5000/api',
}));

jest.mock('../../../services/httpService', () => ({
  post: jest.fn(),
}));

jest.mock('../../../utils/permissions', () => () => true);

jest.mock('../../../utils/xssProtection', () => ({
  sanitizeURL: jest.fn(url => {
    // Mock implementation that returns the URL if it's valid, empty string if invalid
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return '';
  }),
}));

const mockDispatch = jest.fn(fn => fn);

const mockUseSelector = jest.spyOn(redux, 'useSelector');
const mockUseDispatch = jest.spyOn(redux, 'useDispatch');

const task = {
  _id: 'task123',
  taskName: 'Task 1',
  resources: [
    {
      userID: 'user123',
      reviewStatus: 'Unsubmitted',
    },
  ],
  relatedWorkLinks: [],
};

describe('ReviewButton Component', () => {
  beforeEach(() => {
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation(selector => {
      if (selector.toString().includes('state => state.theme.darkMode')) {
        return false;
      }
      if (selector.toString().includes('state => state.auth.user.userid')) {
        return 'user123';
      }
      if (selector.toString().includes('state => state.auth.user.role')) {
        return 'Volunteer';
      }
      return {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Submit for Review button', () => {
    render(
      <ReviewButton
        user={{ personId: 'user123', name: 'John Doe' }}
        task={task}
        updateTask={jest.fn()}
      />,
    );
    expect(screen.getByText('Submit for Review')).toBeInTheDocument();
  });

  it('opens the modal when Submit for Review is clicked and displays Change Review Status', async () => {
    render(
      <ReviewButton
        user={{ personId: 'user123', name: 'John Doe' }}
        task={task}
        updateTask={jest.fn()}
      />,
    );
    const submitBtn = screen.getByText('Submit for Review');
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Change Review Status')).toBeInTheDocument();
    });
  });

  it('sanitizes URLs using the XSS protection utility', () => {
    render(
      <ReviewButton
        user={{ personId: 'user123', name: 'John Doe' }}
        task={task}
        updateTask={jest.fn()}
      />,
    );

    // Open the modal
    const submitBtn = screen.getByText('Submit for Review');
    fireEvent.click(submitBtn);

    // Find the input field and enter a URL
    const urlInput = screen.getByRole('textbox');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    // Verify that sanitizeURL was called
    expect(xssProtection.sanitizeURL).toHaveBeenCalledWith('https://example.com');
  });
});
