export const getCustomStyles = (darkMode) => ({
  control: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#2e3440' : '#fff',
    borderColor: darkMode ? '#4c566a' : '#ccc',
    color: darkMode ? '#fff' : '#000',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#2e3440' : '#fff',
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#2e3440' : '#fff',
    maxHeight: '700px',
    overflowY: 'auto',
  }),
  option: (base, selectState) => {
    let backgroundColor;
    if (selectState.isFocused) {
      backgroundColor = darkMode ? '#434c5e' : '#eee';
    } else {
      backgroundColor = darkMode ? '#2e3440' : '#fff';
    }
    return {
      ...base,
      backgroundColor,
      color: darkMode ? '#fff' : '#000',
      cursor: 'pointer',
      fontSize: '13px',
    };
  },
  singleValue: (base) => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: darkMode ? '#4c566a' : '#e6e6e6',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: darkMode ? '#ffffff' : '#333',
    fontWeight: 'bold',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: darkMode ? '#ffffff' : '#333',
    ':hover': {
      backgroundColor: darkMode ? '#bf616a' : '#ffbdad',
      color: 'white',
    },
  }),
  input: (base) => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
  }),
  placeholder: (base) => ({
    ...base,
    color: darkMode ? '#d8dee9' : '#808080',
  }),
});