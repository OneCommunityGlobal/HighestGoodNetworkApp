import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TriStateToggleSwitch from '../ToggleSwitch/TriStateToggleSwitch';

describe('TriStateToggleSwitch Component', () => {
  it('initializes state based on pos prop and applies correct background color', () => {
    const { rerender } = render(<TriStateToggleSwitch pos="posted" />);

    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-blue/);
    expect(screen.getByTestId('knob').className).toMatch(/posted/);

    rerender(<TriStateToggleSwitch pos="default" />);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-darkgray/);
    expect(screen.getByTestId('knob').className).toMatch(/default/);

    rerender(<TriStateToggleSwitch pos="requested" />);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-green/);
    expect(screen.getByTestId('knob').className).toMatch(/requested/);
  });

  it('calls onChange and updates state and bgColor on click for all states', () => {
    const handleChange = vi.fn();
    render(<TriStateToggleSwitch pos="default" onChange={handleChange} />);

    fireEvent.click(screen.getByTestId('option-posted'));
    expect(handleChange).toHaveBeenCalledWith('posted');
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-blue/);
    expect(screen.getByTestId('knob').className).toMatch(/posted/);

    handleChange.mockClear();
    fireEvent.click(screen.getByTestId('option-default'));
    expect(handleChange).toHaveBeenCalledWith('default');
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-darkgray/);
    expect(screen.getByTestId('knob').className).toMatch(/default/);

    handleChange.mockClear();
    fireEvent.click(screen.getByTestId('option-requested'));
    expect(handleChange).toHaveBeenCalledWith('requested');
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-green/);
    expect(screen.getByTestId('knob').className).toMatch(/requested/);
  });

  it('does not throw if onChange is not provided', () => {
    render(<TriStateToggleSwitch pos="default" />);
    expect(() => fireEvent.click(screen.getByTestId('option-posted'))).not.toThrow();
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-blue/);
    expect(screen.getByTestId('knob').className).toMatch(/posted/);
  });

  it('does not call onChange on mount or prop change', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<TriStateToggleSwitch pos="posted" onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();

    rerender(<TriStateToggleSwitch pos="default" onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders exactly three clickable areas for each state option', () => {
    render(<TriStateToggleSwitch pos="requested" />);
    expect(screen.getByTestId('knob-area').children.length).toBe(3);
  });

  it('wrapper always includes the toggle-switch class', () => {
    render(<TriStateToggleSwitch pos="default" />);
    expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
  });

  it('wrapper has exactly two classes (toggle-switch and bg-color) for each state', () => {
    const { rerender } = render(<TriStateToggleSwitch pos="default" />);

    expect(screen.getByTestId('toggle-switch').classList.length).toBe(2);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/toggle-switch/);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-darkgray/);

    rerender(<TriStateToggleSwitch pos="posted" />);
    expect(screen.getByTestId('toggle-switch').classList.length).toBe(2);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-blue/);

    rerender(<TriStateToggleSwitch pos="requested" />);
    expect(screen.getByTestId('toggle-switch').classList.length).toBe(2);
    expect(screen.getByTestId('toggle-switch').className).toMatch(/bg-green/);
  });

  it('allows sequential clicking through all states', () => {
    const handleChange = vi.fn();
    render(<TriStateToggleSwitch pos="default" onChange={handleChange} />);

    ['posted', 'default', 'requested'].forEach(state => {
      fireEvent.click(screen.getByTestId(`option-${state}`));
      expect(handleChange).toHaveBeenLastCalledWith(state);
      expect(screen.getByTestId('knob').className).toMatch(new RegExp(state));
    });
  });
});