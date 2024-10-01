/* eslint-disable */
export const boxStyle = {
  boxShadow: '2px 2px 4px 1px lightgray',
};

export const boxStyleDark = {
  boxShadow: '0.5px 0.5px 5px black',
};

export const getFontColor = (darkMode) => darkMode ? 'text-light' : '';
export const getBoxStyling = (darkMode) => darkMode ? boxStyleDark : boxStyle;