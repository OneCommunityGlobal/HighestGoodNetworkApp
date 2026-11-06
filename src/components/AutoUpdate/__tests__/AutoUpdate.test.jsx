import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import useAppUpdateCheck from '~/hooks/useAppUpdateCheck';

vi.mock('~/hooks/useAppUpdateCheck', () => ({ default: vi.fn() }));

// setupTests.js mocks AutoUpdate globally; load the real component here.
const { default: AutoUpdate } = await vi.importActual('../AutoUpdate');

const renderWithTheme = darkMode =>
  render(
    <Provider store={configureMockStore([])({ theme: { darkMode } })}>
      <AutoUpdate />
    </Provider>,
  );

describe('AutoUpdate', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAppUpdateCheck.mockReturnValue({ updateAvailable: true, latestBuildId: 'build-2' });
  });

  it('shows the refresh notice when a newer build is available', () => {
    renderWithTheme(false);
    expect(
      screen.getByText(/A recent update has been merged from Dev to Main/),
    ).toBeInTheDocument();
  });

  it('passes the current theme to the notice', () => {
    renderWithTheme(true);
    expect(screen.getByRole('status').className).toMatch(/appUpdateNoticeDark/);
  });
});
