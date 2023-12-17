import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import Radio from './Radio'

const options = [
  { value: 'value1', label: 'Option 1' },
  { value: 'value2', label: 'Option 2' },
  { value: 'value3', label: 'Option 3' },
];

describe('Radio Component', () => {
  it('should render successfully', () => {
    render(<Radio name="radio test" options={[]} />)
  })

  it('renders correctly with labels and no input should be checked initially', () => {
    render(<Radio name="radion test" options={options}/>)
    options.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
      expect(screen.getByText(option.label)).not.toBeChecked();
    }) 
  })

  it('check when selected option is checked', () => {
    render(<Radio name="radio test" options={options}/>)
    const selectedOption = screen.getAllByRole("radio");
    fireEvent.click(selectedOption[1]);
    expect(selectedOption[1]).toBeChecked();
  })

  it('correct option should be check when default value is provided', () => {
    const defaultValue = 'value3'
    render(<Radio name="radio test" options={options} value={defaultValue}/>)
    options.forEach(option => {
      const radioOption = screen.getByLabelText(option.label);
      if (option.value === defaultValue) {
        expect(radioOption).toBeChecked();
      } else {
        expect(radioOption).not.toBeChecked();
      }
    })
  })

  it('displays an error when error has value', () => {
    render(<Radio name="radio test" error="Radio Error Message" options={options}/>)
    expect(screen.getByText(/radio error message/i)).toBeInTheDocument();
  })

})