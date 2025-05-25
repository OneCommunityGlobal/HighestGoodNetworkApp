/** Used in jest.config.js */
import '@testing-library/jest-dom';

// Mock axios with proper error handling
jest.mock('axios', () => {
  // Create a mock implementation for axios
  const mockAxios = {
    defaults: {
      headers: {
        common: {},
        post: { 'Content-Type': 'application/json' }
      }
    },
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    create: jest.fn().mockReturnThis()
  };
  
  // Create enhanced methods with error handling
  ['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
    mockAxios[method] = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {},
        status: 200
      }).catch(err => {
        if (!err.response) {
          err.response = { 
            status: 500, 
            data: { message: err.message || 'Network Error' } 
          };
        }
        return Promise.reject(err);
      });
    });
  });
  
  return mockAxios;
});

// Mock react-toastify
jest.mock('react-toastify', () => {
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      dark: jest.fn(),
      configure: jest.fn(),
    },
    ToastContainer: jest.fn(() => null),
  };
});

jest.mock('html2canvas', () => ({
  default: () => Promise.resolve({}),
}));
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    addPage: jest.fn(),
    save: jest.fn(),
  })),
}));

// Mock d3
jest.mock('d3', () => ({
  select: jest.fn().mockReturnThis(),
  scaleOrdinal: jest.fn().mockReturnValue({
    range: jest.fn(),
  }),
  pie: jest.fn().mockReturnValue({
    value: jest.fn(),
  }),
  arc: jest.fn().mockReturnThis(),
  axisBottom: jest.fn(),
  axisLeft: jest.fn(),
  scaleTime: jest.fn().mockReturnValue({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn(),
  }),
  line: jest.fn().mockReturnThis(),
  timeFormat: jest.fn().mockReturnValue('Formatted Date'),
  format: jest.fn(),
}));

// Suppress React warnings
let originalConsoleError;
beforeAll(() => {
  originalConsoleError = console.error;
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
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
