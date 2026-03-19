/**
 * Shared react-select style factories.
 * Import these wherever a themed <Select> is needed to avoid duplication.
 */

/**
 * Base control/menu/option styles that respond to dark-mode.
 * @param {boolean} darkMode
 * @returns react-select `styles` prop object
 */
export const getBaseSelectStyles = darkMode => ({
  control: base => ({
    ...base,
    backgroundColor: darkMode ? '#343a40' : '#fff',
    borderColor: darkMode ? '#495057' : '#ced4da',
    color: darkMode ? '#fff' : '#000',
    minHeight: 38,
    boxShadow: 'none',
  }),
  singleValue: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
  }),
  input: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
  }),
  placeholder: base => ({
    ...base,
    color: darkMode ? '#adb5bd' : '#6c757d',
  }),
  menu: base => ({
    ...base,
    backgroundColor: darkMode ? '#343a40' : '#fff',
    border: darkMode ? '1px solid #495057' : '1px solid #ced4da',
    zIndex: 10001,
    borderRadius: 8,
    marginTop: 2,
  }),
  menuList: base => ({
    ...base,
    maxHeight: 400,
    overflowY: 'auto',
    backgroundColor: darkMode ? '#343a40' : '#fff',
    color: darkMode ? '#fff' : '#000',
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#0d55b3'
      : state.isFocused
      ? darkMode
        ? '#495057'
        : '#f8f9fa'
      : darkMode
      ? '#343a40'
      : '#fff',
    color: state.isSelected ? '#fff' : darkMode ? '#fff' : '#000',
    fontSize: 13,
    padding: '10px 16px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#0d55b3' : darkMode ? '#495057' : '#c4c8cbff',
      color: darkMode ? '#fff' : '#000',
    },
  }),
});

/**
 * Extended styles for the inline multi-select tool-number picker
 * (fixed 300 px wide, multi-value chips, portal support).
 * @param {boolean} darkMode
 * @returns react-select `styles` prop object
 */
export const getToolPickerSelectStyles = darkMode => ({
  ...getBaseSelectStyles(darkMode),
  container: base => ({
    ...base,
    width: 300,
    minWidth: 300,
    maxWidth: 300,
  }),
  control: base => ({
    ...getBaseSelectStyles(darkMode).control(base),
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  placeholder: base => ({
    ...getBaseSelectStyles(darkMode).placeholder(base),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  singleValue: base => ({
    ...getBaseSelectStyles(darkMode).singleValue(base),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValue: base => ({
    ...base,
    maxWidth: '60%',
    overflow: 'hidden',
    backgroundColor: darkMode ? '#495057' : '#e9ecef',
  }),
  multiValueLabel: base => ({
    ...base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: darkMode ? '#fff' : '#000',
  }),
  multiValueRemove: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
    '&:hover': {
      backgroundColor: darkMode ? '#6c757d' : '#dee2e6',
      color: darkMode ? '#fff' : '#000',
    },
  }),
  indicatorsContainer: base => ({
    ...base,
    flexWrap: 'nowrap',
  }),
  menu: base => ({
    ...getBaseSelectStyles(darkMode).menu(base),
    width: 300,
    minWidth: 300,
    maxWidth: 300,
    zIndex: 9999,
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
});
