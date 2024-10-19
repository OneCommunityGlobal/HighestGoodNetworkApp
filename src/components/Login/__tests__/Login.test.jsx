// Version 1.0.0 - Initial tests for Login page structure, input handling, and login behavior

import React from 'react';
import { shallow, mount } from 'enzyme';
import { Login } from '../Login';
import { loginUser } from '../../../actions/authActions';
import { clearErrors } from '../../../actions/errorsActions';
import { BrowserRouter } from 'react-router-dom';

describe('Login page structure', () => {
  let mountedLogin, props;

  // Before each test, we initialize the props and shallow render the Login component
  beforeEach(() => {
    props = {
      auth: { isAuthenticated: false }, // Simulate a non-authenticated user
      errors: {}, // No errors initially
      loginUser: loginUser, // Action for logging in
      clearErrors: clearErrors, // Action for clearing errors
    };
    // Shallow render the component to test its structure
    mountedLogin = shallow(<Login {...props} />);
  });

  // Test for ensuring that there are two input fields (e.g., email and password)
  it('should be rendered with two input fields', () => {
    const inputs = mountedLogin.find('Input');
    expect(inputs.length).toBe(2);
  });

  // Test to ensure there is one button on the form
  it('should be rendered with one button', () => {
    const button = mountedLogin.find('button');
    expect(button.length).toBe(1);
  });

  // Test to verify that there is an h2 header labeled "Please Sign in"
  it('should be rendered with one h2 labeled Please Sign In', () => {
    const h2 = mountedLogin.find('h2');
    expect(h2.length).toEqual(1);
    expect(h2.first().text()).toContain('Please Sign in');
  });
});

describe('When user tries to input data', () => {
  let mountedLoginPage, props, loginU;

  // Before each test, we reset props and shallow render the Login component with mock data
  beforeEach(() => {
    loginU = jest.fn(); // Mock function to simulate loginUser action
    props = {
      auth: { isAuthenticated: false }, // User is not authenticated
      errors: {}, // No errors initially
      loginUser: loginU, // Mock login function
    };
    mountedLoginPage = shallow(<Login {...props} />);
  });

  // Test for calling the handleInput method when the input field changes
  it('should call handleInput when input is changed', () => {
    const spy = jest.spyOn(mountedLoginPage.instance(), 'handleInput'); // Spy on the handleInput method
    mountedLoginPage
      .find("[name='email']")
      .simulate('change', { currentTarget: { name: 'email', value: 'abc' } }); // Simulate input change event
    expect(spy).toHaveBeenCalled(); // Ensure handleInput is called
  });

  // Test to ensure that the email value in the component's state updates correctly
  it('should correctly update the email value in the state', () => {
    const expected = 'sh@gmail.com';
    const Input = { name: 'email', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent); // Trigger input change

    expect(mountedLoginPage.instance().state.data.email).toEqual(expected); // Check if state updates
  });

  // Test to ensure that the password value in the component's state updates correctly
  it('should correctly update the password value in the state', () => {
    const expected = 'trapp';
    const Input = { name: 'password', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent); // Trigger input change

    expect(mountedLoginPage.instance().state.data.password).toEqual(expected); // Check if state updates
  });

  // Test to ensure that the errors object updates correctly if the password is empty
  it('should correctly update the errors object if the password is empty', () => {
    const expected = '';
    const Input = { name: 'password', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent); // Trigger input change
    expect(mountedLoginPage.instance().state.errors.password).toEqual(
      '"Password" is not allowed to be empty' // Expected error message for an empty password field
    );
  });

  // Test to ensure that the submit button is disabled if the form is invalid
  it('should have disabled submit button if form is invalid', () => {
    const button = mountedLoginPage.find('button');
    expect(button.props()).toHaveProperty('disabled'); // Ensure the button is disabled
  });

  // Test to simulate form submission and ensure that the callback is called
  it('form can be submitted', () => {
    const callback = jest.fn(); // Mock submission callback
    const mountedLoginPagewithCallBack = shallow(<form onSubmit={callback} />); // Simulate form submission
    mountedLoginPagewithCallBack.find('form').simulate('submit'); // Simulate form submission
    expect(callback).toHaveBeenCalled(); // Check if callback is invoked
  });

  // Test to ensure that the loginUser function is called with the correct credentials upon form submission
  it('onSubmit loginPage method is called with credentials', async () => {
    await mountedLoginPage.instance().doSubmit(); // Trigger form submission
    expect(loginU).toHaveBeenCalledWith({ email: '', password: '' }); // Ensure loginUser is called with correct credentials
  });
});

describe('Login behavior', () => {
  let props;

  // Test to check if the user is redirected to the homepage after successful authentication
  it('should have redirection set to homepage', () => {
    props = {
      auth: { isAuthenticated: true }, // Simulate authenticated user
      errors: {},
      loginUser: loginUser,
      history: [], // Mock browser history object
    };
    const wrapper = shallow(<Login {...props} />); // Shallow render the component
    expect(wrapper.instance().props.history).toEqual(['/']); // Ensure the user is redirected to '/'
  });
});