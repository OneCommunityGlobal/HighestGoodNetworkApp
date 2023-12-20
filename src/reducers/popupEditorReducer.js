import * as types from '../constants/popupEditorConstants';

const allPopupEditorInital = {
  fetching: false,
  fetched: false,
  popupItems: [],
  currPopup: {},
  error: '',
};

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const popupEditorReducer = (allPopup = allPopupEditorInital, action) => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case types.RECEIVE_POPUP:
      return {
        ...allPopup,
        popupItems: action.popupItems,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.CURRENT_POPUP:
      return {
        ...allPopup,
        currPopup: action.currPopup,
        fetched: true,
        fetching: false,
        error: 'none',
      };
  }
  return allPopup;
};
