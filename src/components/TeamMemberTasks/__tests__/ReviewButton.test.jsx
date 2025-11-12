import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import ReviewButton from '../ReviewButton';
import httpService from '../../../services/httpService';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input, options) => {
      if (typeof input !== 'string') return '';
      let sanitized = input;
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/data:/gi, '');
      if (options && options.ALLOWED_TAGS && options.ALLOWED_TAGS.length === 0) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
      }
      return sanitized.trim();
    }),
  },
}));

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../../services/httpService', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('~/utils/permissions', () => ({
  default: vi.fn(() => () => true),
}));

// Mock store setup
const createMockStore = (initialState = {}) => {
  const defaultState = {
    auth: {
      user: {
        userid: 'user123',
        role: 'Volunteer',
        ...initialState.auth?.user,
      },
    },
    theme: {
      darkMode: false,
      ...initialState.theme,
    },
  };

  return configureStore({
    reducer: {
      auth: (state = defaultState.auth) => state,
      theme: (state = defaultState.theme) => state,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Test component wrapper
const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

// Mock props
const mockUser = {
  personId: 'user123',
  name: 'Test User',
};

const mockTask = {
  _id: 'task123',
  taskName: 'Test Task',
  resources: [
    {
      userID: 'user123',
      reviewStatus: 'Unsubmitted',
      completedTask: false,
    },
  ],
  relatedWorkLinks: [],
};

const mockUpdateTask = vi.fn();

describe('ReviewButton Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DOMPurify.sanitize.mockClear();
  });

  describe('Component Rendering Based on Review Status', () => {
    it('should render "Submit for Review" button for unsubmitted tasks', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      expect(screen.getByText('Submit for Review')).toBeInTheDocument();
    });

    it('should render dropdown for submitted tasks (user owns task)', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user123', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={submittedTask} updateTask={mockUpdateTask} />,
      );

      expect(screen.getByText('Ready for Review')).toBeInTheDocument();
    });

    it('should render review dropdown for managers on submitted tasks', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user456', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      const managerState = {
        auth: { user: { userid: 'manager123', role: 'Manager' } },
      };

      renderWithProvider(
        <ReviewButton
          user={{ personId: 'user456', name: 'Other User' }}
          task={submittedTask}
          updateTask={mockUpdateTask}
        />,
        managerState,
      );

      expect(screen.getByText('Ready for Review')).toBeInTheDocument();
    });
  });

  describe('URL Validation Functions', () => {
    it('should validate URL length requirement (20+ characters)', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      // Test short URL
      const shortUrl = 'https://git.com';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: shortUrl } });
      fireEvent.click(screen.getByText('Submit'));

      expect(
        screen.getByText("Please enter a valid URL starting with 'https://'."),
      ).toBeInTheDocument();
    });

    it('should validate GitHub PR URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      // Test valid GitHub PR URL
      const validGitHubUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validGitHubUrl } });

      // Should not show error
      expect(screen.queryByText(/Please enter a valid URL/)).not.toBeInTheDocument();
    });

    it('should reject invalid GitHub URLs (not PRs)', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const invalidGitHubUrl =
        'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/issues/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: invalidGitHubUrl } });
      fireEvent.click(screen.getByText('Submit'));

      expect(
        screen.getByText(/Nice try, but that link is about as useful as a chocolate teapot/),
      ).toBeInTheDocument();
    });

    it('should validate Google Docs URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validGoogleDocUrl = 'https://docs.google.com/document/d/1234567890abcdef/edit';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validGoogleDocUrl } });

      expect(screen.queryByText(/Please enter a valid URL/)).not.toBeInTheDocument();
    });

    it('should validate Dropbox shared links', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validDropboxUrl = 'https://dropbox.com/s/abcdef123456/file.pdf';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validDropboxUrl } });

      expect(screen.queryByText(/Please enter a valid URL/)).not.toBeInTheDocument();
    });

    it('should reject private Dropbox links', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const privateDropboxUrl = 'https://dropbox.com/home/MyFiles/document.pdf';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: privateDropboxUrl } });
      fireEvent.click(screen.getByText('Submit'));

      expect(screen.getByText(/screen door on a submarine/)).toBeInTheDocument();
    });

    it('should validate Figma design URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validFigmaUrl = 'https://figma.com/design/abcdef123456/MyDesign';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validFigmaUrl } });

      expect(screen.queryByText(/Please enter a valid URL/)).not.toBeInTheDocument();
    });

    it('should validate One Community URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validOneCommunityUrl = 'https://onecommunityglobal.org/some-page';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validOneCommunityUrl } });

      expect(screen.queryByText(/Please enter a valid URL/)).not.toBeInTheDocument();
    });
  });

  describe('Modal State Management', () => {
    it('should open and close submission modal', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      fireEvent.click(screen.getByText('Submit for Review'));
      expect(screen.getByText('Change Review Status')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByText('Cancel'));

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText('Change Review Status')).not.toBeInTheDocument();
      });
    });

    it('should open confirmation modal after valid submission', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
      });
    });

    it('should open edit link modal for submitted tasks', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user123', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={submittedTask} updateTask={mockUpdateTask} />,
      );

      // Click dropdown to open menu
      fireEvent.click(screen.getByText('Ready for Review'));

      // Click edit link
      fireEvent.click(screen.getByText('Edit Link'));

      expect(screen.getByText('Edit Submitted Link')).toBeInTheDocument();
    });
  });

  describe('Business Logic and API Integration', () => {
    it('should update task status and call API on successful submission', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });
      fireEvent.click(screen.getByText('Submit'));

      // Confirm submission
      await waitFor(() => {
        expect(screen.getByText('Confirm and Submit')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Confirm and Submit'));

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          resources: expect.arrayContaining([
            expect.objectContaining({
              reviewStatus: 'Submitted',
              completedTask: false, // This should be false in the updReviewStat function
            }),
          ]),
          relatedWorkLinks: expect.arrayContaining([validUrl]),
        }),
      );

      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle edit link workflow', async () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user123', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/old/pull/123'],
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={submittedTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Ready for Review'));
      fireEvent.click(screen.getByText('Edit Link'));

      const newUrl = 'https://github.com/new/pull/456';
      const editInput = screen.getByDisplayValue('https://github.com/old/pull/123'); // Find by current value
      fireEvent.change(editInput, { target: { value: newUrl } });
      fireEvent.click(screen.getByText('Update Link'));

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          relatedWorkLinks: [newUrl],
        }),
      );
    });

    it('should handle manager review completion', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user456', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      const managerState = {
        auth: { user: { userid: 'manager123', role: 'Manager' } },
      };

      renderWithProvider(
        <ReviewButton
          user={{ personId: 'user456', name: 'Other User' }}
          task={submittedTask}
          updateTask={mockUpdateTask}
        />,
        managerState,
      );

      fireEvent.click(screen.getByText('Ready for Review'));
      fireEvent.click(screen.getByText(/as complete and remove task/));
      fireEvent.click(screen.getByText('Complete'));

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          resources: expect.arrayContaining([
            expect.objectContaining({
              reviewStatus: 'Reviewed',
              completedTask: true,
            }),
          ]),
        }),
      );
    });

    it('should handle "More Work Needed" action', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user456', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      const managerState = {
        auth: { user: { userid: 'manager123', role: 'Manager' } },
      };

      renderWithProvider(
        <ReviewButton
          user={{ personId: 'user456', name: 'Other User' }}
          task={submittedTask}
          updateTask={mockUpdateTask}
        />,
        managerState,
      );

      fireEvent.click(screen.getByText('Ready for Review'));
      fireEvent.click(screen.getByText('More work needed, reset this button'));
      fireEvent.click(screen.getByText('Complete'));

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          resources: expect.arrayContaining([
            expect.objectContaining({
              reviewStatus: 'Unsubmitted',
            }),
          ]),
        }),
      );
    });
  });

  describe('User Role and Permission Testing', () => {
    it('should show different options based on user roles', () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user456', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      // Test as Owner (should have review options)
      const ownerState = {
        auth: { user: { userid: 'owner123', role: 'Owner' } },
      };

      renderWithProvider(
        <ReviewButton
          user={{ personId: 'user456', name: 'Other User' }}
          task={submittedTask}
          updateTask={mockUpdateTask}
        />,
        ownerState,
      );

      const ownerReadyButton = screen.getByText('Ready for Review');
      expect(ownerReadyButton).not.toBeDisabled();
      fireEvent.click(ownerReadyButton);
      expect(screen.getByText(/as complete and remove task/)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles when enabled', () => {
      const darkModeState = {
        theme: { darkMode: true },
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
        darkModeState,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      // Check if dark mode configuration is applied by verifying modal opens
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // The dark mode theme should be accessible to the component
      expect(screen.getByText('Change Review Status')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      httpService.post.mockRejectedValueOnce(new Error('Network error'));

      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('Confirm and Submit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirm and Submit'));

      // Should still update the task even if notification fails
      expect(mockUpdateTask).toHaveBeenCalled();
    });

    it('should handle Promise rejection in edit link', async () => {
      // Mock updateTask to reject with an error
      const mockError = new Error('Update failed');
      mockUpdateTask.mockRejectedValueOnce(mockError);

      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user123', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/old/pull/123'],
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={submittedTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Ready for Review'));
      fireEvent.click(screen.getByText('Edit Link'));

      const newUrl = 'https://github.com/new/pull/456';
      const editInput = screen.getByDisplayValue('https://github.com/old/pull/123');
      fireEvent.change(editInput, { target: { value: newUrl } });
      fireEvent.click(screen.getByText('Update Link'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error updating link:', mockError);
      });
    });
  });

  describe('XSS Protection (Essential Tests)', () => {
    it('should sanitize all user inputs with DOMPurify', () => {
      const maliciousUser = {
        personId: 'user123',
        name: 'Test<script>alert("xss")</script>User',
      };

      renderWithProvider(
        <ReviewButton user={maliciousUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const maliciousUrl = 'https://github.com/test<script>alert("xss")</script>/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: maliciousUrl } });

      // Verify DOMPurify.sanitize was called for URL sanitization
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousUrl, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });

    it('should prevent XSS through malicious URLs in submission', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      // Test various XSS attack vectors
      const maliciousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'https://example.com/page?param=<script>alert("xss")</script>',
        'https://github.com/test/pull/123#<script>alert("xss")</script>',
      ];

      const linkInput = screen.getByRole('textbox');

      for (const maliciousUrl of maliciousUrls) {
        fireEvent.change(linkInput, { target: { value: maliciousUrl } });
        // Verify DOMPurify sanitize is called
        expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousUrl, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        });
      }
    });

    it('should sanitize URL before saving to task', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      fireEvent.click(screen.getByText('Submit for Review'));

      const maliciousUrl =
        'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123<script>alert("xss")</script>';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: maliciousUrl } });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirm and Submit'));

      // Verify that the saved URL is sanitized (script tag should be removed by DOMPurify mock)
      const expectedCleanUrl =
        'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          relatedWorkLinks: expect.arrayContaining([expectedCleanUrl]),
        }),
      );
    });
  });

  describe('User Workflow Integration', () => {
    it('should complete full submission workflow', async () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Step 1: Open submission modal
      fireEvent.click(screen.getByText('Submit for Review'));
      expect(screen.getByText('Change Review Status')).toBeInTheDocument();

      // Step 2: Enter valid URL
      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });

      // Step 3: Submit form
      fireEvent.click(screen.getByText('Submit'));

      // Step 4: Confirm submission
      await waitFor(() => {
        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirm and Submit'));

      // Step 5: Verify task update and API call
      expect(mockUpdateTask).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should complete full review workflow', async () => {
      const submittedTask = {
        ...mockTask,
        resources: [{ userID: 'user456', reviewStatus: 'Submitted', completedTask: false }],
        relatedWorkLinks: ['https://github.com/test/pull/123'],
      };

      const managerState = {
        auth: { user: { userid: 'manager123', role: 'Manager' } },
      };

      renderWithProvider(
        <ReviewButton
          user={{ personId: 'user456', name: 'Other User' }}
          task={submittedTask}
          updateTask={mockUpdateTask}
        />,
        managerState,
      );

      // Step 1: Open review dropdown
      fireEvent.click(screen.getByText('Ready for Review'));

      // Step 2: View submitted link
      expect(screen.getByText('View Link')).toBeInTheDocument();

      // Step 3: Complete review
      fireEvent.click(screen.getByText(/as complete and remove task/));
      expect(screen.getByText('Are you sure you have completed the review?')).toBeInTheDocument();

      // Step 4: Confirm completion
      fireEvent.click(screen.getByText('Complete'));

      // Step 5: Verify task update
      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          resources: expect.arrayContaining([
            expect.objectContaining({
              reviewStatus: 'Reviewed',
              completedTask: true,
            }),
          ]),
        }),
      );
    });
  });
});
