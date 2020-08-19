import React from 'react';
<<<<<<< HEAD
import mockState from './mockAdminState.js'
import { GET_ERRORS } from '../constants/errors';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../utils/URL';
import { render, fireEvent, waitFor, waitForElementToBeRemoved, cleanup} from "@testing-library/react";
import routes from './../routes';
import { Login } from './../components/Login/Login';
import { clearErrors } from "../actions/errorsActions";
const url = ENDPOINTS.LOGIN;

const server = setupServer(
  rest.post(url, (req, res, ctx) =>  {
    if (req.body.email === 'validEmail@gmail.com' && req.body.password === 'validPass') {
      return res(ctx.status(200), ctx.json({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZWRmMTQxYzc4ZjEzODAwMTdiODI5YTYiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMjAtMDgtMjhUMDU6MDA6NTguOTE0WiIsImlhdCI6MTU5NzcyNjg1OH0.zyPNn0laHv0iQONoIczZt1r5wNWlwSm286xDj-eYC4o'}), )
    } else if (req.body.email === 'newUserEmail@gmail.com' && req.body.password === 'validPass'){
      return res(ctx.status(200), ctx.json({new: true, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZWRmMTQxYzc4ZjEzODAwMTdiODI5YTYiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMjAtMDgtMjhUMDU6MDA6NTguOTE0WiIsImlhdCI6MTU5NzcyNjg1OH0.zyPNn0laHv0iQONoIczZt1r5wNWlwSm286xDj-eYC4o'}), )
    } else {
      return res(ctx.status(403), ctx.json({message: 'Invalid email and/ or password.'}), )
    }
  }),  
  rest.get('http://localhost:4500/api/userprofile/*', (req, res, ctx) =>  {
      return res(ctx.status(200), ctx.json({}), )  
  }),
  rest.get('http://localhost:4500/api/dashboard/*', (req, res, ctx) =>  {
    return res(ctx.status(200), ctx.json( [
      {
        "personId": "5edf141c78f1380017b829a6",
        "name": "Dev Admin",
        "weeklyComittedHours": 10,
        "totaltime_hrs": 6,
        "totaltangibletime_hrs": 6,
        "totalintangibletime_hrs": 0,
        "percentagespentintangible": 100,
        "didMeetWeeklyCommitment": false,
        "weeklycommited": 10,
        "tangibletime": 6,
        "intangibletime": 0,
        "tangibletimewidth": 100,
        "intangibletimewidth": 0,
        "tangiblebarcolor": "orange",
        "totaltime": 6
      }]), )  
  }),
  rest.get('*', (req, res, ctx) => {
    console.error(`Please add request handler for ${req.url.toString()} in your MSW server requests.`);
    return res(
      ctx.status(500),
      ctx.json({ error: 'You must add request handler.' }),
    );
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

import { loginUser } from "../actions/authActions";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

mockState.auth.isAuthenticated = false;

describe('Login behavior', () => {
  let loginMountedPage;

  it('should perform correct redirection if user tries to access a proctected route from some other location', async () => {
    
    let rt = '/updatepassword/5edf141c78f1380017b829a6'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;
    
    await waitFor(()=> {
      fireEvent.change(getByLabelText('Email:'), {
        target: {value: 'validEmail@gmail.com'}
      });
      fireEvent.change(getByLabelText('Password:'), {
        target: {value: 'validPass'}
      });
    });

    await waitFor(()=> {
      fireEvent.click(getByText('Submit'))
    });

    await waitFor(()=> {
      expect(getByLabelText('Current Password:')).toBeTruthy();
    });
  });

  it('should redirect to dashboard if no previous redirection', async () => {

    const rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;

    await waitFor(()=> {
      fireEvent.change(getByLabelText('Email:'), {
        target: {value: 'validEmail@gmail.com'}
      });
      
      fireEvent.change(getByLabelText('Password:'), {
        target: {value: 'validPass'}
      });

      fireEvent.click(getByText('Submit'));
    });
    
    await waitFor(()=> {
      expect(getByText(/weekly summaries/i)).toBeTruthy();
      
    });
    await sleep(10);
=======
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
>>>>>>> development
  });

  it('should be rendered with two input fields', () => {
    const inputs = mountedLogin.find('Input');
    expect(inputs.length).toBe(2);
  });

<<<<<<< HEAD
    let rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;
    await sleep(10);
    await waitFor(()=> {  
      fireEvent.change(getByLabelText('Email:'), {
        target: {value: 'newUserEmail@gmail.com'}
      });
      fireEvent.change(getByLabelText('Password:'), {
        target: {value: 'validPass'}
      });
      fireEvent.click(getByText('Submit'));
    });
    await waitFor(()=> { 
      expect(getByLabelText('New Password:')).toBeTruthy();
    });
=======
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
    expect(mountedLogin).toMatchSnapshot();
>>>>>>> development
  });
});

<<<<<<< HEAD
  it('should populate errors if login fails', async () => {
    let rt = '/login'
    const hist = createMemoryHistory({ initialEntries: [rt] });
    loginMountedPage = renderWithRouterMatch(routes , {initialState: mockState, route: rt, history: hist});
    let {getByLabelText, getByText} = loginMountedPage;
    await sleep(10);
    await waitFor(()=> {  
      fireEvent.change(getByLabelText('Email:'), {
        target: {value: 'incorrectEmail@gmail.com'}
      });
      fireEvent.change(getByLabelText('Password:'), {
        target: {value: 'incorrectPassword'}
      });  
      fireEvent.click(getByText('Submit'));
      
    });

    await waitFor(()=> {  
      expect(getByText('Invalid email and/ or password.')).toBeTruthy();
    });
    
    await sleep(10);
  });

  it('should test if loginUser action works correctly', async () => {
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
    
=======
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
>>>>>>> development
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
    const wrapper = mount(<MemoryRouter>
      <Login />
    </MemoryRouter>);

    const redirect = wrapper.find('Redirect');
    expect(redirect.props()).toHaveProperty('to', '/');
  });


  xit('should perform correct redirection if user was redirected to login page from some other location', async () => {
    getCurrentUser.__setValue('userPresent');

    const somepath = '/profile/1234';
    const location = { state: { from: { pathname: somepath } } };
    const wrapper = shallow(<MemoryRouter><Login location={location} /></MemoryRouter>);
    expect(wrapper.instance().props.location.state.from.pathname).toEqual(somepath);
    wrapper.instance().doSubmit();
    console.log(`Location is : ${global.location.pathname}`);
    expect(window.location.pathname).toEqual(somepath);
  });

  it('should populate errors if login fails', async () => {
    const errorMessage = { message: 'Invalid email and/ or password.' };

    const loginService = require('../services/loginService');
    loginService.login = jest.fn(() => {
      throw ({ response: { status: 403, data: errorMessage } });
    });

    const mountedLoginPage = shallow(<Login />);
    await mountedLoginPage.instance().doSubmit();
    expect(mountedLoginPage.instance().state.errors.email).toEqual(errorMessage.message);
  });
});
