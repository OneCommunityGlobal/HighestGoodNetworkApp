// Shared constants for LBDashboard components

export const VILLAGE_OPTIONS = [
  { value: 'Eco Village', label: 'Eco Village' },
  { value: 'Forest Retreat', label: 'Forest Retreat' },
  { value: 'Desert Oasis', label: 'Desert Oasis' },
  { value: 'River Valley', label: 'River Valley' },
  { value: 'City Sanctuary', label: 'City Sanctuary' },
];

export const PROPERTY_OPTIONS = [
  {
    label: 'Eco Village',
    options: [
      { value: 'Mountain View', label: 'Mountain View' },
      { value: 'Solar Haven', label: 'Solar Haven' },
    ],
  },
  {
    label: 'Forest Retreat',
    options: [
      { value: 'Lakeside Cottage', label: 'Lakeside Cottage' },
      { value: 'Woodland Cabin', label: 'Woodland Cabin' },
    ],
  },
  {
    label: 'Desert Oasis',
    options: [
      { value: 'Tiny Home', label: 'Tiny Home' },
      { value: 'Earth Ship', label: 'Earth Ship' },
    ],
  },
  {
    label: 'River Valley',
    options: [
      { value: 'Riverside Cabin', label: 'Riverside Cabin' },
      { value: 'Floating House', label: 'Floating House' },
    ],
  },
  {
    label: 'City Sanctuary',
    options: [
      { value: 'Urban Garden Apartment', label: 'Urban Garden Apartment' },
      { value: 'Eco Loft', label: 'Eco Loft' },
    ],
  },
];

export const getCustomSelectStyles = darkMode => ({
  control: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    borderColor: darkMode ? '#225163' : '#ccc',
    color: darkMode ? '#fff' : '#333',
    minHeight: '38px',
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    zIndex: 1000,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? darkMode
        ? '#3A506B'
        : '#f0f0f0'
      : darkMode
      ? '#1C2541'
      : '#fff',
    color: darkMode ? '#fff' : '#333',
  }),
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
