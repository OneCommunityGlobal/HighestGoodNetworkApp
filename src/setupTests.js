/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
}))

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
    },
    ToastContainer: vi.fn(() => null),
  };
});

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: () => Promise.resolve({}),
}));

// Mock jspdf
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock d3
vi.mock('d3', () => ({
  select: vi.fn().mockReturnThis(),
  scaleOrdinal: vi.fn().mockReturnValue({
    range: vi.fn(),
  }),
  pie: vi.fn().mockReturnValue({
    value: vi.fn(),
  }),
  arc: vi.fn().mockReturnThis(),
  axisBottom: vi.fn(),
  axisLeft: vi.fn(),
  scaleTime: vi.fn().mockReturnValue({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn(),
  }),
  line: vi.fn().mockReturnThis(),
  timeFormat: vi.fn().mockReturnValue('Formatted Date'),
  format: vi.fn(),
}));

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