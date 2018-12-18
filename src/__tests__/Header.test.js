import React from "react";
import Header from "../components/Header";
import { shallow, mount } from "enzyme";

jest.mock("../services/loginService");
jest.mock("../services/userProfileService");

import {getCurrentUser} from "../services/loginService";
import {getUserProfile} from "../services/userProfileService";

describe("Header component structure", () => {
	let mountedHeader;
	beforeEach(() => {
		getCurrentUser.__setValue("headerTest");
		getUserProfile.__setValue("userProfile");
        mountedHeader = mount(<Header />);
    })

	it("should run test", () => {
		console.log(getCurrentUser())
	})

})