const initialState = {
  darkMode: false,
};

// eslint-disable-next-line default-param-last
export const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'SET_THEME':
      return {
        ...state,
        darkMode: action.payload,
      };
    default:
      return state;
  }
};

export default themeReducer;
