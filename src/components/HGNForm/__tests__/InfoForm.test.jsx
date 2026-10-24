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
  changeField(/^Name/i, name);
  changeField(/GitHub/i, 'patlee');
  changeField(/^Slack/i, 'Pat Lee');
  fireEvent.click(screen.getByLabelText(/my Slack handle is my first and last name/i));
};

const nameInput = () => screen.getByLabelText(/^Name/i);
const clickNext = () => fireEvent.click(screen.getByRole('button', { name: /next/i }));
const changeField = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const expectBlockedWith = (history, message) => {
  expect(screen.getByRole('alert')).toHaveTextContent(message);
  expect(history.location.pathname).toBe('/hgnform');
};
const NAME_TOO_SHORT = 'Name must be at least 2 characters long.';

describe('InfoForm state retention and validation', () => {
  it('starts with an empty Name and a read-only Email', () => {
    const { ui } = setup();
    render(ui());
    expect(nameInput()).toHaveValue('');
    expect(screen.getByLabelText(/^Email/i)).toHaveValue('a@b.com');
  });

  it('keeps the entered Name, GitHub and Slack after Next then Back', () => {
    const { history, ui } = setup();
    const { unmount } = render(ui());
    expect(nameInput()).toHaveValue('');

    changeField(/^Name/i, 'Bosu Test Name');
    changeField(/GitHub/i, 'patlee');
    changeField(/^Slack/i, 'Bosu Test Name');
    fireEvent.click(screen.getByLabelText(/my Slack handle is my first and last name/i));
    clickNext();

    expect(history.location.pathname).toBe('/hgnform/page2');
    unmount();

    history.goBack();
    render(ui());

    expect(nameInput()).toHaveValue('Bosu Test Name');
    expect(screen.getByLabelText(/GitHub/i)).toHaveValue('patlee');
    expect(screen.getByLabelText(/^Slack/i)).toHaveValue('Bosu Test Name');
    expect(screen.getByLabelText(/^Email/i)).toHaveValue('a@b.com');
  });

  it('keeps a cleared Name empty after remount and explains it on Next', () => {
    const { history, ui } = setup();
    const { unmount } = render(ui());

    changeField(/^Name/i, 'Bosu Test Name');
    changeField(/^Name/i, '');
    fillValid('');
    clickNext();
    expectBlockedWith(history, NAME_TOO_SHORT);
    unmount();

    history.push('/hgnform/page2');
    history.goBack();
    render(ui());

    expect(nameInput()).toHaveValue('');
    clickNext();
    expectBlockedWith(history, NAME_TOO_SHORT);
  });

  it('advances to page 2 when the form is valid', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    clickNext();
    expect(history.location.pathname).toBe('/hgnform/page2');
  });

  it('explains why Next is blocked when required fields are missing', () => {
    const { history, ui } = setup();
    render(ui());
    clickNext();

    expectBlockedWith(history, /GitHub is required/i);
    expectBlockedWith(history, /Slack is required/i);
    expectBlockedWith(history, /confirm that your Slack handle/i);
  });

  it('explains a name that is too short', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    changeField(/^Name/i, 'P');
    clickNext();

    expectBlockedWith(history, /at least 2 characters/i);
  });

  it('explains a Slack name that does not match the Name', () => {
    const { history, ui } = setup();
    render(ui());
    fillValid();
    changeField(/^Slack/i, 'someone else');
    clickNext();

    expectBlockedWith(history, /Slack name must match/i);
  });
});
