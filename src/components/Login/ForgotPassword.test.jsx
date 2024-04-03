import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ForgotPassword from './ForgotPassword';

const mockStore = configureMockStore([thunk]);
const store = mockStore({ theme: { darkMode: false } });

const forgotPassword = mount(
  <Provider store={store}>
    <Router>
      <ForgotPassword />
    </Router>
  </Provider>,
);
describe('ForgotPassword', () => {
  it('should render ForgotPassword with 3 input', () => {
    const inputs = forgotPassword.find('Input');
    expect(inputs.length).toBe(3);
  });
  it('should render ForgotPassword with 2 button', () => {
    const buttons = forgotPassword.find('Button');
    expect(buttons.length).toBe(2);
  });
  it('should trigger onEmailChange while entering email', () => {
    const emailInput = forgotPassword.find('Input').at(0);
    emailInput.simulate('change', { target: { value: 'abbc@gmail.com' } });
  });
  it('should trigger setFirstName while entering email', () => {
    const firstNameInput = forgotPassword.find('Input').at(1);
    firstNameInput.simulate('change', { target: { value: 'Test' } });
  });
  it('should trigger setLastName while entering email', () => {
    const lastNameInput = forgotPassword.find('Input').at(2);
    lastNameInput.simulate('change', { target: { value: 'Admin' } });
  });
});
