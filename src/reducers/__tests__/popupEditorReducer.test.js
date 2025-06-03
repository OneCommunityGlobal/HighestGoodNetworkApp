import { popupEditorReducer } from "../popupEditorReducer";
import * as types from "../../constants/popupEditorConstants";

describe("popupEditorReducer", () => {
  const initialState = {
    fetching: false,
    fetched: false,
    popupItems: [],
    currPopup: {},
    error: '',
  };

  it("should return the initial state when no action is provided", () => {
    expect(popupEditorReducer(undefined, {})).toEqual(initialState);
  });

  it("should handle RECEIVE_POPUP", () => {
    const action = {
      type: types.RECEIVE_POPUP,
      popupItems: [{ id: 1, title: "Popup 1" }],
    };

    const expectedState = {
      ...initialState,
      popupItems: action.popupItems,
      fetched: true,
      fetching: false,
      error: 'none',
    };

    expect(popupEditorReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle CURRENT_POPUP", () => {
    const action = {
      type: types.CURRENT_POPUP,
      currPopup: { id: 1, title: "Popup 1" },
    };

    const expectedState = {
      ...initialState,
      currPopup: action.currPopup,
      fetched: true,
      fetching: false,
      error: 'none',
    };

    expect(popupEditorReducer(initialState, action)).toEqual(expectedState);
  });

  it("should return the current state for an unknown action type", () => {
    const unknownAction = {
      type: "UNKNOWN_ACTION",
    };

    expect(popupEditorReducer(initialState, unknownAction)).toEqual(initialState);
  });
});
