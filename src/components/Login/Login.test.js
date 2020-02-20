import React from "react";
import { shallow } from "enzyme";
import Login from "./Login";


//test suite
describe("Login", () => {
  // first test case
  it("should show text", () => {
    const wrapper = shallow(<Login />);
    const heading = wrapper.find("div h2");
    expect(heading.text()).toBe("Please Sign in");
  });
});