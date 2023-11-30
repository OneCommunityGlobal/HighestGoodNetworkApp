import * as types from "../constants/WBS";

const allWBSInital = {
  fetching: false,
  fetched: false,
  WBSItems: [],
  error: '',
};

export const wbsReducer = (allWBS = allWBSInital, action) => {
  switch (action.type) {
    case types.FETCH_WBS_START:
      return { ...allWBS, fetched: false, fetching: true, error: 'none' };
    case types.FETCH_WBS_ERROR:
      return { ...allWBS, fetched: true, fetching: false, error: action.err };
    case types.RECEIVE_WBS:
      return {
        ...allWBS,
        WBSItems: action.WBSItems,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.ADD_NEW_WBS:
      return { ...allWBS, WBSItems: [action.wbs, ...allWBS.WBSItems] };
    case types.ADD_NEW_WBS_ERROR:
      return { ...allWBS, fetched: true, fetching: false, error: action.err };
    case types.DELETE_WBS:
      const index = allWBS.WBSItems.findIndex(wbs => wbs._id == action.wbsId);
      return {
        ...allWBS,
        WBSItems: [...allWBS.WBSItems.slice(0, index), ...allWBS.WBSItems.slice(index + 1)],
      };
    default:
      return allWBS;
  }
};
