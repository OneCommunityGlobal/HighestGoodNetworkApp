import React from "react";
import { shallow } from "enzyme";
import { Login } from "./Login";

//test suite
describe("Login", () => {

  const props = {
    auth: [{ isAuthenticated: false }]
  }
  const wrapper = shallow(<Login {...props} />)

  it('should show Please Sign in', () => {
    expect(wrapper.find('h2')).toHaveLength(1);
  });
  it("should show two input field", () => {
    const inputs = wrapper.find('Input');
    expect(inputs.length).toBe(2);
  });
  it('should be rendered with one button', () => {
    const button = wrapper.find('button');
    expect(button.length).toBe(1);
  });
  //it should 
});