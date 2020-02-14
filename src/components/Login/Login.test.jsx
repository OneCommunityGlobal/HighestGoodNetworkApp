import React from "react";
import Enzyme, {
  shallow
} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Login from "./Login";

Enzyme.configure({
  adapter: new Adapter()
});
//test suite
describe("Login", () => {
  //first test case
  it("email text field should show email adress", () => {
    const wrapper = shallow( < Login / > );
    const email = wrapper.find("div form");
    expect(email.text()).toBe("simonxiong11@gmail.com");
  });
});