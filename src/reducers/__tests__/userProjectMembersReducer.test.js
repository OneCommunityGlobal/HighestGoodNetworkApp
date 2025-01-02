import { userProjectMembersReducer } from "../userProjectMembersReducer";

describe("userProjectMembersReducer", () => {
  it("should return the initial state when no action is provided", () => {
    expect(userProjectMembersReducer(undefined, {})).toBe(null);
  });

  it("should handle GET_USER_PROJECT_MEMBERS", () => {
    const action = {
      type: "GET_USER_PROJECT_MEMBERS",
      payload: [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
      ],
    };
    const expectedState = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];
    expect(userProjectMembersReducer(null, action)).toEqual(expectedState);
  });

  it("should return the current state when an unknown action is provided", () => {
    const currentState = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];
    const action = { type: "UNKNOWN_ACTION" };
    expect(userProjectMembersReducer(currentState, action)).toBe(currentState);
  });
});