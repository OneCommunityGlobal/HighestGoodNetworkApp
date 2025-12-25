/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock @tanstack/react-query FIRST - must be hoisted before any imports that use it
vi.mock('@tanstack/react-query', () => {
  const React = require('react');
  return {
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    })),
    QueryClient: class QueryClient {
      constructor() {
        this.setQueryData = vi.fn();
        this.getQueryData = vi.fn();
        this.invalidateQueries = vi.fn();
        this.refetchQueries = vi.fn();
      }
    },
    QueryClientProvider: ({ children }) => React.createElement('div', {}, children),
  };
});

// Mock axios with proper error handling
vi.mock('axios', () => {
  const mockAxios = {
    defaults: {
      headers: {
        common: {},
        post: { 'Content-Type': 'application/json' },
      },
    },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    create: vi.fn().mockReturnThis(),
  };

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    mockAxios[method] = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {},
        status: 200,
      }).catch((err) => {
        if (!err.response) {
          err.response = {
            status: 500,
            data: { message: err.message || 'Network Error' },
          };
        }
        return Promise.reject(err);
      });
    });
  });

  return { default: mockAxios };
});

vi.mock('msw', () => ({
  rest: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    options: vi.fn(),
  },
}));

vi.mock('msw/node', () => ({
  setupServer: () => ({
    listen: () => { },
    resetHandlers: () => { },
    close: () => { },
  }),
}));

// Mock react-toastify
vi.mock('react-toastify', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      dark: vi.fn(),
      configure: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    },
    ToastContainer: vi.fn(() => null),
  };
});

// Mock html2canvas
vi.mock('html2canvas', () => ({
  __esModule: true,
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock'),
    width: 800,
    height: 600,
  })),
}));

// Mock jspdf
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock joi-browser (use joi instead) - hoisted to top level
vi.mock('joi-browser', async () => {
  const joi = await import('joi');
  return joi;
});


// Mock react-day-picker
vi.mock('react-day-picker', () => ({
  DayPicker: ({ selected, onSelect, className, mode }) => {
    const React = require('react');
    return React.createElement('div', {
      role: 'grid',
      'data-testid': 'day-picker',
      className,
    }, 'DayPicker Mock');
  },
}));

// Mock antd
vi.mock('antd', () => ({
  Select: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('select', props, children);
  },
  DatePicker: (props) => {
    const React = require('react');
    return React.createElement('input', { type: 'date', ...props });
  },
  Spin: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
}));

// CSS imports are handled by Vite's CSS plugin, no need to mock

// Suppress React warnings
let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  vi.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      (msg.includes('ReactDOM.render') ||
        msg.includes('unmountComponentAtNode') ||
        msg.includes('defaultProps') ||
        msg.includes('ReactDOMTestUtils.act'))
    ) {
      return;
    }
    originalConsoleError(msg, ...args);
  });
});

afterAll(() => {
  if (console.error.mockRestore) {
    console.error.mockRestore();
  } else {
    console.error = originalConsoleError;
  }
});

class ResizeObserver {
  observe() { return undefined; }      // noop
  unobserve() { return undefined; }    // noop
  disconnect() { return undefined; }   // noop
}

global.ResizeObserver = ResizeObserver;