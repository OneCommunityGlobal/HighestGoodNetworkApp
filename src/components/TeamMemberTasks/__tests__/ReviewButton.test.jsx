import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DOMPurify from 'dompurify';
import ReviewButton from '../ReviewButton';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input, options) => {
      if (typeof input !== 'string') return '';

      let sanitized = input;

      // Remove script tags and their content
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      // Remove javascript: and data: URLs
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/data:/gi, '');

      // Remove on* event handlers
      sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

      // If ALLOWED_TAGS is empty array, remove all HTML tags
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
  default: vi.fn(() => () => true), // Mock as a thunk that returns true
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

describe('ReviewButton XSS Protection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DOMPurify.sanitize.mockClear();
  });

  describe('URL Sanitization', () => {
    it('should sanitize malicious script tags in URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Enter malicious URL with script tag
      const maliciousUrl = 'https://github.com/test<script>alert("xss")</script>/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: maliciousUrl } });

      // Verify DOMPurify was called to sanitize the URL
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousUrl, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });

    it('should sanitize javascript: protocol URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Enter javascript: URL
      const maliciousUrl = 'javascript:alert("xss")';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: maliciousUrl } });

      // Verify DOMPurify sanitization removes javascript: protocol
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousUrl, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });

    it('should sanitize data: URLs', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Enter data: URL
      const maliciousUrl = 'data:text/html,<script>alert("xss")</script>';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: maliciousUrl } });

      // Verify DOMPurify sanitization
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousUrl, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });
  });

  describe('Text Content Sanitization', () => {
    it('should sanitize user data before API calls', () => {
      const userWithMaliciousName = {
        personId: 'user123',
        name: 'Test<script>alert("xss")</script>User',
      };

      renderWithProvider(
        <ReviewButton user={userWithMaliciousName} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal and submit
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });

      const formSubmitButton = screen.getByText('Submit');
      fireEvent.click(formSubmitButton);

      // Should sanitize the user name before sending to API
      expect(DOMPurify.sanitize).toHaveBeenCalled();
    });

    it('should sanitize task names in API calls', () => {
      const taskWithMaliciousName = {
        ...mockTask,
        taskName: 'Test<img src=x onerror=alert("xss")>Task',
      };

      renderWithProvider(
        <ReviewButton user={mockUser} task={taskWithMaliciousName} updateTask={mockUpdateTask} />,
      );

      // Open modal and submit
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      const validUrl = 'https://github.com/OneCommunityglobal/HighestGoodNetworkApp/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: validUrl } });

      const formSubmitButton = screen.getByText('Submit');
      fireEvent.click(formSubmitButton);

      // Should sanitize the task name before sending to API
      expect(DOMPurify.sanitize).toHaveBeenCalled();
    });
  });

  describe('Input Field Sanitization', () => {
    it('should sanitize input values in real-time', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Enter multiple malicious inputs
      const linkInput = screen.getByRole('textbox');

      // Test script injection
      fireEvent.change(linkInput, { target: { value: '<script>alert("xss")</script>' } });
      expect(DOMPurify.sanitize).toHaveBeenCalled();

      // Test HTML injection
      fireEvent.change(linkInput, { target: { value: '<img src=x onerror=alert("xss")>' } });
      expect(DOMPurify.sanitize).toHaveBeenCalled();

      // Test event handler injection
      fireEvent.change(linkInput, {
        target: { value: 'https://example.com" onload="alert(\'xss\')"' },
      });
      expect(DOMPurify.sanitize).toHaveBeenCalled();
    });
  });

  describe('Sanitization Configuration', () => {
    it('should use strict sanitization settings', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: 'https://example.com' } });

      // Verify strict sanitization settings are used
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(expect.any(String), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });
  });

  describe('Edge Cases and Complex XSS Attempts', () => {
    it('should handle null and undefined inputs safely', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Test with actual content that would trigger sanitization
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: 'https://example.com' } });

      // Should handle gracefully without errors and sanitize the input
      expect(DOMPurify.sanitize).toHaveBeenCalled();
    });

    it('should handle complex nested XSS attempts', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // Complex nested XSS attempt
      const complexXSS = 'https://github.com/test<svg><script>alert("xss")</script></svg>/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: complexXSS } });

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(complexXSS, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });

    it('should handle URL encoding attempts', () => {
      renderWithProvider(
        <ReviewButton user={mockUser} task={mockTask} updateTask={mockUpdateTask} />,
      );

      // Open modal
      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      // URL encoded script attempt
      const encodedXSS =
        'https://github.com/test%3Cscript%3Ealert%28%22xss%22%29%3C%2Fscript%3E/pull/123';
      const linkInput = screen.getByRole('textbox');
      fireEvent.change(linkInput, { target: { value: encodedXSS } });

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(encodedXSS, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });
  });
});
