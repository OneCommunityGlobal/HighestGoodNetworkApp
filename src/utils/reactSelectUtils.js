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

