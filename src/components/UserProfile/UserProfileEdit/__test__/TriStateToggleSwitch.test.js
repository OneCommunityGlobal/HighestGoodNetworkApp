import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TriStateToggleSwitch from '../ToggleSwitch/TriStateToggleSwitch';

describe('TriStateToggleSwitch Component', () => {
  it('renders knob in correct position based on prop', () => {
    const { container } = render(<TriStateToggleSwitch pos="requested" />);
    expect(container.querySelector('.knob.requested')).toBeInTheDocument();
  });

  it('renders knob in correct position based on prop', () => {
    const { container } = render(<TriStateToggleSwitch pos="default" />);
    expect(container.querySelector('.knob.default')).toBeInTheDocument();
  });

  it('renders knob in correct position based on prop', () => {
    const { container } = render(<TriStateToggleSwitch pos="posted" />);
    expect(container.querySelector('.knob.posted')).toBeInTheDocument();
  });

  it('renders correctly with null position', () => {
    const { container } = render(<TriStateToggleSwitch pos={null} />);
    expect(container.querySelector('.knob.null')).toBeInTheDocument();
  });

  it('renders correctly with invalid position', () => {
    const { container } = render(<TriStateToggleSwitch pos="invalid" />);
    expect(container.querySelector('.knob.invalid')).toBeInTheDocument();
  });

  it('updates background color correctly based on position', () => {
    const { container } = render(<TriStateToggleSwitch pos="default" />);

    // Ensure initial background color is dark gray
    expect(container.querySelector('.bg-darkgray')).toBeInTheDocument();

    // Click on 'posted' area to change position
    fireEvent.click(container.querySelector('.knob-area > div:nth-child(1)'));

    // Check if background color changes to blue
    expect(container.querySelector('.bg-blue')).toBeInTheDocument();

    // Click on 'default' area to change position again
    fireEvent.click(container.querySelector('.knob-area > div:nth-child(2)'));

    // Check if background color changes back to dark gray
    expect(container.querySelector('.bg-darkgray')).toBeInTheDocument();

    // Click on 'requested' area to change position again
    fireEvent.click(container.querySelector('.knob-area > div:nth-child(3)'));

    // Check if background color changes to green
    expect(container.querySelector('.bg-green')).toBeInTheDocument();
  });

  it('calls onChange handler correctly when toggling positions', () => {
    const onChangeMock = jest.fn();
    const { container } = render(<TriStateToggleSwitch pos="default" onChange={onChangeMock} />);

    // Click on 'posted' area to change position
    fireEvent.click(container.querySelector('.knob-area > div:nth-child(1)'));

    // Check if onChange function is called with 'posted'
    expect(onChangeMock).toHaveBeenCalledWith('posted');

    // Click on 'requested' area to change position
    fireEvent.click(container.querySelector('.knob-area > div:nth-child(3)'));

    // Check if onChange function is called with 'requested'
    expect(onChangeMock).toHaveBeenCalledWith('requested');
  });

});
