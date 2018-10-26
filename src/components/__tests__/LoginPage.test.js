import React from 'react';
import { shallow } from 'enzyme';
import LoginPage from '../Login/LoginPage';



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


    it("should show an error when password is empty", () => {

        let data = {
            email : "12",
            password : ""
        }
        mountedLoginPage.setState({data})
        mountedLoginPage.find("#email").simulate('click');
        //mountedLoginPage.find("#password").simulate('change', {target: {value: '12333'}});
        const errors = mountedLoginPage.find(".alert") || [];
        expect(errors.length).toBe(2)

    })

})

