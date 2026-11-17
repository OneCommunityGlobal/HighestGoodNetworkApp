import { cloneElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import App from '~/components/App';
import routes from '~/routes';

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

const findRoute = (node, path) => {
  if (Array.isArray(node)) return node.map(child => findRoute(child, path)).find(Boolean);
  const { path: routePath, children } = node?.props ?? {};
  if (routePath === path) return node;
  return children && findRoute(children, path);
};

// Stand-in for the real page, so only the route's access check runs
function StandInPage() {
  return <div />;
}

describe('Weekly Summaries Report and Total Org Summary access', () => {
  it.each([
    ['requestBio', '/weeklysummariesreport', '/weeklysummariesreport'],
    ['requestBio', '/totalorgsummary', '/dashboard'],
    ['requestBio', '/TotalOrgSummaryEmail', '/dashboard'],
    ['getWeeklySummaries', '/weeklysummariesreport', '/weeklysummariesreport'],
    ['getWeeklySummaries', '/totalorgsummary', '/totalorgsummary'],
    ['getWeeklySummaries', '/TotalOrgSummaryEmail', '/TotalOrgSummaryEmail'],
  ])('a Volunteer with only %s who opens %s ends on %s', (key, path, expectedPath) => {
    const store = configureMockStore()({
      auth: {
        isAuthenticated: true,
        user: { role: 'Volunteer', permissions: { frontPermissions: [key] } },
      },
      role: { roles: [] },
    });
    const history = createMemoryHistory({ initialEntries: [path] });

    render(
      <Provider store={store}>
        <Router history={history}>
          {cloneElement(findRoute(routes, path), { component: StandInPage })}
        </Router>
      </Provider>,
    );

    expect(history.location.pathname).toBe(expectedPath);
  });
});
