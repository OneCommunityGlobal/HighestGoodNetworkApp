import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';

import { getCurrentUser } from '../services/loginService';

jest.mock('../services/loginService');

describe('Login page structure', () => {
  let mountedLogin;
  beforeEach(() => {
    getCurrentUser.__setValue('userNotPresent');
    mountedLogin = shallow(<Login />);
  });

  it('should be rendered with two input fields', () => {
    const inputs = mountedLogin.find('Input');
    expect(inputs.length).toBe(2);
  });

  it('should be rendered with one button', () => {
    const button = mountedLogin.find('button');
    expect(button.length).toBe(1);
  });
  it('should be rendered with one h2', () => {
    const h2 = mountedLogin.find('h2');
    expect(h2.length).toEqual(1);
    expect(h2.first().text()).toContain('Please Sign in');
  });
  // it("should match the snapshot", () => {
  //     expect(mountedLogin).toMatchSnapshot();
  // })
});

describe('When user tries to input data', () => {
  let mountedLoginPage;

  beforeEach(() => {
    getCurrentUser.__setValue('userNotPresent');
    mountedLoginPage = shallow(<Login />);
  });


  it('should call handleInput when input is changed', () => {
    const spy = jest.spyOn(mountedLoginPage.instance(), 'handleInput');
    mountedLoginPage.find("[name='email']").simulate('change', { currentTarget: { name: 'email', value: 'abc' } });
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly update the email value in the state', () => {
    const expected = 'sh@gmail.com';
    const Input = { name: 'email', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent);

    expect(mountedLoginPage.instance().state.data.email).toEqual(expected);
  });

  it('should correctly update the error if the email is not in correct format', () => {
    const expected = 'sh';
    const Input = { name: 'email', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent);
    expect(mountedLoginPage.instance().state.errors.email).toEqual('"Email" must be a valid email');
  });


  it('should correctly update the password value in the state', () => {
    const expected = 'trapp';
    const Input = { name: 'password', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent);

    expect(mountedLoginPage.instance().state.data.password).toEqual(expected);
  });

  it('should correctly update the errors object if the password is empty', () => {
    const expected = '';
    const Input = { name: 'password', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedLoginPage.instance().handleInput(mockEvent);
    expect(mountedLoginPage.instance().state.errors.password).toEqual('"Password" is not allowed to be empty');
  });

  it('should have disabled submit button if form is invalid', () => {
    const button = mountedLoginPage.find('button');
    expect(button.props()).toHaveProperty('disabled');
  });

  it('form can be submitted', () => {
    const callback = jest.fn();
    const mountedLoginPagewithCallBack = shallow(<form onSubmit={callback} />);
    mountedLoginPagewithCallBack.find('form').simulate('submit');
    expect(callback).toHaveBeenCalled();
  });

  it('onSubmit login method is called', async () => {
    const loginService = require('../services/loginService');
    const syplogin = jest.spyOn(loginService, 'login');
    await mountedLoginPage.instance().doSubmit();
    expect(syplogin).toHaveBeenCalled();
  });
});

describe('Login behavior', () => {
  it('should have redirection set to homepage ', () => {
    getCurrentUser.__setValue('userPresent');
    const wrapper = mount(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const redirect = wrapper.find('Redirect');
    expect(redirect.props()).toHaveProperty('to', '/');
  });

  xit('should perform correct redirection if user was redirected to login page from some other location', async () => {
    getCurrentUser.__setValue('userPresent');

    const somepath = '/profile/1234';
    const location = { state: { from: { pathname: somepath } } };
    const wrapper = shallow(
      <MemoryRouter>
        <Login location={location} />
      </MemoryRouter>,
    );
    expect(wrapper.instance().props.location.state.from.pathname).toEqual(
      somepath,
    );
    wrapper.instance().doSubmit();
    console.log(`Location is : ${global.location.pathname}`);
    expect(window.location.pathname).toEqual(somepath);
  });

  it('should populate errors if login fails', async () => {
    const errorMessage = { message: 'Invalid email and/ or password.' };

    const loginService = require('../services/loginService');
    loginService.login = jest.fn(() => {
      throw { response: { status: 403, data: errorMessage } };
    });

    const mountedLoginPage = shallow(<Login />);
    await mountedLoginPage.instance().doSubmit();
    expect(mountedLoginPage.instance().state.errors.email).toEqual(
      errorMessage.message,
    );
  });
});
