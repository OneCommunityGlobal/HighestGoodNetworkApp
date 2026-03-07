/**
 * Shared utilities for BMDashboard chart components
 * Reduces code duplication across chart components
 */

/**
 * Converts a Date object to YYYY-MM-DD format (no timezone shift)
 * @param {Date} d - Date object to convert
 * @returns {string} Date string in YYYY-MM-DD format or empty string if invalid
 */
export const toYMD = d =>
  d instanceof Date && !isNaN(d)
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
    : '';

/**
 * Generates react-select styles based on dark mode
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {object} options - Optional overrides for default styles
 * @returns {object} react-select styles object
 */
export const getSelectStyles = (darkMode, options = {}) => {
  const {
    minHeight = 38,
    fontSize = 14,
    controlOverrides = {},
    menuOverrides = {},
    optionOverrides = {},
    multiValueOverrides = {},
    multiValueLabelOverrides = {},
    multiValueRemoveOverrides = {},
    singleValueOverrides = {},
    inputOverrides = {},
    placeholderOverrides = {},
    indicatorSeparatorOverrides = {},
    dropdownIndicatorOverrides = {},
    clearIndicatorOverrides = {},
    menuListOverrides = {},
  } = options;

  return {
    control: base => ({
      ...base,
      backgroundColor: darkMode ? '#2b3344' : '#fff',
      borderColor: darkMode ? '#3a506b' : '#ccc',
      color: darkMode ? '#fff' : '#000',
      minHeight,
      boxShadow: 'none',
      borderRadius: 4,
      '&:hover': {
        borderColor: darkMode ? '#4a6072' : '#999',
      },
      ...controlOverrides,
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#2b3344' : '#fff',
      borderColor: darkMode ? '#3a506b' : '#ccc',
      zIndex: 9999,
      ...menuOverrides,
    }),
    menuList: base => ({
      ...base,
      backgroundColor: darkMode ? '#2b3344' : '#fff',
      color: darkMode ? '#fff' : '#000',
      padding: 0,
      ...menuListOverrides,
    }),
    option: (base, state) => {
      let backgroundColor;
      if (state.isSelected) {
        backgroundColor = darkMode ? '#4a6072' : '#0d55b3';
      } else if (state.isFocused) {
        backgroundColor = darkMode ? '#3a506b' : '#deebff';
      } else {
        backgroundColor = darkMode ? '#2b3344' : '#fff';
      }

      const textColor = state.isSelected || darkMode ? '#fff' : '#000';

      return {
        ...base,
        backgroundColor,
        color: textColor,
        cursor: 'pointer',
        fontSize,
        '&:active': {
          backgroundColor: darkMode ? '#4a6072' : '#0d55b3',
        },
        ...optionOverrides,
      };
    },
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#3a506b' : '#e2e7ee',
      borderRadius: 4,
      ...multiValueOverrides,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#fff' : '#333',
      fontSize: 12,
      padding: '2px 6px',
      ...multiValueLabelOverrides,
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#fff' : '#333',
      '&:hover': {
        backgroundColor: darkMode ? '#5a7082' : '#ffbdad',
        color: '#fff',
      },
      borderRadius: 4,
      padding: 2,
      ...multiValueRemoveOverrides,
    }),
    singleValue: base => ({
      ...base,
      color: darkMode ? '#fff' : base.color,
      fontSize,
      ...singleValueOverrides,
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#fff' : base.color,
      fontSize,
      ...inputOverrides,
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#cbd5e0' : '#999',
      fontSize,
      ...placeholderOverrides,
    }),
    indicatorSeparator: base => ({
      ...base,
      backgroundColor: darkMode ? '#3a506b' : '#ccc',
      ...indicatorSeparatorOverrides,
    }),
    dropdownIndicator: base => ({
      ...base,
      color: darkMode ? '#fff' : '#666',
      fontSize,
      '&:hover': {
        color: darkMode ? '#fff' : '#333',
      },
      ...dropdownIndicatorOverrides,
    }),
    clearIndicator: base => ({
      ...base,
      color: darkMode ? '#fff' : '#666',
      '&:hover': {
        color: darkMode ? '#fff' : '#333',
      },
      ...clearIndicatorOverrides,
    }),
  };
};

/**
 * Generates inline styles for react-datepicker DatePicker component
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {object} overrides - Optional style overrides
 * @returns {object} Inline style object for DatePicker
 */
export const getDatePickerStyles = (darkMode, overrides = {}) => ({
  backgroundColor: darkMode ? '#2b3344' : '#fff',
  color: darkMode ? '#fff' : '#000',
  border: `1px solid ${darkMode ? '#3a506b' : '#ccc'}`,
  borderRadius: '4px',
  padding: '0.5rem',
  fontSize: '14px',
  width: '100%',
  ...overrides,
});

/**
 * Generates common props for Recharts XAxis and YAxis components
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {object} overrides - Optional prop overrides
 * @returns {object} Common axis props
 */
export const getChartAxisProps = (darkMode, overrides = {}) => ({
  tick: { fill: darkMode ? '#fff' : '#000', ...(overrides.tick || {}) },
  axisLine: { stroke: darkMode ? '#888' : '#000', ...(overrides.axisLine || {}) },
  tickLine: { stroke: darkMode ? '#888' : '#000', ...(overrides.tickLine || {}) },
  ...overrides,
});

