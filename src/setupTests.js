/** Used in jest.config.js */
import '@testing-library/jest-dom';

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
