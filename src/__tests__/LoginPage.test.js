import React from 'react';
import { shallow, mount } from 'enzyme';
import Login from '../components/Login';
import Input from '../components/common/input'

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

        // let onChange = jest.fn();

        let mountedLoginPage = shallow(<Login>
            <Input  name = "email" label = "Email" value = "shamamm@gmail.com"  /> />
            <Input name = "password" label = "Password" value = "samksjklsmskka"/>
        </Login>)
      
         let mockEvent = {currentTarget:' <input  name = "email" label = "Email" value = "sh@gmail.com"  />'};
         mountedLoginPage.instance().handleChange(mockEvent);
       let button = mountedLoginPage.find("Input")
      console.log(`mountedPage: ${JSON.stringify(mountedLogin.instance().state)}`)
      console.log(`event: ${JSON.stringify(button)}`)
      console.log(`Input : ${button}`)

       expect(mountedLoginPage.instance().state.data.email).toEqual("sh@gmail.com")
        
    })

})

