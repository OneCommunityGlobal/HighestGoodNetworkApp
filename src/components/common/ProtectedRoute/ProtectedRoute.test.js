import React from 'react';
import { render } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute'; 
import configureStore from 'redux-mock-store'; 
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';


describe('ProtectedRoute', () => {
  const mockStore = configureStore();
  const mockComponent = () => <div>Mock Component</div>;

  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    Redirect: ({ to }) => <div>Redirecting to {to.pathname}</div> // Mock Redirect
  }));
  

  it('redirects to login if user is not authenticated', () => {
    const store = mockStore({
      auth: { isAuthenticated: false },
      role: { roles: [] },
    });

    render(
      <Provider store={store}>
        <Router>
          <ProtectedRoute component={mockComponent} />
        </Router>
      </Provider>
    );

    expect(getByText("Redirecting to /login")).toBeInTheDocument(); 
  });


  it('redirects to dashboard if user does not have permission', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'user', permissions: { frontPermissions: [] } } },
      role: { roles: [{ roleName: 'user', permissions: [] }] },
    });

    render(
      <Provider store={store}>
        <Router>
          <ProtectedRoute component={mockComponent} routePermissions="SOME_PERMISSION" />
        </Router>
      </Provider>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument(); // Adjust based on your dashboard page rendering
  });


  it('renders the component if authenticated and has permission', () => {
    const { container } = render(
      <ProtectedRoute
        component={mockComponent}
        auth={{ isAuthenticated: true, user: { role: 'ADMIN', permissions: { frontPermissions: ['SOME_PERMISSION'] } } }}
        roles={[{ roleName: 'ADMIN', permissions: ['SOME_PERMISSION'] }]}
        routePermissions="SOME_PERMISSION"
      />
    );
    expect(container.textContent).toContain('Mock Component');
  });

  
  it('allows access if the user is authenticated and has required user permissions', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'user', permissions: { frontPermissions: ['VIEW_DASHBOARD'] } } },
      role: { roles: [] },
    });
  
    render(
      <Provider store={store}>
        <Router>
          <ProtectedRoute component={mockComponent} routePermissions={['VIEW_DASHBOARD']} />
        </Router>
      </Provider>
    );
  
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });


  it('allows access if the user is authenticated and belongs to an allowed role', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'admin' } },
      role: { roles: [] },
    });
  
    render(
      <Provider store={store}>
        <Router>
          <ProtectedRoute component={mockComponent} allowedRoles={['admin']} />
        </Router>
      </Provider>
    );
  
    expect(screen.getByText('Mock Component')).toBeInTheDocument();
  });

  
  it('executes the render function when user meets the criteria', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'user', permissions: { frontPermissions: ['VIEW_DASHBOARD'] } } },
      role: { roles: [] },
    });
  
    const renderFunction = jest.fn().mockReturnValue(<div>Render Function Component</div>);
  
    render(
      <Provider store={store}>
        <Router>
          <ProtectedRoute render={renderFunction} routePermissions={['VIEW_DASHBOARD']} />
        </Router>
      </Provider>
    );
  
    expect(renderFunction).toHaveBeenCalled();
    expect(screen.getByText('Render Function Component')).toBeInTheDocument();
  });
  
  
});
