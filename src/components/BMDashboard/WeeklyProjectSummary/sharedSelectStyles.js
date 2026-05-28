/**
 * Shared react-select styles for BMDashboard charts.
 * Single source of truth for dropdown theming so dark mode stays consistent
 * across ExpenseBarChart, FinancialStatButtons, SupplierPerformanceGraph,
 * InjuryCategoryBarChart and others.
 */

function getOptionBackground(state, darkMode) {
  if (state.isSelected || state.isFocused) return '#0d55b3';
  return darkMode ? '#22272e' : '#fff';
}

function getOptionTextColor(state, darkMode) {
  if (state.isSelected || state.isFocused) return '#fff';
  return darkMode ? '#fff' : '#232323';
}

export function buildChartSelectStyles(darkMode) {
  return {
    control: base => ({
      ...base,
      backgroundColor: darkMode ? '#22272e' : '#fff',
      borderColor: darkMode ? '#375071' : '#ccc',
      color: darkMode ? '#fff' : '#232323',
      minHeight: 38,
      fontSize: 12,
      boxShadow: 'none',
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#22272e' : '#fff',
      fontSize: 12,
      zIndex: 10001,
      color: darkMode ? '#fff' : '#232323',
    }),
    menuList: base => ({
      ...base,
      backgroundColor: darkMode ? '#22272e' : '#fff',
      color: darkMode ? '#fff' : '#232323',
      padding: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: getOptionBackground(state, darkMode),
      color: getOptionTextColor(state, darkMode),
      fontSize: 12,
      cursor: 'pointer',
    }),
    singleValue: base => ({
      ...base,
      color: darkMode ? '#fff' : '#232323',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#375071' : '#e2e7ee',
      borderRadius: 4,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#fff' : '#333',
      fontSize: 12,
      padding: '2px 6px',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#fff' : '#333',
      ':hover': { backgroundColor: '#0d55b3', color: '#fff' },
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#aaaaaa' : '#718096',
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#fff' : '#232323',
    }),
  };
}
