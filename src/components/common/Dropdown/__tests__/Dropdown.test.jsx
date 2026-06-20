// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen } from '@testing-library/react';
import Dropdown from '../Dropdown'; // adjust the path as needed

describe('Dropdown Component', () => {
  test('renders without crashing', () => {
    render(<Dropdown name="testDropdown" label="Test" options={[]} />);
  });

  test('displays a label', () => {
    render(<Dropdown name="testDropdown" label="Test" options={[]} />);
    // This will look for a label with the associated control's ID matching the provided text
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
  });

  test('displays a default option', () => {
    render(<Dropdown name="testDropdown" label="Test" options={[]} />);
    expect(screen.getByText('Please select a Test')).toBeInTheDocument();
  });

  test('displays options from the passed array', () => {
    const options = [
      { _id: '1', name: 'Option 1' },
      { _id: '2', name: 'Option 2' },
    ];
    render(<Dropdown name="testDropdown" label="Test" options={options} />);

    options.forEach(opt => {
      expect(screen.getByText(opt.name)).toBeInTheDocument();
    });
  });

  test('displays an error message if provided', () => {
    render(<Dropdown name="testDropdown" label="Test" options={[]} error="Some error occurred" />);
    expect(screen.getByText(/Some error occurred/i)).toBeInTheDocument();
  });
});
