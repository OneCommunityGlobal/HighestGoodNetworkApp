import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import CPProtectedRoute from './CPProtectedRoute';

function mount(auth) {
  const store = createStore(() => ({ auth, role: { roles: [] } }));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/communityportal/calendar']}>
        <Switch>
          <Route path="/communityportal/login">
            <h1>Secondary login required</h1>
          </Route>
          <Route path="/login">
            <h1>Main login required</h1>
          </Route>
          <CPProtectedRoute
            path="/communityportal/calendar"
            component={() => <h1>Private portal content</h1>}
          />
        </Switch>
      </MemoryRouter>
    </Provider>,
  );
}

describe('Community Portal access gate', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    {},
    { access: {} },
    { access: { canAccessBMPortal: false } },
    { access: { canAccessBMPortal: 'true' } },
  ])('requires explicit secondary access for %j', user => {
    mount({ isAuthenticated: true, user });
    expect(screen.getByRole('heading', { name: 'Secondary login required' })).toBeInTheDocument();
    expect(screen.queryByText('Private portal content')).not.toBeInTheDocument();
  });

  it('allows an authenticated user with explicit access', () => {
    mount({ isAuthenticated: true, user: { access: { canAccessBMPortal: true } } });
    expect(screen.getByText('Private portal content')).toBeInTheDocument();
  });

  it('requires main login when signed out', () => {
    mount({ isAuthenticated: false, user: {} });
    expect(screen.getByText('Main login required')).toBeInTheDocument();
  });
});
