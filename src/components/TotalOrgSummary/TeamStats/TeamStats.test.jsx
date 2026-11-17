import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { describe, expect, it } from 'vitest';
import TeamStats from './TeamStats';

const mockStore = configureMockStore([]);

describe('TeamStats', () => {
  it('renders without crashing when usersInTeamStats is missing', () => {
    const store = mockStore({
      theme: {
        darkMode: false,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <TeamStats
          isLoading={false}
          usersInTeamStats={undefined}
          endDate="2024-01-31"
          darkMode={false}
        />
      </Provider>,
    );

    expect(container).toBeTruthy();
  });
});
