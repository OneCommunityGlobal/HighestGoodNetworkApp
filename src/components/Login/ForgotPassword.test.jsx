import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ForgotPassword from './ForgotPassword';

const mockStore = configureMockStore([thunk]);
const store = mockStore({ theme: { darkMode: false } });

describe('ForgotPassword', () => {
  let container;
  beforeEach(() => {
    const rendered = render(
      <Provider store={store}>
        <Router>
          <ForgotPassword />
        </Router>
      </Provider>,
    );
    container = rendered.container;
  });

  it('renders three input fields (email, first name, last name)', () => {
    // Reactstrap <Input> all render as <input role="textbox">
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);
  });

  it('renders two buttons (submit + cancel/back)', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('updates the email, first name and last name fields on change', () => {
    const [emailInput, firstNameInput, lastNameInput] = screen.getAllByRole('textbox');

    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'abbc@gmail.com' },
    });
    expect(emailInput).toHaveValue('abbc@gmail.com');

    fireEvent.change(firstNameInput, {
      target: { name: 'firstName', value: 'Test' },
    });
    expect(firstNameInput).toHaveValue('Test');

    fireEvent.change(lastNameInput, {
      target: { name: 'lastName', value: 'Admin' },
    });
    expect(lastNameInput).toHaveValue('Admin');
  });

  it('submits the form without throwing', () => {
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    // no real handler to spy on, but at least it doesn't crash
    fireEvent.submit(form);
  });

  it('shows no error alerts when a valid email is entered', () => {
    const emailInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'test@example.com' },
    });
    // Reactstrap <Alert color="danger"> has role="alert"
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows three error alerts when submitting with all fields empty', async () => {
    const submitBtn = screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn);
    // now we should get one <Alert role="alert"> per invalid field
    await waitFor(() => {
      const alerts = container.querySelectorAll('.alert-danger');
      expect(alerts).toHaveLength(3);
    });
  });
});
