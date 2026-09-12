import moment from 'moment';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line react/no-deprecated
import { unmountComponentAtNode } from 'react-dom';
import CountdownTimer from '~/components/WeeklySummary/CountdownTimer';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: vi.fn(),
  ToastContainer: () => null,
}));

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);

  // Clear all mocks before each test
  vi.clearAllMocks();
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

    expect(await screen.findByText("Time's up!")).toBeInTheDocument();
  });

  it('displays "Time\'s Up" message when timer finished at the same time', async () => {
    // Set the time to the current time.
    const tickTest = moment().subtract(0, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(await screen.findByText("Time's up!")).toBeInTheDocument();
  });

  it('displays "Time\'s Up" message when timer finished 999 seconds ago', async () => {
    // Set the time to 999 seconds ago.
    const tickTest = moment().subtract(999, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(await screen.findByText("Time's up!")).toBeInTheDocument();
  });

  it('displays "Sec" when timer is not finished', () => {
    // Set the time to 999 seconds later.
    const tickTest = moment().subtract(-999, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(screen.getByText('Sec')).toBeInTheDocument();
  });

  it('displays "Time\'s Up" message when timer will be finished 1 second later', () => {
    // Set the time to the 1 second later.
    const tickTest = moment().subtract(-1, 'seconds');
    render(<CountdownTimer date={tickTest} />, container);

    expect(screen.getByText('Sec')).toBeInTheDocument();
  });
});