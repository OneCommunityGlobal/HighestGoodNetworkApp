import * as types from '../constants/popupEditorConstants';

const allPopupEditorInital = {
  fetching: false,
  fetched: false,
  popupItems: [],
  currPopup: {},
  error: '',
};

// eslint-disable-next-line default-param-last
export const popupEditorReducer = (allPopup = allPopupEditorInital, action) => {
  switch (action.type) {
    case types.RECEIVE_POPUP: {
      return {
        ...allPopup,
        popupItems: action.popupItems,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }
    case types.CURRENT_POPUP: {
      return {
        ...allPopup,
        currPopup: action.currPopup,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }
    default: {
      // Explicit default case for clarity and extensibility
      return allPopup;
    }
  }
};

export default popupEditorReducer;
