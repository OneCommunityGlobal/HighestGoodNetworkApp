import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure global/window URL mocks exist for Plotly
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();

if (!global.URL) {
  global.URL = {};
}
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

if (typeof window !== 'undefined') {
  if (!window.URL) {
    window.URL = {};
  }
  window.URL.createObjectURL = mockCreateObjectURL;
  window.URL.revokeObjectURL = mockRevokeObjectURL;
}
