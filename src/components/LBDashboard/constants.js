// Shared constants for LBDashboard components

export const VILLAGE_OPTIONS = [
  'Eco Village',
  'Forest Retreat',
  'Desert Oasis',
  'River Valley',
  'City Sanctuary',
].map(name => ({ value: name, label: name }));

const PROPERTY_OPTIONS_BY_VILLAGE = {
  'Eco Village': ['Mountain View', 'Solar Haven'],
  'Forest Retreat': ['Lakeside Cottage', 'Woodland Cabin'],
  'Desert Oasis': ['Tiny Home', 'Earth Ship'],
  'River Valley': ['Riverside Cabin', 'Floating House'],
  'City Sanctuary': ['Urban Garden Apartment', 'Eco Loft'],
};

export const PROPERTY_OPTIONS = Object.entries(PROPERTY_OPTIONS_BY_VILLAGE).map(
  ([village, properties]) => ({
    label: village,
    options: properties.map(name => ({ value: name, label: name })),
  }),
);

export const getCustomSelectStyles = (darkMode, minHeight = '38px') => ({
  control: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    borderColor: darkMode ? '#225163' : '#ccc',
    color: darkMode ? '#fff' : '#333',
    minHeight,
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    zIndex: 1000,
  }),
  option: (provided, state) => {
    const focusedBg = darkMode ? '#3A506B' : '#f0f0f0';
    const defaultBg = darkMode ? '#1C2541' : '#fff';
    return {
      ...provided,
      backgroundColor: state.isFocused ? focusedBg : defaultBg,
      color: darkMode ? '#fff' : '#333',
    };
  },
  multiValue: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#3A506B' : '#e2e3fc',
  }),
  multiValueLabel: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
  singleValue: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
  input: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
});
