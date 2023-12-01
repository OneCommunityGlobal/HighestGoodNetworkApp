import React from 'react';
import moment from 'moment';
import { render, screen, waitFor } from '@testing-library/react';
import { unmountComponentAtNode } from "react-dom";
import '@testing-library/jest-dom/extend-expect';

import CountdownTimer from 'components/WeeklySummary/CountdownTimer';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Time Countdown Timer Test', () => {
  it('displays "Time\'s Up" message when timer finished 1 second ago', async () => {
    // Set the time to 1 second ago.
    const tickTest = moment().subtract(1, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);
    
    await waitFor(() => screen.getByText("Time's up!"));

    expect(screen.getByText("Time's up!")).toBeInTheDocument();
  });
});

describe('Time Countdown Timer Test', () => {
  it('displays "Time\'s Up" message when timer finished at the same time', async () => {
    // Set the time to the current time.
    const tickTest = moment().subtract(0, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    await waitFor(() => screen.getByText("Time's up!"));
    expect(screen.getByText("Time's up!")).toBeInTheDocument();
  });
});

describe('Time Countdown Timer Test', () => {
  it('displays "Time\'s Up" message when timer finished 999 seconds ago', async () => {
    // Set the time to 999 seconds ago.
    const tickTest = moment().subtract(999, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    await waitFor(() => screen.getByText("Time's up!"));
    expect(screen.getByText("Time's up!")).toBeInTheDocument();
  });
});

describe('Time Countdown Timer Test', () => {
  it('displays "Sec" when timer is not finished', () => {
    // Set the time to 999 seconds later.
    const tickTest = moment().subtract(-999, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(screen.getByText("Sec")).toBeInTheDocument();
  });
});

describe('Time Countdown Timer Test', () => {
  it('displays "Time\'s Up" message when timer will be finished 1 second later', () => {
    // Set the time to the 1 second later.
    const tickTest = moment().subtract(-1, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(screen.getByText("Sec")).toBeInTheDocument();
  });
});