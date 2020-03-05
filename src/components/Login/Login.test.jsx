import React from "react";
import { shallow } from "enzyme";
import { Login } from "./Login";



//test suite
describe("Login", () => {
  let wrapper;
  const mockLoginfn = jest.fn();
  beforeEach(() => {
    wrapper = shallow(<Login login={mockLoginfn} />)
  })
  //first test case
  it('should show Please Sign in', () => {
    wrapper = shallow(<Login login={mockLoginfn} />);
    expect(wrapper.find('h2')).toHaveLength(1);
  });
  //second test case
  it("should show two input field", () => {
    wrapper = shallow(<Login login={mockLoginfn} />);
    const inputs = wrapper.find('Input');
    expect(inputs.length).toBe(2);
  });
  //third test case
  it('should be rendered with one button', () => {
    wrapper = shallow(<Login login={mockLoginfn} />);
    const button = wrapper.find('button');
    expect(button.length).toBe(1);
  });
});