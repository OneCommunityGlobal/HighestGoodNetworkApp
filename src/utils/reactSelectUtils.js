/**
 * Utility functions for react-select styling to reduce code duplication
 * and cognitive complexity
 */

/**
 * Get background color for react-select option based on state and theme
 * @param {Object} state - react-select option state (isSelected, isFocused, etc.)
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {string} Background color hex code
 */
export const getOptionBackgroundColor = (state, isDarkMode) => {
  if (state.isSelected) {
    return isDarkMode ? '#e8a71c' : '#0d55b3';
  }
  if (state.isFocused) {
    return isDarkMode ? '#3a506b' : '#f0f0f0';
  }
  return isDarkMode ? '#253342' : '#fff';
};

/**
 * Get text color for react-select option based on state and theme
 * @param {Object} state - react-select option state (isSelected, isFocused, etc.)
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {string} Text color hex code
 */
export const getOptionColor = (state, isDarkMode) => {
  if (state.isSelected) {
    return isDarkMode ? '#000' : '#fff';
  }
  return isDarkMode ? '#ffffff' : '#000';
};

/**
 * Get standardized react-select styles matching paid-labor-cost pattern
 * This reduces code duplication across components
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {Object} react-select styles object
 */
export const getStandardSelectStyles = isDarkMode => ({
  control: base => ({
    ...base,
    minHeight: '38px',
    fontSize: '12px',
    backgroundColor: isDarkMode ? '#253342' : '#fff',
    borderColor: isDarkMode ? '#2d4059' : '#ccc',
    color: isDarkMode ? '#ffffff' : '#000',
    boxShadow: 'none',
    borderRadius: '6px',
    '&:hover': {
      borderColor: isDarkMode ? '#2d4059' : '#999',
    },
  }),
  valueContainer: base => ({
    ...base,
    padding: '2px 8px',
    color: isDarkMode ? '#ffffff' : '#000',
  }),
  input: base => ({
    ...base,
    margin: '0px',
    padding: '0px',
    color: isDarkMode ? '#ffffff' : '#000',
  }),
  indicatorsContainer: base => ({
    ...base,
    padding: '0 4px',
  }),
  menu: base => ({
    ...base,
    backgroundColor: isDarkMode ? '#253342' : '#fff',
    fontSize: '12px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: getOptionBackgroundColor(state, isDarkMode),
    color: getOptionColor(state, isDarkMode),
    cursor: 'pointer',
    padding: '8px 12px',
    fontSize: '12px',
    ':active': {
      backgroundColor: isDarkMode ? '#3a506b' : '#e0e0e0',
    },
  }),
  singleValue: base => ({
    ...base,
    color: isDarkMode ? '#ffffff' : '#000',
    fontSize: '12px',
  }),
  placeholder: base => ({
    ...base,
    color: isDarkMode ? '#aaaaaa' : '#666',
    fontSize: '12px',
  }),
  indicatorSeparator: base => ({
    ...base,
    backgroundColor: isDarkMode ? '#2d4059' : '#ccc',
  }),
  dropdownIndicator: base => ({
    ...base,
    color: isDarkMode ? '#ffffff' : '#999',
    padding: '4px',
    ':hover': {
      color: isDarkMode ? '#ffffff' : '#666',
    },
  }),
});

