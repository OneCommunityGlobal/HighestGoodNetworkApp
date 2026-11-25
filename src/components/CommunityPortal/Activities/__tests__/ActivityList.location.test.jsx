import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { vi } from 'vitest';
import ActivityList from '../ActivityList';

vi.mock('../mockActivities', () => ({
  mockActivities: [
    'Tech Hub',
    'Community Center',
    'Botanical Garden',
    'Culinary School',
    'City Park',
    'Library',
    ...Array.from({ length: 12 }, (_, i) => `Community Hall ${i + 1}`),
    'Community Center',
  ].map((location, i) => ({
    id: i + 1,
    name: `Activity ${i + 1}`,
    type: i % 2 ? 'Social' : 'Fitness',
    date: '2026-11-13',
    time: '10:00 AM',
    location,
    description: 'Isolated activity fixture',
  })),
}));

function openList(darkMode = false) {
  const store = createStore((state = { theme: { darkMode } }) => state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ActivityList />
      </MemoryRouter>
    </Provider>,
  );
  return screen.getByRole('textbox', { name: /Location:/i });
}

const suggestionValues = () =>
  within(screen.getByLabelText('Location suggestions'))
    .getAllByRole('option')
    .filter(option => !option.disabled)
    .map(option => option.value);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-12T12:00:00'));
});
afterEach(() => vi.useRealTimers());

describe('Activity List location suggestions', () => {
  test('prioritizes starts-with matches and excludes middle matches when prefixes exist', () => {
    fireEvent.change(openList(), { target: { value: 'C' } });
    const values = suggestionValues();
    expect(values).toContain('Community Center');
    expect(values).toContain('Culinary School');
    expect(values).toContain('City Park');
    expect(values).not.toContain('Tech Hub');
    expect(values).not.toContain('Botanical Garden');
  });

  test('caps suggestions at ten unique locations', () => {
    fireEvent.change(openList(), { target: { value: 'Community' } });
    const values = suggestionValues();
    expect(values).toHaveLength(10);
    expect(new Set(values).size).toBe(10);
  });

  test('normalizes surrounding whitespace and capitalization', () => {
    fireEvent.change(openList(), { target: { value: '  liB  ' } });
    expect(suggestionValues()).toEqual(['Library']);
  });

  test('does not suggest everything for whitespace-only input', () => {
    fireEvent.change(openList(), { target: { value: '   ' } });
    expect(screen.queryByLabelText('Location suggestions')).not.toBeInTheDocument();
  });

  test('preserves typo-tolerant suggestions when no prefix matches', () => {
    const input = openList();
    fireEvent.change(input, { target: { value: 'Libary' } });
    expect(suggestionValues()).toContain('Library');
    expect(input).toHaveValue('Libary');
    expect(screen.getByRole('button', { name: 'View details for Activity 6' })).toBeInTheDocument();
  });

  test('does not silently preselect a result before the user chooses it', () => {
    fireEvent.change(openList(), { target: { value: 'Lib' } });
    expect(screen.getByLabelText('Location suggestions')).toHaveValue('');
  });

  test.each([false, true])(
    'selects a location, combines filters and clears in darkMode=%s',
    darkMode => {
      const input = openList(darkMode);
      fireEvent.change(input, { target: { value: 'Lib' } });
      fireEvent.change(screen.getByLabelText('Location suggestions'), {
        target: { value: 'Library' },
      });
      expect(input).toHaveValue('Library');
      expect(screen.queryByLabelText('Location suggestions')).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText(/Type:/i), { target: { value: 'Fitness' } });
      expect(screen.getByText('No activities found')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
      expect(input).toHaveValue('');
      expect(screen.getByLabelText(/Type:/i)).toHaveValue('');
      expect(screen.queryByLabelText('Location suggestions')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'View details for Activity 1' }),
      ).toBeInTheDocument();
    },
  );

  test('keeps unmatched manual text and presents an empty result', () => {
    const input = openList();
    fireEvent.change(input, { target: { value: 'ZZZZZZZZZZZ' } });
    expect(input).toHaveValue('ZZZZZZZZZZZ');
    expect(screen.queryByLabelText('Location suggestions')).not.toBeInTheDocument();
    expect(screen.getByText('No activities found')).toBeInTheDocument();
  });
});
