import React from "react";
import Header from "../components/Header";
import { mount } from "enzyme";
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock("../services/loginService");
jest.mock("../services/userProfileService");

import {getCurrentUser} from "../services/loginService";
import {getUserProfile} from "../services/userProfileService";

describe("Header component structure", () => {
	let mountedHeader;
	beforeEach(() => {
		getCurrentUser.__setValue("headerTest");
		getUserProfile.__setValue("userProfile");
        mountedHeader = mount(<Router><Header /></Router>);
    })

	it("should render one nav tag", () => {
		const nav = mountedHeader.find("nav");
		expect(nav.length).toBe(1);
	})

	it("should render with 14 a tags nav tag", () => {
		const aTags = mountedHeader.find("a");
		expect(aTags.length).toBe(14);
	})

	it("should render one button", () => {
		const button = mountedHeader.find("button");
		expect(button.length).toBe(1);
	})

	it("should render one ul tag", () => {
		const ul = mountedHeader.find("ul");
		expect(ul.length).toBe(1);
	})

	it("should render 7 li tags", () => {
		const liTags = mountedHeader.find("li");
		expect(liTags.length).toBe(7);
	})

})