import React from "react";
import { shallow } from "enzyme";
import { UserProfile } from "./UserProfile";
import { describe } from "joi";

// work in progress
describe("Upload Photo", () => {
  const props = {

  }


})



// describe("Login form", () => {
//   const props = {
//     auth: [{ isAuthenticated: false }]
//   }
//   const wrapper = shallow(<Login {...props} />)
//   it('should show Please Sign in', () => {
//     expect(wrapper.find('h2')).toHaveLength(1);
//   });
//   it("should show two input field", () => {
//     const inputs = wrapper.find('Input');
//     expect(inputs.length).toBe(2);
//   });
//   it('should show one button', () => {
//     const button = wrapper.find('button');
//     expect(button.length).toBe(1);
//   });
// });

// describe("Submit button", () => {
//   it('should submit form', () => {
//     const mockLoginFn = jest.fn();
//     const mountedLoginPage = shallow(<form onSubmit={mockLoginFn} />)
//     mountedLoginPage.find('form').simulate('submit');
//     expect(mockLoginFn).toHaveBeenCalled();
//   });
// });

