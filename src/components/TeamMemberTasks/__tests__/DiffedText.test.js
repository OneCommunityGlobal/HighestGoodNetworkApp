import React from 'react';
import { render } from '@testing-library/react';
import DiffedText from '../components/DiffedText'; // Adjust the import path as needed

describe('DiffedText Component', () => {
  it('renders without crashing', () => {
    render(<DiffedText oldText="" newText="" />);
  });

  it('displays the correct diff output', () => {
    const { getByText } = render(<DiffedText oldText="Hello world" newText="Hello React world" />);
    expect(getByText('Hello')).toHaveStyle('color: black');
    expect(getByText('world')).toHaveStyle('color: black');
    expect(getByText('React')).toHaveStyle('color: green');
  });

  it('handles text removal correctly', () => {
    const { getByText } = render(<DiffedText oldText="Hello world" newText="Hello" />);
    expect(getByText('world')).toHaveStyle('textDecorationLine: line-through; color: red');
  });

});
