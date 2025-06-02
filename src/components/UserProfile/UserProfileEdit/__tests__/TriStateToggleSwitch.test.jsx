import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TriStateToggleSwitch from '../ToggleSwitch/TriStateToggleSwitch';

describe('TriStateToggleSwitch Component', () => {
  it('initializes state based on pos prop and applies correct background color', () => {
    const { container, rerender } = render(<TriStateToggleSwitch pos="posted" />);
    const wrapper = container.querySelector('.toggle-switch');
    const knob = container.querySelector('.knob');
    
    expect(wrapper).toHaveClass('toggle-switch', 'bg-blue');
    expect(knob).toHaveClass('posted');

    rerender(<TriStateToggleSwitch pos="default" />);
    expect(wrapper).toHaveClass('toggle-switch', 'bg-darkgray');
    expect(container.querySelector('.knob')).toHaveClass('default');

    
    rerender(<TriStateToggleSwitch pos="requested" />);
    expect(wrapper).toHaveClass('toggle-switch', 'bg-green');
    expect(container.querySelector('.knob')).toHaveClass('requested');
  });

  it('calls onChange and updates state and bgColor on click for all states', () => {
    const handleChange = jest.fn();
    const { container } = render(<TriStateToggleSwitch pos="default" onChange={handleChange} />);
    const wrapper = container.querySelector('.toggle-switch');
    const options = container.querySelectorAll('.knob-area div');

    
    fireEvent.click(options[0]);
    expect(handleChange).toHaveBeenCalledWith('posted');
    expect(wrapper).toHaveClass('bg-blue');
    expect(container.querySelector('.knob')).toHaveClass('posted');

    
    handleChange.mockClear();
    fireEvent.click(options[1]);
    expect(handleChange).toHaveBeenCalledWith('default');
    expect(wrapper).toHaveClass('bg-darkgray');
    expect(container.querySelector('.knob')).toHaveClass('default');

   
    handleChange.mockClear();
    fireEvent.click(options[2]);
    expect(handleChange).toHaveBeenCalledWith('requested');
    expect(wrapper).toHaveClass('bg-green');
    expect(container.querySelector('.knob')).toHaveClass('requested');
  });

  it('does not throw if onChange is not provided', () => {
    const { container } = render(<TriStateToggleSwitch pos="default" />);
    const options = container.querySelectorAll('.knob-area div');

    expect(() => fireEvent.click(options[0])).not.toThrow();
    const wrapper = container.querySelector('.toggle-switch');
    expect(wrapper).toHaveClass('bg-blue');
    expect(container.querySelector('.knob')).toHaveClass('posted');
  });

  it('does not call onChange on mount or prop change', () => {
    const handleChange = jest.fn();
    const { rerender } = render(<TriStateToggleSwitch pos="posted" onChange={handleChange} />);
    
    expect(handleChange).not.toHaveBeenCalled();

    
    rerender(<TriStateToggleSwitch pos="default" onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders exactly three clickable areas for each state option', () => {
    const { container } = render(<TriStateToggleSwitch pos="requested" />);
    const options = container.querySelectorAll('.knob-area div');
    expect(options.length).toBe(3);
  });

  it('wrapper always includes the toggle-switch class', () => {
    const { container } = render(<TriStateToggleSwitch pos="default" />);
    const wrapper = container.querySelector('.toggle-switch');
    expect(wrapper).toBeInTheDocument();
  });

  it('wrapper has exactly two classes (toggle-switch and bg-color) for each state', () => {
    const { container, rerender } = render(<TriStateToggleSwitch pos="default" />);
    const wrapper = container.querySelector('.toggle-switch');
    
    expect(wrapper.classList.length).toBe(2);
    expect(wrapper.classList.contains('toggle-switch')).toBe(true);
    expect(wrapper.classList.contains('bg-darkgray')).toBe(true);

    
    rerender(<TriStateToggleSwitch pos="posted" />);
    expect(wrapper.classList.length).toBe(2);
    expect(wrapper.classList.contains('bg-blue')).toBe(true);

    
    rerender(<TriStateToggleSwitch pos="requested" />);
    expect(wrapper.classList.length).toBe(2);
    expect(wrapper.classList.contains('bg-green')).toBe(true);
  });

  it('allows sequential clicking through all states', () => {
    const handleChange = jest.fn();
    const { container } = render(<TriStateToggleSwitch pos="default" onChange={handleChange} />);
    const options = container.querySelectorAll('.knob-area div');

    options.forEach((option, idx) => {
      fireEvent.click(option);
      const expected = ['posted', 'default', 'requested'][idx];
      expect(handleChange).toHaveBeenLastCalledWith(expected);
      expect(container.querySelector('.knob')).toHaveClass(expected);
    });
  });

});
