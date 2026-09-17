import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';
import routes from './routes';

vi.mock('./components/Announcements', () => ({
  default: () => <div>Announcements route</div>,
}));

vi.mock('./components/NotFound/NotFoundPage', () => ({
  default: () => <div>Not found route</div>,
}));

vi.mock('./components/Dashboard', () => ({
  default: () => <div>Dashboard route</div>,
}));

vi.mock('./components/Header/HeaderRenderer', () => ({
  default: () => null,
}));

vi.mock('./components/AutoUpdate', () => ({
  default: () => null,
}));

const createAnnouncementsStore = ({
  role = 'Owner',
  frontPermissions = [],
  removedDefaultPermissions = [],
  roles = [],
} = {}) =>
  createStore(() => ({
    auth: {
      isAuthenticated: true,
      user: {
        role,
        permissions: { frontPermissions, removedDefaultPermissions },
      },
    },
    role: { roles },
  }));

const renderRoutesAt = (pathname, state) =>
  render(
    <Provider store={createAnnouncementsStore(state)}>
      <MemoryRouter initialEntries={[pathname]}>{routes}</MemoryRouter>
    </Provider>,
  );

describe('Announcements routes', () => {
  it('allows a user with sendEmails to access Announcements', () => {
    renderRoutesAt('/announcements', { frontPermissions: ['sendEmails'] });

    expect(screen.getByText('Announcements route')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard route')).not.toBeInTheDocument();
  });

  it('allows a user with the shared social posting permission without sendEmails', () => {
    renderRoutesAt('/announcements/facebook', {
      role: 'Social Manager',
      frontPermissions: ['postFacebookContent'],
    });

    expect(screen.getByText('Announcements route')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard route')).not.toBeInTheDocument();
  });

  it('allows the default Administrator posting permission without sendEmails', () => {
    renderRoutesAt('/announcements', {
      role: 'Administrator',
      roles: [{ roleName: 'Administrator', permissions: ['postFacebookContent'] }],
    });

    expect(screen.getByText('Announcements route')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard route')).not.toBeInTheDocument();
  });

  it('denies an Administrator whose default posting permission was removed', () => {
    renderRoutesAt('/announcements', {
      role: 'Administrator',
      removedDefaultPermissions: ['postFacebookContent'],
      roles: [{ roleName: 'Administrator', permissions: ['postFacebookContent'] }],
    });

    expect(screen.getByText('Dashboard route')).toBeInTheDocument();
    expect(screen.queryByText('Announcements route')).not.toBeInTheDocument();
  });

  it('redirects a user without posting or email permissions to Dashboard', () => {
    renderRoutesAt('/announcements', {
      role: 'Volunteer',
      roles: [{ roleName: 'Volunteer', permissions: [] }],
    });

    expect(screen.getByText('Dashboard route')).toBeInTheDocument();
    expect(screen.queryByText('Announcements route')).not.toBeInTheDocument();
  });

  it.each(['/announcements/facebook', '/announcements/mastodon', '/announcements/x'])(
    'keeps nested %s routes inside Announcements for permitted users',
    pathname => {
      renderRoutesAt(pathname, { frontPermissions: ['postFacebookContent'] });

      expect(screen.getByText('Announcements route')).toBeInTheDocument();
      expect(screen.queryByText('Not found route')).not.toBeInTheDocument();
    },
  );
});
