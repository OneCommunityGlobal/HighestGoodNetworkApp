/** Used in jest.config.js */
import '@testing-library/jest-dom';

jest.mock('d3', () => ({
    select: jest.fn().mockReturnThis(), // Mocking select to return the current object for chaining
    scaleOrdinal: jest.fn().mockReturnValue({
      range: jest.fn(),
    }), // Mock scaleOrdinal and its range method
    pie: jest.fn().mockReturnValue({
      value: jest.fn(),
    }), // Mock pie method and its value function
    arc: jest.fn().mockReturnThis(), // Mock arc and chaining
    axisBottom: jest.fn(), // Mock axisBottom
    axisLeft: jest.fn(), // Mock axisLeft
    scaleTime: jest.fn().mockReturnValue({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn(),
    }), // Mock scaleTime with domain and range methods
    line: jest.fn().mockReturnThis(), // Mock line method and chaining
    timeFormat: jest.fn().mockReturnValue('Formatted Date'), // Mock timeFormat
    format: jest.fn(), // Mock format
  }));
  