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
    expect(container.querySelector('.bg-darkgray')).toBeInTheDocument();

    fireEvent.click(container.querySelector('.knob-area > div:nth-child(1)'));
    expect(container.querySelector('.bg-blue')).toBeInTheDocument();

    fireEvent.click(container.querySelector('.knob-area > div:nth-child(2)'));
    expect(container.querySelector('.bg-darkgray')).toBeInTheDocument();

    fireEvent.click(container.querySelector('.knob-area > div:nth-child(3)'));
    expect(container.querySelector('.bg-green')).toBeInTheDocument();
  });

  it('calls onChange handler correctly when toggling positions', () => {
    const onChangeMock = jest.fn();
    const { container } = render(<TriStateToggleSwitch pos="default" onChange={onChangeMock} />);

    fireEvent.click(container.querySelector('.knob-area > div:nth-child(1)'));
    expect(onChangeMock).toHaveBeenCalledWith('posted');

    fireEvent.click(container.querySelector('.knob-area > div:nth-child(3)'));
    expect(onChangeMock).toHaveBeenCalledWith('requested');
  });

});
