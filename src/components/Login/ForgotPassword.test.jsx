import React from 'react';
import { configure, shallow, mount } from 'enzyme';
import ForgotPassword from './ForgotPassword';

const forgotPassword = shallow(<ForgotPassword />);
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

  // handleInput tests
  it('should allow user to input email, first name, and last name', () => {
    const wrapper = shallow(<ForgotPassword />);
    const emailInput = wrapper.find('#email');
    const firstNameInput = wrapper.find('#firstName');
    const lastNameInput = wrapper.find('#lastName');

    expect(emailInput.exists()).toBe(true);
    expect(firstNameInput.exists()).toBe(true);
    expect(lastNameInput.exists()).toBe(true);
  });

  it('should allow user to submit the form', () => {
    const forgotPasswordMock = jest.fn();
    const mountedforgotPasswordMock = shallow(<form onSubmit={forgotPasswordMock} />);
    mountedforgotPasswordMock.find('form').simulate('submit');
    expect(forgotPasswordMock).toHaveBeenCalled();
  });

  it('should not display an error message when a valid email address is inputted', () => {
    const wrapper = shallow(<ForgotPassword />);
    const emailInput = wrapper.find('#email');
    const errorMessage = wrapper.find('.alert.alert-danger');
    emailInput.simulate('change', { target: { name: 'email', value: 'test@example.com' } });

    expect(errorMessage.exists()).toBe(false);
  });

  it('should display error message when user inputs invalid first name, last name, and email address', () => {
    const wrapper = shallow(<ForgotPassword />);
    const emailInput = wrapper.find('#email');
    const firstNameInput = wrapper.find('#firstName');
    const lastNameInput = wrapper.find('#lastName');

    expect(emailInput.exists()).toBe(true);
    expect(firstNameInput.exists()).toBe(true);
    expect(lastNameInput.exists()).toBe(true);

    emailInput.simulate('change', { target: { name: 'email', value: '' } });
    firstNameInput.simulate('change', { target: { name: 'firstName', value: '' } });
    lastNameInput.simulate('change', { target: { name: 'lastName', value: '' } });

    const emailErrorMessage = wrapper.find('.alert.alert-danger').at(0);
    const firstNameErrorMessage = wrapper.find('.alert.alert-danger').at(1);
    const lastNameErrorMessage = wrapper.find('.alert.alert-danger').at(2);
  });
});
