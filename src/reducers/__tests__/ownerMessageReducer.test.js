import { ownerMessageReducer } from "../ownerMessageReducer";
import * as types from "../../constants/ownerMessageConstants";

describe("ownerMessageReducer", () => {
  const initialState = {
    message: '',
    standardMessage: '',
  };

  it("should return the initial state when no action is provided", () => {
    expect(ownerMessageReducer(undefined, {})).toEqual(initialState);
  });

  it("should handle UPDATE_OWNER_MESSAGE", () => {
    const action = {
      type: types.UPDATE_OWNER_MESSAGE,
      payload: {
        message: "Updated owner message",
        standardMessage: "This is the standard message",
      },
    };

    const expectedState = {
      message: "Updated owner message",
      standardMessage: "This is the standard message",
    };

    expect(ownerMessageReducer(initialState, action)).toEqual(expectedState);
  });

  it("should return the current state for an unknown action type", () => {
    const unknownAction = {
      type: "UNKNOWN_ACTION",
    };

    expect(ownerMessageReducer(initialState, unknownAction)).toEqual(initialState);
  });
});
