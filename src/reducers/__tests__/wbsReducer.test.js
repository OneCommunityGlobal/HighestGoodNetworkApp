import { wbsReducer } from "../wbsReducer";
import * as types from "../../constants/WBS";

describe("wbsReducer", () => {
  const initialState = {
    fetching: false,
    fetched: false,
    WBSItems: [],
    error: '',
  };

  it("should return the initial state when an unknown action is provided", () => {
    expect(wbsReducer(undefined, {})).toEqual(initialState);
  });

  it("should handle FETCH_WBS_START", () => {
    const action = { type: types.FETCH_WBS_START };
    const expectedState = { ...initialState, fetching: true, error: 'none' };
    expect(wbsReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle FETCH_WBS_ERROR", () => {
    const action = { type: types.FETCH_WBS_ERROR, err: "Error fetching WBS" };
    const expectedState = {
      ...initialState,
      fetching: false,
      fetched: true,
      error: "Error fetching WBS",
    };
    expect(wbsReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle RECEIVE_WBS", () => {
    const action = {
      type: types.RECEIVE_WBS,
      WBSItems: [{ id: 1, name: "WBS Item 1" }],
    };
    const expectedState = {
      ...initialState,
      WBSItems: [{ id: 1, name: "WBS Item 1" }],
      fetching: false,
      fetched: true,
      error: 'none',
    };
    expect(wbsReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle ADD_NEW_WBS", () => {
    const action = {
      type: types.ADD_NEW_WBS,
      wbs: { id: 2, name: "New WBS Item" },
    };
    const expectedState = {
      ...initialState,
      WBSItems: [{ id: 2, name: "New WBS Item" }, ...initialState.WBSItems],
    };
    expect(wbsReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle ADD_NEW_WBS_ERROR", () => {
    const action = { type: types.ADD_NEW_WBS_ERROR, err: "Error adding WBS" };
    const expectedState = {
      ...initialState,
      fetching: false,
      fetched: true,
      error: "Error adding WBS",
    };
    expect(wbsReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle DELETE_WBS", () => {
    const currentState = {
      ...initialState,
      WBSItems: [
        { _id: 1, name: "WBS Item 1" },
        { _id: 2, name: "WBS Item 2" },
      ],
    };
    const action = { type: types.DELETE_WBS, wbsId: 1 };
    const expectedState = {
      ...initialState,
      WBSItems: [{ _id: 2, name: "WBS Item 2" }],
    };
    expect(wbsReducer(currentState, action)).toEqual(expectedState);
  });
});
