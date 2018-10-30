import React from 'react';
import { shallow, mount } from 'enzyme';
import LoginPage from '../Login/LoginPage';
import Input from '../../common/input'



describe("Basic Structure for LoginPage", () => {
    
    let mountedLoginPage;
    beforeEach(() => {
        mountedLoginPage = shallow(<LoginPage />);
    })

    it('LoginPage is rendered with two input fields', () => {
        
        const inputs = mountedLoginPage.find('Input')
        expect(inputs.length).toBe(2)
      });

    it("LoginPage is rendered with one button", () => 
    {
        
        const button = mountedLoginPage.find("button.btn[disabled]")
        expect(button.length).toBe(1)
        
        
    })
    it("LoginPage is rendered with one h2", () => 
    {
        
        const h2 = mountedLoginPage.find("h2")
        expect(h2.length).toEqual(1)
        expect(h2.first().text()).toContain("Please Sign in")
        
    })
      
})

describe("When user tries to login", () => {

    let mountedLoginPage;
    let state;

    beforeEach(() => {
        mountedLoginPage = shallow(<LoginPage />);
        })


    it("should correctly update the email value in the state", () => {

        // let mountedLoginPage = shallow(<LoginPage>
        //     <Input id = "email" name = "email" label = "Email" />
        //     <Input name = "password" label = "Password"/>
        // </LoginPage>)
      
    //     let mockEvent = {target: {name: "email", value: "sh@gmail.com"}}
    //   mountedLoginPage.instance().chooseMap = mockEvent;
       let button = mountedLoginPage.find("Input")
      console.log(`mountedPage: ${JSON.stringify(mountedLoginPage.instance().state)}`)
      console.log(`event: ${JSON.stringify(button)}`)
      console.log(`Input : ${button}`)

        mountedLoginPage.find("#email").simulate('click');
        //mountedLoginPage.find("#password").simulate('change', {target: {value: '12333'}});
        expect(mountedLoginPage.instance().state.data.email).toEqual("sh@gmail.com")
        
    })

})

