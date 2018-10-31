import React from 'react';
import { shallow } from 'enzyme';
import Login from '../components/Login';
import sinon from 'sinon';

describe("Basic Structure for Login", () => {
    
    let mountedLogin;
    beforeEach(() => {
        mountedLogin = shallow(<Login />);
    })

    it('Login is rendered with two input fields', () => {
        
        const inputs = mountedLogin.find('Input')
        expect(inputs.length).toBe(2)
      });

    it("Login is rendered with one button", () => 
    {
        
        const button = mountedLogin.find("button.btn[disabled]")
        expect(button.length).toBe(1)
        
        
    })
    it("Login is rendered with one h2", () => 
    {
        
        const h2 = mountedLogin.find("h2")
        expect(h2.length).toEqual(1)
        expect(h2.first().text()).toContain("Please Sign in")
        
    })
      
})

describe("When user tries to login", () => {

    let mountedLoginPage;
    let state;

    beforeEach(() => {
        mountedLoginPage = shallow(<Login />);
        })


    it("should correctly update the email value in the state", () => {
        let expected =   "sh@gmail.com"
         let Input =  {name: "email", "value": expected };
         let mockEvent = {currentTarget: Input}
         mountedLoginPage.instance().handleChange(mockEvent);
      
       expect(mountedLoginPage.instance().state.data.email).toEqual(expected)
        
    })

    it("should correctly update the error if the email is not in correct format", () => { 
        let expected =   "sh";            
        let Input =  {name: "email", "value": expected};
        let mockEvent = {currentTarget: Input}
        mountedLoginPage.instance().handleChange(mockEvent);     
      expect(mountedLoginPage.instance().state.errors["email"]).toEqual('"Email" must be a valid email');
   })


   it("should correctly update the password value in the state", () => {
    let expected =   "trapp"
     let Input =  {name: "password", "value": expected };
     let mockEvent = {currentTarget: Input}
     mountedLoginPage.instance().handleChange(mockEvent);
  
   expect(mountedLoginPage.instance().state.data.password).toEqual(expected)
    
})

it("should correctly update the errors object if the password is empty", () => { 
    let expected =   "";            
    let Input =  {name: "password", "value": expected};
    let mockEvent = {currentTarget: Input}
    mountedLoginPage.instance().handleChange(mockEvent);     
  expect(mountedLoginPage.instance().state.errors["password"]).toEqual('"Password" is not allowed to be empty');
})

it("should call doSubmit if all fields were succesfully handled", () => {
       const mockhandleSubmit = sinon.spy()
       let mountedLoginPage = shallow(<Login handleSubmit = {mockhandleSubmit}/> )
        mountedLoginPage.find("form").simulate("submit");
    expect(mockhandleSubmit).toHaveProperty('callCount', 1)

})

})


