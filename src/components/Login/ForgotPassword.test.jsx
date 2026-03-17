import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ForgotPassword from './ForgotPassword';

const mockStore = configureMockStore([thunk]);
const store = mockStore({ theme: { darkMode: false } });

const renderComponent = () =>
  render(
    <Provider store={store}>
      <Router>
        <ForgotPassword />
      </Router>
    </Provider>,
  );

describe('ForgotPassword', () => {
  it('renders three input fields (email, first name, last name)', () => {
    renderComponent();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);
  });

  it('renders two buttons (submit + cancel/back)', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('updates the email, first name and last name fields on change', () => {
    renderComponent();
    const [emailInput, firstNameInput, lastNameInput] = screen.getAllByRole('textbox');

    fireEvent.change(emailInput, { target: { value: 'abbc@gmail.com' } });
    expect(emailInput).toHaveValue('abbc@gmail.com');

    fireEvent.change(firstNameInput, { target: { value: 'Test' } });
    expect(firstNameInput).toHaveValue('Test');

    fireEvent.change(lastNameInput, { target: { value: 'Admin' } });
    expect(lastNameInput).toHaveValue('Admin');
  });

  it('submits the form without crashing', () => {
    renderComponent();
    const form = screen.getByTestId('forgot-password-form');
    fireEvent.submit(form); // now triggers validation
  });

  it('shows no error alerts when a valid email is entered', () => {
    renderComponent();
    const emailInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows three error alerts when submitting with all fields empty', async () => {
    renderComponent();
    const submitBtn = screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('First name should not be empty.')).toBeInTheDocument();
    });
    expect(screen.getByText('Last name should not be empty.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });
});
