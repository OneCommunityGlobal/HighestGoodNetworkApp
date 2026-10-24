import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { createStore, combineReducers } from 'redux';
import hgnForm from '~/reducers/hgnFormReducers';
import InfoForm from '../questionpages/InfoForm';

const authUser = {
  userid: 'u1',
  role: 'Administrator',
  email: 'a@b.com',
  firstName: 'Pat',
  lastName: 'Lee',
};

const setup = () => {
  const store = createStore(
    combineReducers({
      hgnForm,
      theme: (state = { darkMode: false }) => state,
      auth: (state = { user: authUser }) => state,
      allUserProfilesBasicInfo: (state = { userProfilesBasicInfo: [] }) => state,
    }),
  );
  const history = createMemoryHistory({ initialEntries: ['/hgnform'] });
  const ui = () => (
    <Provider store={store}>
      <Router history={history}>
        <Route path="/hgnform" exact component={InfoForm} />
        <Route path="/hgnform/page2" render={() => <div>PAGE TWO</div>} />
      </Router>
    </Provider>
  );
  return { store, history, ui };
};

const fillValid = (name = 'Pat Lee') => {
  fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/GitHub/i), { target: { value: 'patlee' } });
  fireEvent.change(screen.getByLabelText(/^Slack/i), { target: { value: 'Pat Lee' } });
  fireEvent.click(screen.getByLabelText(/my Slack handle is my first and last name/i));
};

describe('InfoForm state retention and validation', () => {
  it('starts with an empty Name and a read-only Email', () => {
    const { ui } = setup();
    render(ui());
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/^Email/i)).toHaveValue('a@b.com');
  });

  it('keeps the entered Name, GitHub and Slack after Next then Back', () => {
    const { history, ui } = setup();
    const { unmount } = render(ui());
    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');

    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: 'Bosu Test Name' } });
    fireEvent.change(screen.getByLabelText(/GitHub/i), { target: { value: 'patlee' } });
    fireEvent.change(screen.getByLabelText(/^Slack/i), { target: { value: 'Bosu Test Name' } });
    fireEvent.click(screen.getByLabelText(/my Slack handle is my first and last name/i));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(history.location.pathname).toBe('/hgnform/page2');
    unmount();

    history.goBack();
    render(ui());

    expect(screen.getByLabelText(/^Name/i)).toHaveValue('Bosu Test Name');
    expect(screen.getByLabelText(/GitHub/i)).toHaveValue('patlee');
    expect(screen.getByLabelText(/^Slack/i)).toHaveValue('Bosu Test Name');
    expect(screen.getByLabelText(/^Email/i)).toHaveValue('a@b.com');
  });

  it('keeps a cleared Name empty after remount and explains it on Next', () => {
    const { history, ui } = setup();
    const { unmount } = render(ui());

    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: 'Bosu Test Name' } });
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: '' } });
    fillValid('');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Name must be at least 2 characters long.');
    expect(history.location.pathname).toBe('/hgnform');
    unmount();

    history.push('/hgnform/page2');
    history.goBack();
    render(ui());

    expect(screen.getByLabelText(/^Name/i)).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Name must be at least 2 characters long.');
    expect(history.location.pathname).toBe('/hgnform');
  });

  it('advances to page 2 when the form is valid', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(history.location.pathname).toBe('/hgnform/page2');
  });

  it('explains why Next is blocked when required fields are missing', () => {
    const { history, ui } = setup();
    render(ui());
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/GitHub is required/i);
    expect(alert).toHaveTextContent(/Slack is required/i);
    expect(alert).toHaveTextContent(/confirm that your Slack handle/i);
    expect(history.location.pathname).toBe('/hgnform');
  });

  it('explains a name that is too short', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: 'P' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/at least 2 characters/i);
    expect(history.location.pathname).toBe('/hgnform');
  });

  it('explains a Slack name that does not match the Name', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    fireEvent.change(screen.getByLabelText(/^Slack/i), { target: { value: 'someone else' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Slack name must match/i);
    expect(history.location.pathname).toBe('/hgnform');
  });
});
