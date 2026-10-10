import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import routes from './routes';

vi.mock('./components/Header/HeaderRenderer', () => ({
  default: () => null,
}));

vi.mock('./components/Announcements/platforms/email', () => ({
  default: () => <div data-testid="email-panel">Email panel</div>,
}));

vi.mock('./components/Announcements/platforms/reddit', () => ({
  default: () => <div>Reddit composer</div>,
}));

vi.mock('./components/Announcements/platforms/slashdot', () => ({
  default: () => <div>Slashdot composer</div>,
}));

vi.mock('./components/Announcements/platforms/social/SocialMediaComposer', () => ({
  default: ({ platform }) => <div>{platform} composer</div>,
}));

const mockStore = configureMockStore();

const announcementsPaths = [
  '/announcements/email',
  '/announcements/weeklyreport',
  '/announcements/photo',
  '/announcements/video',
  '/announcements/article',
  '/announcements/x',
  '/announcements/facebook',
  '/announcements/linkedin',
  '/announcements/pinterest',
  '/announcements/instagram',
  '/announcements/threads',
  '/announcements/mastodon',
  '/announcements/bluesky',
  '/announcements/youtube',
  '/announcements/reddit',
  '/announcements/tumblr',
  '/announcements/imgur',
  '/announcements/diigo',
  '/announcements/myspace',
  '/announcements/medium',
  '/announcements/plurk',
  '/announcements/bitily',
  '/announcements/livejournal',
  '/announcements/slashdot',
  '/announcements/blogger',
  '/announcements/truthsocial',
];

function renderRoute(pathname) {
  const history = createMemoryHistory({ initialEntries: [pathname] });
  const store = mockStore({
    auth: {
      isAuthenticated: true,
      user: {
        role: 'Volunteer',
        permissions: { frontPermissions: ['sendEmails'] },
      },
    },
    role: { roles: [] },
    theme: { darkMode: false },
  });

  return render(
    <Provider store={store}>
      <Router history={history}>{routes}</Router>
    </Provider>,
  );
}

function getTab(label) {
  return screen.getByText(label, { selector: 'div' }).closest('a');
}

describe('Announcements routing', () => {
  test('/announcements renders the Announcements area with Email selected', () => {
    renderRoute('/announcements');

    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
    expect(getTab('Email')).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('heading', { name: 'PAGE NOT FOUND' })).not.toBeInTheDocument();
  });

  test.each(announcementsPaths)('%s remains reachable through the Announcements route', path => {
    renderRoute(path);

    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'PAGE NOT FOUND' })).not.toBeInTheDocument();
  });

  test.each([
    ['/announcements/x', 'X'],
    ['/announcements/mastodon', 'Mastodon'],
  ])('%s selects the %s tab from the pathname', async (path, label) => {
    renderRoute(path);

    await waitFor(() => expect(getTab(label)).toHaveAttribute('aria-selected', 'true'));
  });

  test('an unknown nested Announcements path preserves the existing Email fallback', () => {
    renderRoute('/announcements/some-invalid-route');

    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
    expect(getTab('Email')).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('heading', { name: 'PAGE NOT FOUND' })).not.toBeInTheDocument();
  });

  test.each(['/announcements-other', '/definitely-not-a-real-route'])(
    '%s still renders the global 404',
    path => {
      renderRoute(path);

      expect(screen.getByRole('heading', { name: 'PAGE NOT FOUND' })).toBeInTheDocument();
      expect(screen.queryByText('Weekly Report')).not.toBeInTheDocument();
    },
  );
});
