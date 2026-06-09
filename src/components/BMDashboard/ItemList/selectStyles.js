// src/components/BMDashboard/ItemList/selectStyles.js

export const getReactSelectStyles = darkMode => {
  // 1. Centralize the colors into unified layout configurations to destroy duplication
  const theme = {
    bgControl: darkMode ? '#2a3f5f' : undefined,
    bgMenu: darkMode ? '#1c2541' : undefined,
    bgHover: darkMode ? '#3a506b' : undefined,
    bgActive: darkMode ? '#2a3f5f' : undefined,
    border: darkMode ? '#3a506b' : undefined,
    borderHover: darkMode ? '#5a7a9b' : undefined,
    text: darkMode ? '#e0e0e0' : undefined,
    textLight: darkMode ? '#ffffff' : undefined,
  };

  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: theme.bgControl ?? base.backgroundColor,
      borderColor: theme.border ?? base.borderColor,
      color: theme.text ?? base.color,
      boxShadow: state.isFocused && darkMode ? '0 0 0 1px #6af1ea' : base.boxShadow,
      '&:hover': {
        borderColor:
          theme.borderHover ?? (base['&:hover'] ? base['&:hover'].borderColor : base.borderColor),
      },
    }),

    menu: base => ({
      ...base,
      backgroundColor: theme.bgMenu ?? base.backgroundColor,
      border: darkMode ? `1px solid ${theme.border}` : base.border,
    }),

    option: (base, state) => {
      let backgroundColor = base.backgroundColor;
      if (darkMode) {
        if (state.isSelected) backgroundColor = theme.bgHover;
        else if (state.isFocused) backgroundColor = theme.bgActive;
        else backgroundColor = theme.bgMenu;
      }

      return {
        ...base,
        backgroundColor,
        color: theme.text ?? base.color,
        '&:hover': {
          backgroundColor:
            theme.bgHover ??
            (base['&:hover'] ? base['&:hover'].backgroundColor : base.backgroundColor),
        },
      };
    },

    multiValue: base => ({
      ...base,
      backgroundColor: theme.bgHover ?? base.backgroundColor,
    }),

    multiValueLabel: base => ({
      ...base,
      color: theme.textLight ?? base.color,
    }),

    multiValueRemove: base => ({
      ...base,
      color: theme.textLight ?? base.color,
      '&:hover': {
        backgroundColor: theme.borderHover ?? '#e9ecef',
        color: darkMode ? '#ffffff' : '#495057',
      },
    }),

    placeholder: base => ({
      ...base,
      color: darkMode ? '#b5bac5' : base.color,
    }),

    singleValue: base => ({
      ...base,
      color: theme.text ?? base.color,
    }),

    input: base => ({
      ...base,
      color: theme.text ?? base.color,
    }),
  };
};
