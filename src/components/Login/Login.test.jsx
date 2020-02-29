import React from "react";
import { shallow } from "enzyme";
import { Login } from "./Login";

//test suite
describe("Login", () => {
  //first test case
  it('should show Please Sign in', () => {
    const wrapper = shallow(<Login />)
    expect(wrapper.find('h2')).toHaveLength(1);
  });
  //second test case
  it("should show two input field", () => {
    const wrapper = shallow(<Login />)
    const inputs = wrapper.find('Input');
    expect(inputs.length).toBe(2);
  });
  //third test case
  it('should be rendered with one button', () => {
    const wrapper = shallow(<Login />)
    const button = wrapper.find('button');
    expect(button.length).toBe(1);
  });
});