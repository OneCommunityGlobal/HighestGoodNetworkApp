import { Component } from 'react';
import PropTypes from 'prop-types';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import CommunityCalendar from '../CommunityCalendar';

const mockStore = configureMockStore([]);
const events = [
  {
    id: 'planning-session',
    title: 'Planning session',
    type: 'Meeting',
    location: 'Virtual',
    startTime: new Date(2026, 10, 13, 14).toISOString(),
    endTime: new Date(2026, 10, 13, 15).toISOString(),
    status: 'New',
    description: 'Plan the community launch.',
  },
  {
    id: 'workshop-session',
    title: 'Workshop session',
    type: 'Workshop',
    location: 'In person',
    startTime: new Date(2026, 10, 13, 16).toISOString(),
    endTime: new Date(2026, 10, 13, 17).toISOString(),
    status: 'New',
    description: 'Practice a different activity.',
  },
];

class RenderBoundary extends Component {
  static propTypes = { children: PropTypes.node.isRequired };

  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    return error ? <div role="alert">{error.message}</div> : children;
  }
}

const renderCalendar = darkMode =>
  render(
    <RenderBoundary>
      <Provider store={mockStore({ theme: { darkMode } })}>
        <CommunityCalendar />
      </Provider>
    </RenderBoundary>,
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 13, 12));
  axios.get.mockResolvedValue({ data: { events } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe.each([false, true])('Community Calendar details (dark mode: %s)', darkMode => {
  test.each(['activity summary', 'selected-day card'])(
    'opens the matching event from the %s and renders its metadata',
    async entryPoint => {
      renderCalendar(darkMode);
      await screen.findByRole('heading', { name: 'Community Calendar', level: 1 });
      let trigger;
      if (entryPoint === 'activity summary') {
        trigger = screen.getByRole('button', { name: 'View details for Planning session' });
      } else {
        const card = screen
          .getAllByRole('article')
          .find(article =>
            within(article).queryByRole('heading', { name: 'Planning session', level: 3 }),
          );
        trigger = within(card).getByRole('button', { name: 'View details', exact: true });
      }
      fireEvent.click(trigger);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Planning session' })).toBeInTheDocument();
      expect(dialog).toHaveTextContent('Meeting');
      expect(dialog).toHaveTextContent('Virtual');
      expect(dialog).toHaveTextContent('Plan the community launch.');
      expect(dialog).not.toHaveTextContent('Practice a different activity.');
      for (const label of ['Type:', 'Location:', 'Date:', 'Time:']) {
        expect(within(dialog).getByText(label)).toBeInTheDocument();
      }
      fireEvent.click(within(dialog).getByRole('button', { name: 'Close modal' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  test('opens a different event after closing the first details dialog', async () => {
    renderCalendar(darkMode);
    await screen.findByRole('button', { name: 'View details for Planning session' });
    fireEvent.click(screen.getByRole('button', { name: 'View details for Planning session' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Close modal' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'View details for Workshop session' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Workshop session' })).toBeInTheDocument();
    expect(dialog).toHaveTextContent('In person');
    expect(dialog).toHaveTextContent('Practice a different activity.');
    expect(dialog).not.toHaveTextContent('Plan the community launch.');
  });
});
