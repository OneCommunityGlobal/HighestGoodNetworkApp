// src/components/BMDashboard/ItemList/selectStyles.js

export const getReactSelectStyles = (darkMode) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: darkMode ? '#2a3f5f' : base.backgroundColor,
    borderColor: darkMode ? '#3a506b' : base.borderColor,
    color: darkMode ? '#e0e0e0' : base.color,
    boxShadow: state.isFocused
      ? darkMode
        ? '0 0 0 1px #6af1ea'
        : base.boxShadow
      : base.boxShadow,
    '&:hover': {
      borderColor: darkMode
        ? '#5a7a9b'
        : base['&:hover']
        ? base['&:hover'].borderColor
        : base.borderColor,
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#1c2541' : base.backgroundColor,
    border: darkMode ? '1px solid #3a506b' : base.border,
  }),
  option: (base, state) => {
    let backgroundColor = base.backgroundColor;
    if (state.isSelected) {
      backgroundColor = darkMode ? '#3a506b' : base.backgroundColor;
    } else if (state.isFocused) {
      backgroundColor = darkMode ? '#2a3f5f' : base.backgroundColor;
    } else {
      backgroundColor = darkMode ? '#1c2541' : base.backgroundColor;
    }

    return {
      ...base,
      backgroundColor,
      color: darkMode ? '#e0e0e0' : base.color,
      '&:hover': {
        backgroundColor: darkMode
          ? '#3a506b'
          : base['&:hover']
          ? base['&:hover'].backgroundColor
          : base.backgroundColor,
      },
    };
  },
  multiValue: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#3a506b' : base.backgroundColor,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: darkMode ? '#ffffff' : base.color,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: darkMode ? '#ffffff' : base.color,
    '&:hover': {
      backgroundColor: darkMode ? '#5a7a9b' : '#e9ecef',
      color: darkMode ? '#ffffff' : '#495057',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: darkMode ? '#b5bac5' : base.color,
  }),
  singleValue: (base) => ({
    ...base,
    color: darkMode ? '#e0e0e0' : base.color,
  }),
  input: (base) => ({
    ...base,
    color: darkMode ? '#e0e0e0' : base.color,
  }),
});