import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EmailPanel from '../index';

// The dashboard's two cards are the only way into the email module, and each
// one navigates rather than swapping state locally. Stub the heavy panels they
// lead to so this exercises the navigation and nothing else.
vi.mock('../../../../EmailManagement', () => ({
  EmailOutbox: () => <div>Outbox Panel</div>,
  EmailTemplateManager: () => <div>Templates Panel</div>,
  IntegratedEmailSender: () => <div>Sender Panel</div>,
  ErrorBoundary: ({ children }) => children,
}));

const mockStore = configureMockStore([thunk]);

const setUpPanel = () => {
  const history = createMemoryHistory({ initialEntries: ['/announcements'] });
  const store = mockStore({ theme: { darkMode: false } });

  render(
    <Provider store={store}>
      <Router history={history}>
        <EmailPanel title="Email" />
      </Router>
    </Provider>,
  );

  return history;
};

describe('EmailPanel dashboard', () => {
  it('renders both entry cards', () => {
    setUpPanel();

    expect(screen.getByRole('button', { name: /Send, Outbox/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage Templates/i })).toBeInTheDocument();
  });

  it('sends the Email card to the sender view', () => {
    const history = setUpPanel();

    fireEvent.click(screen.getByRole('button', { name: /Send, Outbox/i }));

    expect(history.location.pathname).toBe('/announcements/email/send');
    expect(screen.getByText('Sender Panel')).toBeInTheDocument();
  });

  it('sends the Templates card to the templates view', () => {
    const history = setUpPanel();

    fireEvent.click(screen.getByRole('button', { name: /Manage Templates/i }));

    expect(history.location.pathname).toBe('/announcements/email/templates');
    expect(screen.getByText('Templates Panel')).toBeInTheDocument();
  });
});
