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

vi.mock('./components/Header/HeaderRenderer', () => ({
  default: () => null,
}));

vi.mock('./components/AutoUpdate', () => ({
  default: () => null,
}));

const store = createStore(() => ({
  auth: {
    isAuthenticated: true,
    user: {
      role: 'Owner',
      permissions: { frontPermissions: ['sendEmails'] },
    },
  },
  role: { roles: [] },
}));

const renderRoutesAt = pathname =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>{routes}</MemoryRouter>
    </Provider>,
  );

describe('Announcements routes', () => {
  it.each(['/announcements', '/announcements/facebook'])(
    'routes %s to Announcements instead of NotFoundPage',
    pathname => {
      renderRoutesAt(pathname);

      expect(screen.getByText('Announcements route')).toBeInTheDocument();
      expect(screen.queryByText('Not found route')).not.toBeInTheDocument();
    },
  );
});
