import { shallow } from "enzyme";
import React from "react";
import Dashboard from "../components/Dashboard";

describe("Dashboard tests", () => {
  let dashBoardMountedPage;
  beforeEach(() => {
    dashBoardMountedPage = shallow(<Dashboard />);
  });

  xit("should render a leaderboard", () => {
    const leaderboard = dashBoardMountedPage.find("Leaderboard").length;
    expect(leaderboard).toBe(1);
  });
});
