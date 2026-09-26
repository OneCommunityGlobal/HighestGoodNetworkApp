import { fireEvent, render, screen } from '@testing-library/react';
import useAppUpdateCheck from '~/hooks/useAppUpdateCheck';
import AppUpdateNotice, { DISMISSED_BUILD_KEY } from '../AppUpdateNotice';

vi.mock('~/hooks/useAppUpdateCheck', () => ({ default: vi.fn() }));

const MESSAGE = /A recent update has been merged from Dev to Main/;

const mockUpdate = latestBuildId =>
  useAppUpdateCheck.mockReturnValue({
    updateAvailable: Boolean(latestBuildId),
    latestBuildId,
  });

describe('AppUpdateNotice', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders nothing when no update is available', () => {
    mockUpdate(null);
    render(<AppUpdateNotice />);
    expect(screen.queryByText(MESSAGE)).toBeNull();
  });

  it('shows the refresh message when an update is available', () => {
    mockUpdate('build-2');
    render(<AppUpdateNotice />);
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(
      screen.getByText('Thank you for keeping your workspace up to date!'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'How to refresh the app' })).toBeInTheDocument();
  });

  it('hides when dismissed and remembers the dismissed build', () => {
    mockUpdate('build-2');
    render(<AppUpdateNotice />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss update notice' }));
    expect(screen.queryByText(MESSAGE)).toBeNull();
    expect(window.localStorage.getItem(DISMISSED_BUILD_KEY)).toBe('build-2');
  });

  it('stays hidden for a build that was already dismissed', () => {
    window.localStorage.setItem(DISMISSED_BUILD_KEY, 'build-2');
    mockUpdate('build-2');
    render(<AppUpdateNotice />);
    expect(screen.queryByText(MESSAGE)).toBeNull();
  });

  it('shows again when a newer build arrives after a dismissal', () => {
    window.localStorage.setItem(DISMISSED_BUILD_KEY, 'build-2');
    mockUpdate('build-3');
    render(<AppUpdateNotice />);
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
  });

  it('uses the dark style in dark mode', () => {
    mockUpdate('build-2');
    render(<AppUpdateNotice darkMode />);
    expect(screen.getByRole('status').className).toMatch(/appUpdateNoticeDark/);
  });
});
