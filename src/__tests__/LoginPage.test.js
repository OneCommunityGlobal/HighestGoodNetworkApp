import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { getCurrentUser } from '../services/loginService';
import {Login} from '../components/Login/Login.jsx';
import { loginUser } from "../actions/authActions";
import { clearErrors } from "../actions/errorsActions";
import { render } from '@testing-library/react';
import { GET_ERRORS } from '../constants/errors';



describe('Login page structure', () => {
  let mountedLogin, props;
  beforeEach(() => {
    props = ({
      auth: {isAuthenticated: false},
      errors: {},
      "loginUser":  loginUser,
      "clearErrors": clearErrors
    });
    mountedLogin = shallow(<Login {...props} />);
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
  it('should match the snapshot', () => {
    const { asFragment } = render(<Login {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('When user tries to input data', () => {
  let mountedLoginPage, props, loginU;

  beforeEach(() => {
    loginU = jest.fn();
    props = ({
      auth: {isAuthenticated: false},
      errors: {},
      "loginUser":  loginU
    });
    mountedLoginPage = shallow(<Login {...props} />);
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

  it('onSubmit loginPage method is called with credentials', async () => {
    await mountedLoginPage.instance().doSubmit();
    expect(loginU).toHaveBeenCalledWith({email: "", password: ""});
  });
});


describe('Login behavior', () => {
  let props;
  it('should have redirection set to homepage ', () => {
    props = ({
      auth: {isAuthenticated: true},
      errors: {},
      "loginUser":  loginUser,
      history: []
    });
    const wrapper = mount(<Login {...props} />);
    expect(wrapper.instance().props.history).toEqual(['/']);
  });


  xit('should perform correct redirection if user was redirected to login page from some other location', async () => {
    getCurrentUser.__setValue('userPresent');

    const somepath = '/profile/1234';
    const location = { state: { from: { pathname: somepath } } };
    const wrapper = shallow(<MemoryRouter><Login location={location} auth={{isAuthenticated: false}} errors={{}}/></MemoryRouter>);
    expect(wrapper.instance().props.location.state.from.pathname).toEqual(somepath);
    wrapper.instance().doSubmit();
    console.log(`Location is : ${global.location.pathname}`);
    expect(window.location.pathname).toEqual(somepath);
  });

  it('should populate errors if login fails', async () => {
    const expectedAction = {
          type: GET_ERRORS,
          payload: {email: 'Invalid email and/ or password.'}
        };
    let cred = {email: "incorrectEmail", password: "incorrectPassword"};
    let anAction = await loginUser(cred);
    expect((typeof anAction)).toEqual('function');
    const dispatch = jest.fn();
    return anAction(dispatch).finally(()=>{
      expect(dispatch).toBeCalledWith(expectedAction);
    });
    
  });
});


//Mock Store
// {
//   auth: {
//     isAuthenticated: false,
//      "user": {
//       userid: 0,
//     },
//     firstName: "First",  //name
//     profilePic: "/img/blah.jpg" //havent seen what it looks like
//   },
//   errors: {},
//   "loginUser":  loginUser,
//   "clearErrors": clearErrors
// }

