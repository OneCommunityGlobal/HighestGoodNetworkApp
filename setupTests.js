import '@testing-library/jest-dom';

// Mock window.URL.createObjectURL for plotly.js tests
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();
