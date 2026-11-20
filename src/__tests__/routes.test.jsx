import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import App from '~/components/App';
import routes from '../routes';
import ProtectedRoute from '../components/common/ProtectedRoute';

// The Announcements page drives its own tabs off the URL and pushes sub-paths
// like /announcements/email/templates. Registering /announcements as `exact`
// meant none of those matched, so they fell through to the catch-all
// NotFoundPage and the email dashboard's two entry buttons led nowhere.
const announcementsSubPaths = [
  '/announcements/email',
  '/announcements/email/send',
  '/announcements/email/outbox',
  '/announcements/email/templates',
];

describe('routes', () => {
  it.each(announcementsSubPaths)('resolves %s instead of falling through to Not Found', path => {
    window.history.pushState({}, '', path);

    render(<App />);

    // A signed-out visitor is bounced to login by ProtectedRoute; the failure
    // this guards against is the 404 page, which means no route matched at all.
    expect(screen.queryByRole('heading', { name: /page not found/i })).not.toBeInTheDocument();
  });
});

// Exercise the real declarations with a lightweight page to isolate route authorization.
const findRoute = (children, path) => {
  let match;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child) || match) return;
    const { path: routePath, children: nestedRoutes } = child.props;
    match = routePath === path ? child : findRoute(nestedRoutes, path);
  });
  return match;
};

const SupportPage = () => <div>Authorized Support page</div>;
const mockStore = configureMockStore();

describe.each(['/support/dashboard', '/support/log/:studentId'])('%s permissions', path => {
  it.each([
    ['signed out', false, [], [], '/login'],
    ['no permission', true, [], [], '/dashboard'],
    ['role grant', true, ['readActivityLogs'], [], null],
    ['individual grant', true, [], ['readActivityLogs'], null],
  ])('handles %s', (label, authenticated, roleGrants, individualGrants, redirect) => {
    const declaration = findRoute(routes, path);
    expect(declaration.type).toBe(ProtectedRoute);
    expect(declaration.props.routePermissions).toEqual(['readActivityLogs']);
    const location = path.replace(':studentId', 'student-id');
    const history = createMemoryHistory({ initialEntries: [location] });
    const store = mockStore({
      auth: {
        isAuthenticated: authenticated,
        user: { role: 'Learning Support', permissions: { frontPermissions: individualGrants } },
      },
      role: { roles: [{ roleName: 'Learning Support', permissions: roleGrants }] },
    });

    render(
      <Provider store={store}>
        <Router history={history}>
          {React.cloneElement(declaration, { component: SupportPage })}
        </Router>
      </Provider>,
    );

    expect(history.location.pathname).toBe(redirect || location);
    if (redirect) {
      expect(screen.queryByText('Authorized Support page')).not.toBeInTheDocument();
      expect(history.location.state.from.pathname).toBe(location);
    } else {
      expect(screen.getByText('Authorized Support page')).toBeInTheDocument();
    }
  });
});

it('keeps the Support login route public', () => {
  const declaration = findRoute(routes, '/support/login');
  expect(declaration.type).toBe(Route);
  expect(declaration.props.routePermissions).toBeUndefined();
});
